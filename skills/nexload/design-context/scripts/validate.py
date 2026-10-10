#!/usr/bin/env python3
"""Read-only structural and cross-artifact validation of design context bundles."""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import os
from pathlib import Path
import re
import stat
import sys
from collections import defaultdict

FILE_LIMIT = 2 * 1024 * 1024
TOTAL_LIMIT = 32 * 1024 * 1024
SOURCE_LIMIT = 32 * 1024 * 1024
ROOT_NAMES = (
    'manifest', 'sources', 'claims', 'codebase', 'brief', 'brand', 'experience',
    'information-architecture', 'tokens', 'assets', 'unknowns', 'handoff',
)
ID_TYPES = {'claimId': 'c', 'evidenceId': 'e', 'sourceId': 's',
            'pageId': 'p', 'assetId': 'a', 'unknownId': 'u'}
PRESCRIPTION = re.compile(
    r'\b(?:HeroUI|shadcn(?:/ui)?|MUI|Material\s+UI|Radix|Mantine|Ant\s+Design)\s+'
    r'(?:Button|Card|Sheet|Grid|Modal|Dialog|Input|Select|component|primitive|theme)\b'
    r'|\b(?:className|tailwind\s+class(?:es)?)\s*[=:]'
    r'|<\s*(?:div|button|section|input|[A-Z][A-Za-z]+)\b[^>]*>'
    r'|(?:--[a-z][\w-]*\s*:)|\b(?:display|padding|margin|font-size)\s*:\s*[^;]+;',
    re.IGNORECASE,
)

GENERIC_DIRECTION = re.compile(
    r"^(?:(?:modern|clean|beautiful|professional|minimal|user-friendly|and)"
    r"[\s,./&+-]*)+(?:design|interface|experience)?[.!]?$", re.IGNORECASE,
)


def strict_json(raw: bytes):
    def pairs(items):
        result = {}
        for key, value in items:
            if key in result:
                raise ValueError(f'duplicate JSON key: {key}')
            result[key] = value
        return result
    def constant(value):
        raise ValueError(f'non-finite JSON value: {value}')
    def finite_float(value):
        number = float(value)
        if not math.isfinite(number):
            raise ValueError('non-finite JSON numeric value')
        return number
    return json.loads(raw.decode('utf-8'), object_pairs_hook=pairs,
                      parse_constant=constant, parse_float=finite_float)


def no_symlinks(path: Path) -> Path:
    """Check every lexical ancestor before canonicalizing a local path."""
    absolute = Path(os.path.abspath(path))
    for item in (absolute, *absolute.parents):
        if item.is_symlink():
            raise ValueError(f'symlink path prohibited: {item}')
    return absolute.resolve(strict=True)


def pointer(parts):
    return '/' + '/'.join(str(p).replace('~', '~0').replace('/', '~1') for p in parts)


def references(value, schema, definitions, path=()):
    """Yield typed references using schema positions, never string-prefix guesses."""
    ref = schema.get('$ref')
    if ref:
        name = ref.rsplit('/', 1)[-1]
        if name in ID_TYPES and isinstance(value, str):
            yield ID_TYPES[name], value, path
            return
        yield from references(value, definitions[name], definitions, path)
        return
    if isinstance(value, str) and schema.get('pattern', '').startswith('^'):
        match = re.match(r'\^([a-z]+)-', schema['pattern'])
        if match and match[1] in {'x', 'ia', 'sec', 'j', 't'}:
            yield match[1], value, path
    if isinstance(value, dict):
        for key, child in value.items():
            if key in schema.get('properties', {}):
                yield from references(child, schema['properties'][key], definitions, (*path, key))
    elif isinstance(value, list):
        for index, child in enumerate(value):
            yield from references(child, schema.get('items', {}), definitions, (*path, index))
    for option in schema.get('anyOf', []):
        if value is not None:
            yield from references(value, option, definitions, path)


def schema_error_message(issue):
    """Describe constraints without echoing potentially large or private instances."""
    keyword = issue.validator
    message = f'schema {keyword} violation'
    if keyword == 'additionalProperties' and isinstance(issue.instance, dict):
        unexpected = sorted(set(issue.instance) - set(issue.schema.get('properties', {})))
        if unexpected:
            message += ': unexpected fields ' + ', '.join(unexpected)
    elif keyword == 'required' and isinstance(issue.instance, dict):
        missing = sorted(set(issue.validator_value) - set(issue.instance))
        message += ': missing fields ' + ', '.join(missing)
    elif keyword in {'const', 'type', 'enum', 'pattern', 'format', 'minimum', 'maximum',
                     'minItems', 'maxItems', 'minLength', 'maxLength'}:
        message += ': expected ' + json.dumps(issue.validator_value, ensure_ascii=False)
    return message


def cycle_nodes(edges):
    """Kahn elimination avoids recursion limits for large claim/token graphs."""
    degree = {node: 0 for node in edges}
    children = defaultdict(list)
    for node, deps in edges.items():
        for dependency in deps:
            if dependency in degree:
                degree[node] += 1
                children[dependency].append(node)
    pending = [node for node, count in degree.items() if not count]
    while pending:
        node = pending.pop()
        for child in children[node]:
            degree[child] -= 1
            if not degree[child]:
                pending.append(child)
    return sorted(node for node, count in degree.items() if count)


class BundleValidator:
    def __init__(self, folder, roots, schema, validator_class, format_checker):
        self.folder = folder
        self.roots = roots
        self.schema = schema
        self.validator_class = validator_class
        self.format_checker = format_checker
        self.errors = []
        self.data = {}
        self.raw = {}
        self.registry = {}
        self.readiness = 'blocked'

    def error(self, artifact, path, message):
        self.errors.append({'artifact': artifact, 'path': path, 'message': str(message)[:1000]})

    def check(self, condition, artifact, path, message):
        if not condition:
            self.error(artifact, path, message)

    def load(self):
        try:
            self.folder = no_symlinks(self.folder)
            self.check(self.folder.is_dir(), 'bundle', '/', 'bundle must be a directory')
            if not self.folder.is_dir():
                return False
            paths = []
            for base, dirs, files in os.walk(self.folder, followlinks=False):
                for name in dirs + files:
                    candidate = Path(base) / name
                    relative = candidate.relative_to(self.folder).as_posix()
                    if candidate.is_symlink():
                        self.error(relative, '/', 'symlink prohibited')
                        return False
                    if candidate.is_dir():
                        self.check(relative == 'pages', relative, '/', 'unexpected directory')
                    else:
                        if not stat.S_ISREG(candidate.stat().st_mode):
                            self.error(relative, '/', 'only regular artifact files permitted')
                            return False
                        paths.append((relative, candidate))
            root_set = {name + '.json' for name in ROOT_NAMES}
            actual = {name for name, _ in paths}
            self.check(root_set <= actual, 'bundle', '/', f'missing artifacts: {sorted(root_set - actual)}')
            pages = [name for name in actual if re.fullmatch(r'pages/p-[a-z0-9]+(?:-[a-z0-9]+)*\.json', name)]
            self.check(len(pages) <= 512, 'bundle', '/pages', 'at most 512 pages permitted')
            self.check(actual == root_set | set(pages), 'bundle', '/', 'unexpected artifact files')
            if self.errors:
                return False
            total = 0
            for relative, path in sorted(paths):
                size = path.stat().st_size
                total += size
                if size > FILE_LIMIT or total > TOTAL_LIMIT:
                    self.error(relative, '/', 'artifact or bundle size limit exceeded')
                    return False
                raw = path.read_bytes()
                self.raw[relative] = raw
                try:
                    item = strict_json(raw)
                except (ValueError, UnicodeError, RecursionError) as exc:
                    self.error(relative, '/', f'invalid strict JSON: {exc}')
                    continue
                definition = 'page' if relative.startswith('pages/') else relative[:-5]
                schema = {'$schema': self.schema['$schema'], '$defs': self.schema['$defs'],
                          '$ref': '#/$defs/' + definition}
                validator = self.validator_class(schema, format_checker=self.format_checker)
                issues = sorted(validator.iter_errors(item), key=lambda e: pointer(e.absolute_path))
                for issue in issues[:100]:
                    self.error(relative, pointer(issue.absolute_path), schema_error_message(issue))
                self.data[relative] = item
            return not self.errors
        except (OSError, ValueError) as exc:
            self.error('bundle', '/', str(exc))
            return False

    def register(self):
        def add(item, artifact, path):
            identifier = item['id']
            self.check(identifier not in self.registry, artifact, path, f'duplicate ID: {identifier}')
            self.registry[identifier] = item
        collections = [('sources', 'sources'), ('sources', 'evidence'), ('claims', 'claims'),
                       ('unknowns', 'unknowns'), ('unknowns', 'conflicts'), ('assets', 'assets'),
                       ('tokens', 'tokens'), ('experience', 'journeys'), ('information-architecture', 'nodes')]
        for artifact, key in collections:
            for index, item in enumerate(self.data[artifact + '.json'][key]):
                add(item, artifact + '.json', f'/{key}/{index}/id')
        for artifact, item in self.data.items():
            if artifact.startswith('pages/'):
                add(item, artifact, '/id')
                self.check(artifact == f'pages/{item["id"]}.json', artifact, '/id', 'page ID must match filename')
                for index, section in enumerate(item['sections']):
                    add(section, artifact, f'/sections/{index}/id')
        for artifact, item in self.data.items():
            definition = 'page' if artifact.startswith('pages/') else artifact[:-5]
            for kind, identifier, path in references(item, self.schema['$defs'][definition], self.schema['$defs']):
                if path and path[-1] == 'id':
                    continue
                if artifact == 'manifest.json' and len(path) > 1 and path[:2] in {
                    ('changeSummary', 'removedPageIds'), ('changeSummary', 'invalidatedClaims')}:
                    continue
                self.check(identifier in self.registry and identifier.startswith(kind + '-'),
                           artifact, pointer(path), f'dangling {kind} reference: {identifier}')
                if kind == 'c' and identifier in self.registry:
                    claim = self.registry[identifier]
                    if artifact == 'codebase.json':
                        self.check(claim['kind'] == 'fact' and claim['view'] == 'observed', artifact,
                                   pointer(path), 'codebase may reference only observed facts')
                    elif artifact not in {'claims.json', 'unknowns.json', 'manifest.json'}:
                        self.check(claim['disposition'] == 'canonical', artifact, pointer(path),
                                   'design artifacts may reference only canonical claims')
                    elif artifact == 'claims.json' and 'basisIds' in path:
                        self.check(claim['disposition'] == 'canonical', artifact, pointer(path),
                                   'derived claim bases must be canonical')

    def sources(self):
        self.source_map = {s['id']: s for s in self.data['sources.json']['sources']}
        self.evidence_map = {e['id']: e for e in self.data['sources.json']['evidence']}
        local_evidence = defaultdict(list)
        for index, evidence in enumerate(self.evidence_map.values()):
            if evidence['modality'] in {'text', 'metadata'}:
                local_evidence[evidence['sourceId']].append((index, evidence))
        for index, source in enumerate(self.source_map.values()):
            path = f'/sources/{index}'
            self.check((source['type'] == 'inference') == (source['location']['kind'] == 'inference'),
                       'sources.json', path + '/location/kind', 'inference type and location kind must agree')
            if source['location']['kind'] != 'local':
                continue
            try:
                location = Path(source['location']['value'])
                if not location.is_absolute():
                    location = self.roots[0] / location
                resolved = no_symlinks(location)
                if not any(resolved.is_relative_to(root) for root in self.roots):
                    raise ValueError('local source escapes CLI-approved roots')
                if not resolved.is_file():
                    raise ValueError('local source is not a regular file')
                if resolved.stat().st_size > SOURCE_LIMIT:
                    raise ValueError('local source exceeds 32MB verification limit')
                if source['inspection'] == 'inspected':
                    content = resolved.read_bytes()
                    actual = hashlib.sha256(content).hexdigest()
                    self.check(source['fingerprint'] in {actual, 'sha256:' + actual}, 'sources.json',
                               path + '/fingerprint', 'local source sha256 mismatch or missing fingerprint')
                    for evidence_index, evidence in local_evidence[source['id']]:
                        self.check(evidence['excerpt'].encode('utf-8') in content, 'sources.json',
                                   f'/evidence/{evidence_index}/excerpt', 'excerpt not present in verified local source')
            except (ValueError, OSError) as exc:
                if source['inspection'] == 'inspected' or isinstance(exc, ValueError):
                    self.error('sources.json', path + '/location', str(exc))
        for index, evidence in enumerate(self.evidence_map.values()):
            source = self.source_map.get(evidence['sourceId'])
            if not source:
                continue
            self.check(source['inspection'] == 'inspected', 'sources.json', f'/evidence/{index}',
                       'uninspected sources cannot support evidence')

    def claim_sources(self, claim):
        return [self.source_map[e['sourceId']] for eid in claim['evidenceIds']
                if (e := self.evidence_map.get(eid)) and e['sourceId'] in self.source_map]

    def eligible(self, source, domain, view):
        if source['inspection'] != 'inspected' or source['status'] not in {'current', 'historical'}:
            return False
        if source['type'] in {'reference', 'inference', 'previous-context'}:
            return False
        if view == 'required':
            return source['type'] in {'user-request', 'document'} and source['authority'][domain] in {'explicit', 'official'}
        return source['authority'][domain] in {'explicit', 'official', 'primary', 'supporting', 'legacy'}

    def candidate_eligible(self, source, domain, kind):
        if source['inspection'] != 'inspected' or source['status'] not in {'current', 'historical', 'stale'}:
            return False
        allowed = {'document', 'user-request'} if kind == 'requirement' else {'document', 'user-request', 'source-code', 'runtime'}
        return source['type'] in allowed and source['authority'][domain] != 'none'

    def authority_rank(self, source, domain, view):
        kind = 'requirement' if view == 'required' else 'fact'
        if not self.eligible(source, domain, view) and not self.candidate_eligible(source, domain, kind):
            return -1
        rank = {'none': 0, 'legacy': 1, 'supporting': 2, 'primary': 3, 'official': 4, 'explicit': 5}[source['authority'][domain]]
        if source['status'] == 'stale':
            return min(rank, 1)
        if domain == 'behavior' and view == 'observed':
            return 10 if source['type'] in {'runtime', 'source-code'} and source['status'] == 'current' else rank
        if domain == 'brand':
            if source['type'] in {'user-request', 'document'} and rank >= 4:
                return 10 + rank
            if source['type'] == 'brand-asset':
                return 8
            if source['type'] == 'design-token':
                return 7
        return rank

    def claims(self):
        claims = self.data['claims.json']['claims']
        canonical = {}
        design_consumers = set()
        for artifact, item in self.data.items():
            if artifact in {'sources.json', 'codebase.json', 'claims.json', 'unknowns.json', 'manifest.json', 'handoff.json'}:
                continue
            definition = 'page' if artifact.startswith('pages/') else artifact[:-5]
            design_consumers.update(identifier for kind, identifier, _ in references(
                item, self.schema['$defs'][definition], self.schema['$defs']) if kind == 'c')
        self.claim_map = {c['id']: c for c in claims}
        for index, claim in enumerate(claims):
            path = f'/claims/{index}'
            sources = self.claim_sources(claim)
            if claim['kind'] in {'fact', 'requirement'}:
                view = 'required' if claim['kind'] == 'requirement' else claim['view']
                eligible = self.eligible if claim['disposition'] == 'canonical' else None
                supported = all(eligible(source, claim['domain'], view) if eligible else
                                self.candidate_eligible(source, claim['domain'], claim['kind']) for source in sources)
                self.check(bool(sources) and supported, 'claims.json', path + '/evidenceIds',
                           'claim lacks eligible primary evidence')
                self.check(claim['kind'] != 'fact' or claim['view'] == 'observed', 'claims.json',
                           path + '/view', 'facts must describe observed evidence')
                self.check(claim['kind'] != 'requirement' or claim['view'] == 'required', 'claims.json',
                           path + '/view', 'requirements must use required view')
            else:
                if claim['domain'] == 'brand':
                    self.check(not GENERIC_DIRECTION.fullmatch(claim['value'].strip()), 'claims.json',
                               path + '/value', 'derived brand direction needs operational meaning')
                self.check(claim['changePolicy'] != 'locked', 'claims.json', path + '/changePolicy',
                           'derived decisions and assumptions cannot create locked constraints')
                self.check(claim['kind'] != 'assumption' or claim['view'] == 'recommended', 'claims.json',
                           path + '/view', 'assumptions must use recommended view')
                self.check(bool(claim['reason'].strip()) and bool(claim['basisIds'] or claim['evidenceIds']),
                           'claims.json', path, 'derived claims require reason and basis or evidence')
            if claim['disposition'] == 'canonical':
                key = (claim['key'], claim['view'])
                self.check(key not in canonical or canonical[key] == claim['value'], 'claims.json',
                           path + '/value', 'contradictory canonical claims with same key and view')
                canonical[key] = claim['value']
                if claim['id'] in design_consumers:
                    self.check(not PRESCRIPTION.search(claim['value']), 'claims.json', path + '/value',
                               'implementation-specific prescription in canonical design claim')
            for source in sources:
                scopes = source['scope']
                self.check('*' in scopes or self.data['manifest.json']['scopeKey'] in scopes or
                           bool(set(scopes) & set(self.data['manifest.json']['pageIds'])),
                           'claims.json', path + '/evidenceIds', 'evidence source does not cover invocation scope')
        self.check(not cycle_nodes({c['id']: c['basisIds'] for c in claims}), 'claims.json', '/claims', 'cyclic claim bases')
        assumptions = {c['id'] for c in claims if c['kind'] == 'assumption' and c['disposition'] == 'canonical'}
        self.check(set(self.data['brief.json']['assumptions']) == assumptions, 'brief.json', '/assumptions',
                   'brief must register exactly canonical assumptions')
        inferred = set()
        for index, unknown in enumerate(self.data['unknowns.json']['unknowns']):
            linked = [self.claim_map[c] for c in unknown['claimIds'] if c in self.claim_map]
            if unknown['status'] == 'inferred':
                self.check(unknown['classification'] == 'safeToInfer' and bool(linked) and
                           all(c['kind'] == 'assumption' and c['disposition'] == 'canonical' for c in linked),
                           'unknowns.json', f'/unknowns/{index}', 'inferred unknown must link safe canonical assumptions')
                inferred.update(c['id'] for c in linked)
            if unknown['status'] == 'resolved':
                resolution_sources = [self.source_map[evidence['sourceId']] for eid in unknown['evidenceIds']
                                      if (evidence := self.evidence_map.get(eid)) and evidence['sourceId'] in self.source_map]
                self.check(bool(linked or resolution_sources) and
                           all(c['disposition'] == 'canonical' and c['kind'] in {'fact', 'requirement'} for c in linked) and
                           all(source['inspection'] == 'inspected' and source['status'] in {'current', 'historical'} and
                               source['type'] not in {'reference', 'inference', 'previous-context'} for source in resolution_sources),
                           'unknowns.json', f'/unknowns/{index}',
                           'resolved unknown requires primary resolution evidence or canonical facts or requirements')
            if unknown['status'] == 'open':
                self.check(not any(c['disposition'] == 'canonical' for c in linked), 'unknowns.json',
                           f'/unknowns/{index}/claimIds', 'open unknown cannot assert its unresolved claims canonical')
        self.check(assumptions <= inferred, 'unknowns.json', '/unknowns', 'canonical assumptions missing safe inferred unknown register')
        explained = {cid for unknown in self.data['unknowns.json']['unknowns'] for cid in unknown['claimIds']}
        explained.update(cid for conflict in self.data['unknowns.json']['conflicts'] for cid in conflict['claimIds'])
        self.check(all(c['id'] in explained for c in claims if c['disposition'] == 'unresolved'),
                   'claims.json', '/claims', 'unresolved claims must appear in conflict or unknown register')
        for field in ('explicitRequirements', 'explicitExclusions'):
            for cid in self.data['brief.json'][field]:
                claim = self.claim_map.get(cid)
                self.check(claim is not None and claim['kind'] == 'requirement' and claim['changePolicy'] == 'locked',
                           'brief.json', '/' + field, 'explicit requirements and exclusions must be locked requirements')
        for index, conflict in enumerate(self.data['unknowns.json']['conflicts']):
            path = f'/conflicts/{index}'
            linked = [self.claim_map[c] for c in conflict['claimIds'] if c in self.claim_map]
            if len(linked) != len(conflict['claimIds']):
                continue
            if conflict['resolution'] == 'unresolved':
                self.check(conflict['winnerClaimId'] is None and all(c['disposition'] == 'unresolved' for c in linked),
                           'unknowns.json', path, 'unresolved conflicts cannot contain canonical claims or winners')
            elif conflict['resolution'] == 'intentional-change':
                winner = self.claim_map.get(conflict['winnerClaimId'])
                winner_sources = self.claim_sources(winner) if winner else []
                valid_winner = (winner in linked and winner is not None and winner['disposition'] == 'canonical' and
                                winner['kind'] == 'requirement' and winner['view'] == 'required')
                self.check(valid_winner, 'unknowns.json', path + '/winnerClaimId',
                           'intentional-change winner must be canonical required requirement')
                if not valid_winner:
                    continue
                self.check(bool(winner_sources) and all(source['status'] == 'current' and
                           self.eligible(source, conflict['domain'], 'required') for source in winner_sources),
                           'unknowns.json', path, 'intentional change requires current inspected normative evidence')
                self.check(all(c['domain'] == conflict['domain'] and c['key'] == winner['key'] and
                           (c == winner or (c['kind'] == 'fact' and c['view'] == 'observed' and c['disposition'] == 'canonical'))
                           for c in linked), 'unknowns.json', path,
                           'intentional change must preserve canonical observed facts of same domain and key')
            else:
                winner = self.claim_map.get(conflict['winnerClaimId'])
                self.check(winner in linked and winner is not None and winner['disposition'] == 'canonical',
                           'unknowns.json', path + '/winnerClaimId', 'authority winner must be canonical conflict member')
                if winner not in linked or winner is None:
                    continue
                self.check(all(c['domain'] == conflict['domain'] and c['key'] == winner['key'] and c['view'] == winner['view'] for c in linked),
                           'unknowns.json', path, 'authority conflict must compare same domain, key, and view')
                win_rank = max((self.authority_rank(s, conflict['domain'], winner['view']) for s in self.claim_sources(winner)), default=-1)
                for loser in linked:
                    if loser == winner:
                        continue
                    loser_rank = max((self.authority_rank(s, conflict['domain'], loser['view']) for s in self.claim_sources(loser)), default=-1)
                    self.check(loser['disposition'] == 'superseded' and win_rank > loser_rank,
                               'unknowns.json', path, 'authority winner must have strictly stronger eligible domain authority')

    def contracts(self):
        manifest = self.data['manifest.json']
        pages = {v['id']: v for k, v in self.data.items() if k.startswith('pages/')}
        handoff = self.data['handoff.json']
        self.check(set(manifest['artifacts']) == set(self.data), 'manifest.json', '/artifacts', 'artifact inventory must equal exact file set')
        self.check(manifest['sourceRoots'] == [str(root) for root in self.roots], 'manifest.json', '/sourceRoots', 'source roots must exactly equal CLI-approved roots in order')
        self.check(set(manifest['pageIds']) == set(pages) == set(handoff['pageIds']), 'manifest.json', '/pageIds', 'manifest, handoff and page files must agree')
        changes = manifest['changeSummary']
        added, removed = set(changes['addedPageIds']), set(changes['removedPageIds'])
        self.check(added <= set(manifest['pageIds']), 'manifest.json', '/changeSummary/addedPageIds',
                   'added pages must exist in active page inventory')
        self.check(not removed.intersection(manifest['pageIds']), 'manifest.json', '/changeSummary/removedPageIds',
                   'removed pages must be disjoint from active page inventory')
        self.check(not added.intersection(removed), 'manifest.json', '/changeSummary',
                   'added and removed pages must be disjoint')
        self.check(not (removed or changes['invalidatedClaims']) or bool(changes['notes']),
                   'manifest.json', '/changeSummary/notes', 'removals and invalidated prior claims require change notes')
        self.check([p['number'] for p in manifest['phases']] == list(range(14)), 'manifest.json', '/phases', 'phases must be exactly 0 through 13 in order')
        self.check(any(p['number'] == 13 and p['outcome'] == 'complete' for p in manifest['phases']),
                   'manifest.json', '/phases', 'validation phase 13 must be complete for a valid bundle')
        for evidence_id in manifest['requestEvidenceIds']:
            evidence = self.evidence_map.get(evidence_id)
            source = self.source_map.get(evidence['sourceId']) if evidence else None
            self.check(source is not None and source['type'] == 'user-request' and
                       source['location']['kind'] in {'context', 'local'} and source['inspection'] == 'inspected' and
                       source['status'] == 'current' and evidence['modality'] == 'text',
                       'manifest.json', '/requestEvidenceIds', 'request evidence must be current inspected textual user request')
        if manifest['codebaseExists']:
            self.check(self.data['codebase.json']['analysisStatus'] != 'no-code', 'codebase.json', '/analysisStatus', 'existing codebase cannot be skipped')
            self.check(all(p['outcome'] != 'not-applicable' for p in manifest['phases'] if p['number'] in {1, 2}),
                       'manifest.json', '/phases', 'discovery and source analysis required when code exists')
        else:
            self.check(self.data['codebase.json']['analysisStatus'] != 'complete', 'codebase.json', '/analysisStatus', 'absent codebase must report no-code or unavailable')
        unknowns = self.data['unknowns.json']['unknowns']
        open_unknowns = [u for u in unknowns if u['status'] == 'open']
        def matching_unknown(terms):
            return [u for u in open_unknowns if any(term.lower() in u['topic'].lower() for term in terms)]
        core_missing = False
        for field in ('subject', 'product'):
            if self.data['brief.json'][field] is None:
                core_missing = True
                self.check(bool(matching_unknown([field])), 'brief.json', '/' + field,
                           'null core brief field must register matching open unknown')
        brand = self.data['brand.json']
        if brand['state'] == 'established':
            self.check(bool(brand['stateEvidenceIds']), 'brand.json', '/stateEvidenceIds',
                       'established brand must have state evidence')
            for field, terms in [('identity', ['identity', 'brand']), ('typographyDirection', ['typography', 'font']), ('colorStrategy', ['color', 'palette'])]:
                gaps = matching_unknown(terms)
                self.check(bool(brand[field]) or any(u['id'] in brand['unknownIds'] for u in gaps),
                           'brand.json', '/' + field, 'established brand needs known values or registered open gap')
        tokens_artifact = self.data['tokens.json']
        if tokens_artifact['applicability'] == 'not-useful':
            self.check(not tokens_artifact['tokens'], 'tokens.json', '/tokens', 'not-useful tokens must have empty inventory')
        elif tokens_artifact['applicability'] == 'useful':
            self.check(bool(tokens_artifact['tokens']), 'tokens.json', '/tokens', 'useful tokens need inventory')
        else:
            self.check(bool(tokens_artifact['unknownIds']) and any(u['id'] in tokens_artifact['unknownIds'] for u in open_unknowns),
                       'tokens.json', '/unknownIds', 'unknown token applicability must register open unknown')
        code_topics = set(self.schema['$defs']['codebase']['properties']) - {'schemaVersion', 'analysisStatus', 'coverage'}
        required_topics = {'manifest.json': {'requested-docs', 'codebase', 'brand', 'experience', 'ia', 'pages', 'tokens', 'assets'},
                           'codebase.json': code_topics}
        coverage_open = set()
        for artifact in ('manifest.json', 'codebase.json'):
            topics = [c['topic'] for c in self.data[artifact]['coverage']]
            self.check(len(topics) == len(set(topics)) and required_topics[artifact] <= set(topics),
                       artifact, '/coverage', 'coverage topics must be unique and include all mandatory discovery categories')
            for index, entry in enumerate(self.data[artifact]['coverage']):
                self.check((entry['status'] == 'unknown') == (entry['unknownId'] is not None), artifact,
                           f'/coverage/{index}/unknownId', 'unknown coverage must link an unknown; other coverage must not')
                if entry['unknownId'] is not None:
                    unknown = self.registry.get(entry['unknownId'])
                    self.check(unknown is not None and unknown.get('status') == 'open', artifact,
                               f'/coverage/{index}', 'unknown coverage must reference open unknown')
                    coverage_open.add(entry['unknownId'])
                if entry['status'] == 'covered':
                    self.check(bool(entry['evidenceIds']), artifact, f'/coverage/{index}/evidenceIds', 'covered topics require evidence')
        nodes = self.data['information-architecture.json']['nodes']
        routes = defaultdict(list)
        for node in nodes:
            if node['route'] is not None:
                routes[(node['layer'], node['contextKey'], node['route'])].append(node)
        for group in routes.values():
            if len(group) > 1:
                self.check(all(n['duplicateRouteReason'] and self.claim_map.get(n['duplicateRouteReason'], {}).get('disposition') == 'canonical' for n in group),
                           'information-architecture.json', '/nodes', 'duplicate route/context/layer needs canonical justification on each node')
        self.check(not cycle_nodes({n['id']: [n['parentId']] if n['parentId'] else [] for n in nodes}),
                   'information-architecture.json', '/nodes', 'cyclic IA parent hierarchy')
        assets = {a['id']: a for a in self.data['assets.json']['assets']}
        scoped_sources = {}
        def claim_sources_recursive(cid):
            if cid in scoped_sources:
                return scoped_sources[cid]
            seen = set()
            pending = [cid]
            found = {}
            while pending:
                current = pending.pop()
                if current in seen or current not in self.claim_map:
                    continue
                seen.add(current)
                claim = self.claim_map[current]
                found.update((source['id'], source) for source in self.claim_sources(claim))
                pending.extend(claim['basisIds'])
            scoped_sources[cid] = list(found.values())
            return scoped_sources[cid]
        for pid, page in pages.items():
            artifact = f'pages/{pid}.json'
            for kind, cid, claim_path in references(page, self.schema['$defs']['page'], self.schema['$defs']):
                if kind != 'c':
                    continue
                for source in claim_sources_recursive(cid):
                    self.check(bool(set(source['scope']) & {'*', manifest['scopeKey'], pid}), artifact,
                               pointer(claim_path), 'claim evidence including derived bases is outside consuming page scope')
            self.check(any(n['pageId'] == pid and n['route'] == page['route'] and n['layer'] in {'required', 'recommended'} for n in nodes),
                       artifact, '/route', 'page must match required or recommended IA node')
            required = {'default'}
            implications = {'asyncData': {'loading', 'error', 'empty'}, 'mutation': {'loading', 'error', 'success', 'disabled'},
                            'form': {'validation', 'success', 'disabled'},
                            'gated': {'unauthorized', 'forbidden'}, 'destructive': {'destructive-confirmation'}, 'offlineSupported': {'offline'}}
            for capability, states in implications.items():
                if page['capabilities'][capability]:
                    required.update(states)
            actual = [s['name'] for s in page['states']]
            self.check(len(actual) == len(set(actual)) and set(actual) == set(page['stateRequirements']) and required <= set(actual),
                       artifact, '/states', 'states must be unique, match stateRequirements and cover capability implications')
            self.check(not any(page['capabilities'].values()) or bool(page['capabilityEvidenceIds']), artifact,
                       '/capabilityEvidenceIds', 'enabled capabilities require evidence')
            earlier = set()
            for index, section in enumerate(page['sections']):
                self.check(set(section['dependencies']) <= earlier, artifact, f'/sections/{index}/dependencies', 'section dependencies must reference earlier sections on same page')
                earlier.add(section['id'])
            for asset_id in page['assetNeeds']:
                if asset_id in assets:
                    self.check(pid in assets[asset_id]['consumers'], artifact, '/assetNeeds', 'asset consumer relationship must be reciprocal')
        for index, asset in enumerate(assets.values()):
            path = f'/assets/{index}'
            source = self.source_map.get(asset['sourceId'])
            if asset['status'] in {'existing', 'provided'}:
                self.check(source is not None and source['inspection'] == 'inspected' and source['type'] in {'image', 'brand-asset', 'design-token', 'source-code'} and source['status'] == 'current' and source['location']['kind'] in {'local', 'remote'},
                           'assets.json', path + '/sourceId', 'available assets require real current inspected source')
                self.check(bool(asset['evidenceIds']) and any(self.evidence_map.get(e, {}).get('sourceId') == asset['sourceId'] for e in asset['evidenceIds']),
                           'assets.json', path + '/evidenceIds', 'available assets need evidence from their source')
            if asset['licenseKnowledge']['status'] in {'known', 'restricted'}:
                self.check(bool(asset['licenseKnowledge']['evidenceIds']) and bool(asset['licenseKnowledge']['terms']),
                           'assets.json', path + '/licenseKnowledge', 'known/restricted license needs evidence and terms')
                for evidence_id in asset['licenseKnowledge']['evidenceIds']:
                    evidence = self.evidence_map.get(evidence_id)
                    license_source = self.source_map.get(evidence['sourceId']) if evidence else None
                    self.check(license_source is not None and license_source['inspection'] == 'inspected' and
                               license_source['type'] not in {'inference', 'previous-context', 'reference'},
                               'assets.json', path + '/licenseKnowledge', 'license evidence must come from inspected primary source')
            if asset['licenseKnowledge']['status'] == 'unknown' or asset['status'] in {'missing', 'required'}:
                linked_unknowns = [u for u in open_unknowns if u['id'] in asset['unknownIds']]
                self.check(bool(linked_unknowns) and any(not asset['consumers'] or set(asset['consumers']) <= set(u['pageIds']) for u in linked_unknowns),
                           'assets.json', path + '/unknownIds', 'unknown license or missing/required asset needs open unknown covering consumers')
            for pid in asset['consumers']:
                if pid in pages:
                    self.check(asset['id'] in pages[pid]['assetNeeds'], 'assets.json', path + '/consumers', 'consumer must declare corresponding asset need')
        tokens = {t['id']: t for t in self.data['tokens.json']['tokens']}
        for index, token in enumerate(tokens.values()):
            target = tokens.get(token['aliasId'])
            if token['aliasId']:
                self.check(target is not None and target['group'] == token['group'], 'tokens.json', f'/tokens/{index}/aliasId', 'alias must target token in same group')
            claim = self.claim_map.get(token['claimId'])
            if token['value'] is not None and claim:
                self.check(claim['value'] == token['value'], 'tokens.json', f'/tokens/{index}/value', 'token value must equal its claim value')
            self.check(not token['aliasId'] or token['value'] is None, 'tokens.json', f'/tokens/{index}', 'alias token cannot also define value')
        self.check(not cycle_nodes({t['id']: [t['aliasId']] if t['aliasId'] else [] for t in tokens.values()}), 'tokens.json', '/tokens', 'cyclic token aliases')
        canonical = {c['id'] for c in self.claim_map.values() if c['disposition'] == 'canonical'}
        locked = {c for c in canonical if self.claim_map[c]['changePolicy'] == 'locked'}
        self.check(set(handoff['canonicalClaimIds']) == canonical, 'handoff.json', '/canonicalClaimIds', 'handoff must enumerate exactly canonical claims')
        self.check(set(handoff['lockedClaimIds']) == locked, 'handoff.json', '/lockedClaimIds', 'handoff must enumerate exactly locked canonical claims')
        self.check(set(handoff['readOrder']) == set(manifest['artifacts']), 'handoff.json', '/readOrder', 'readOrder must cover every artifact exactly once')
        for source in self.source_map.values():
            if source['status'] in {'unknown', 'unavailable'} or source['inspection'] == 'unavailable':
                visible = any(source['id'] in u['sourceIds'] for u in open_unknowns)
                self.check(visible, 'sources.json', '/sources', 'unavailable/unknown source must be linked by sourceIds in an open unknown')
        opened = {u['id'] for u in unknowns if u['status'] == 'open'}
        conflicts = {c['id'] for c in self.data['unknowns.json']['conflicts'] if c['resolution'] == 'unresolved'}
        self.check(set(handoff['unknownIds']) == opened, 'handoff.json', '/unknownIds', 'handoff must enumerate exactly open unknowns')
        self.check(set(handoff['conflictIds']) == conflicts, 'handoff.json', '/conflictIds', 'handoff must enumerate exactly unresolved conflicts')
        blocked = bool(conflicts) or any(u['status'] == 'open' and u['classification'] in {'blocking', 'requiresHumanDecision'} for u in unknowns)
        blocked = blocked or any(p['outcome'] == 'unavailable' for p in manifest['phases']) or self.data['codebase.json']['analysisStatus'] == 'unavailable'
        conditional = core_missing or bool(coverage_open) or any(u['status'] == 'open' and u['classification'] == 'important' for u in unknowns)
        self.readiness = 'blocked' if blocked else 'conditional' if conditional else 'ready'
        self.check(handoff['readiness'] == self.readiness, 'handoff.json', '/readiness', f'computed readiness is {self.readiness}')
        for artifact, item in self.data.items():
            if artifact in {'sources.json', 'codebase.json', 'claims.json', 'unknowns.json', 'manifest.json'}:
                continue
            self.check(not PRESCRIPTION.search(json.dumps(item)), artifact, '/', 'implementation prescription in canonical artifact')

    def run(self):
        if self.load():
            self.register()
            self.sources()
            self.claims()
            self.contracts()
        digest = hashlib.sha256()
        for name, raw in sorted(self.raw.items()):
            digest.update(name.encode('utf-8') + b'\0' + raw + b'\0')
        if self.errors:
            self.readiness = 'blocked'
        return {'valid': not self.errors, 'errors': self.errors, 'readiness': self.readiness,
                'digest': digest.hexdigest() if self.raw else None}


class JsonArgumentParser(argparse.ArgumentParser):
    def error(self, message):
        print(json.dumps({'valid': False, 'errors': [{'artifact': 'cli', 'path': '/', 'message': message}],
                          'readiness': 'blocked', 'digest': None}))
        raise SystemExit(2)


def main():
    parser = JsonArgumentParser(description=__doc__)
    parser.add_argument('folder', type=Path)
    parser.add_argument('--project-root', type=Path, required=True)
    parser.add_argument('--source-root', type=Path, action='append', default=[])
    parser.add_argument('--require-ready', action='store_true')
    args = parser.parse_args()
    try:
        from jsonschema import Draft202012Validator, FormatChecker
    except ImportError:
        parser.error('missing dependency: install scripts/requirements.txt')
    try:
        roots = [no_symlinks(root) for root in [args.project_root, *args.source_root]]
        if len(set(roots)) != len(roots) or not all(root.is_dir() for root in roots):
            parser.error('CLI source roots must be unique existing directories')
        schema_path = Path(__file__).resolve().parent.parent / 'schemas/context.schema.json'
        schema = strict_json(schema_path.read_bytes())
        def reject_remote(value):
            if isinstance(value, dict):
                if '$ref' in value and not value['$ref'].startswith('#/$defs/'):
                    raise ValueError('schema references must be local $defs')
                for child in value.values():
                    reject_remote(child)
            elif isinstance(value, list):
                for child in value:
                    reject_remote(child)
        reject_remote(schema)
        Draft202012Validator.check_schema(schema)
        result = BundleValidator(args.folder, roots, schema, Draft202012Validator, FormatChecker()).run()
    except (OSError, ValueError, RecursionError) as exc:
        result = {'valid': False, 'errors': [{'artifact': 'bundle', 'path': '/', 'message': str(exc)}],
                  'readiness': 'blocked', 'digest': None}
    print(json.dumps(result, ensure_ascii=False, sort_keys=True))
    return 0 if result['valid'] and (not args.require_ready or result['readiness'] == 'ready') else 1


if __name__ == '__main__':
    sys.exit(main())
