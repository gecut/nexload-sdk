"""Adversarial contract tests; synthetic bundles are not agent evaluation results."""
from __future__ import annotations

import copy
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

from jsonschema import Draft202012Validator, FormatChecker
from validate import BundleValidator, ROOT_NAMES, strict_json

SCHEMA = json.loads((Path(__file__).resolve().parent.parent / 'schemas/context.schema.json').read_text())
VERSION = '1.0.0'


def array_artifact(name):
    properties = SCHEMA['$defs'][name]['properties']
    return {'schemaVersion': VERSION, **{key: [] for key, value in properties.items() if value.get('type') == 'array'}}


def claim(identifier, key, value, **overrides):
    return {'id': identifier, 'key': key, 'domain': 'business', 'kind': 'requirement',
            'view': 'required', 'disposition': 'canonical', 'value': value,
            'evidenceIds': ['e-request'], 'basisIds': [], 'reason': 'Explicit supplied request.',
            'confidence': 'high', 'changePolicy': 'locked', **overrides}


def unknown(identifier='u-gap', **overrides):
    return {'id': identifier, 'topic': 'asset rights', 'question': 'Are rights available?',
            'classification': 'important', 'status': 'open', 'impact': 'Asset publication needs evidence.',
            'pageIds': ['p-guide'], 'sourceIds': [], 'evidenceIds': [], 'claimIds': [],
            'nextAction': 'Obtain the asset rights source.', **overrides}


def bundle(root):
    request = 'Compile a static reading guide named Field Guide for readers. Its task is to explain field observations. No brand or code exists. The default state shows the approved text.'
    request_path = root / 'request.txt'
    request_path.write_text(request)
    authority = {d: 'explicit' for d in ('business', 'behavior', 'brand', 'content', 'technical', 'accessibility')}
    claims = [claim('c-name', 'guide.name', 'Field Guide'),
              claim('c-purpose', 'guide.purpose', 'Explain field observations to readers.'),
              claim('c-question', 'guide.question', 'What do these field observations mean?'),
              claim('c-default', 'guide.default', 'Show the approved text in the default state.')]
    data = {name + '.json': array_artifact(name) for name in ROOT_NAMES}
    data['sources.json'].update(sources=[{'id': 's-request', 'type': 'user-request',
        'location': {'kind': 'local', 'value': 'request.txt'}, 'authority': authority,
        'scope': ['guide'], 'status': 'current', 'inspection': 'inspected',
        'observedAt': '2026-10-10T09:00:00Z', 'fingerprint': hashlib.sha256(request_path.read_bytes()).hexdigest(),
        'notes': 'Synthetic supplied request.'}], evidence=[{'id': 'e-request', 'sourceId': 's-request',
        'locator': 'request.txt:1', 'excerpt': request, 'modality': 'text'}])
    data['claims.json']['claims'] = claims
    data['brief.json'].update(subject='c-name', product='c-name', scope=['c-purpose'], explicitRequirements=['c-default'])
    data['brand.json'].update(state='absent', stateEvidenceIds=['e-request'])
    data['codebase.json']['analysisStatus'] = 'no-code'
    for topic in set(SCHEMA['$defs']['codebase']['properties']) - {'schemaVersion', 'analysisStatus', 'coverage'}:
        data['codebase.json']['coverage'].append({'topic': topic, 'status': 'not-applicable',
            'reason': 'No existing code in this synthetic document-only scenario.', 'evidenceIds': ['e-request'], 'unknownId': None})
    data['tokens.json'].update(applicability='not-useful', reason='No established measurable values; visual design remains open.')
    data['information-architecture.json']['nodes'] = [{'id': 'ia-guide-required', 'pageId': 'p-guide',
        'route': '/guide', 'contextKey': 'default', 'layer': 'required', 'purpose': 'c-purpose',
        'audience': [], 'entryConditions': [], 'parentId': None, 'navigationIds': [],
        'contentHierarchy': [], 'primaryTask': 'c-purpose', 'secondaryTasks': [], 'dataNeeds': [],
        'transitions': [], 'duplicateRouteReason': None}]
    page = array_artifact('page')
    page.update(id='p-guide', route='/guide', name='c-name', purpose='c-purpose', userQuestion='c-question',
        primaryGoal='c-purpose', primaryAction=None, stateRequirements=['default'],
        states=[{'name': 'default', 'condition': 'c-default', 'requirements': ['c-default']}],
        capabilities={k: False for k in ('asyncData', 'form', 'gated', 'destructive', 'offlineSupported', 'mutation')})
    data['pages/p-guide.json'] = page
    artifacts = sorted(data)
    coverage = [{'topic': topic, 'status': 'covered', 'reason': 'Inspected supplied scope; applicability recorded.',
                 'evidenceIds': ['e-request'], 'unknownId': None}
                for topic in ['requested-docs', 'codebase', 'brand', 'experience', 'ia', 'pages', 'tokens', 'assets']]
    data['manifest.json'].update(runId='fixture-1', scopeKey='guide', requestEvidenceIds=['e-request'],
        sourceRoots=[str(root)], codebaseExists=False, pageIds=['p-guide'], artifacts=artifacts,
        phases=[{'number': n, 'outcome': 'complete', 'reason': 'Synthetic scenario inspected.', 'evidenceIds': ['e-request']} for n in range(14)],
        changeSummary={'addedPageIds': ['p-guide'], 'removedPageIds': [], 'invalidatedClaims': [], 'notes': ['Initial synthetic scope.']}, coverage=coverage)
    data['handoff.json'].update(readiness='ready', readOrder=artifacts, pageIds=['p-guide'],
        canonicalClaimIds=[c['id'] for c in claims], lockedClaimIds=[c['id'] for c in claims],
        observedArtifact='codebase.json', creativeFreedom=['Choose composition while preserving reading order.'],
        nextAction='Begin design from the declared reading task.')
    return data


class ValidationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name).resolve()
        self.folder = self.root / '.design-context.next'
        self.data = bundle(self.root)

    def tearDown(self):
        self.temp.cleanup()

    def write(self):
        for name, item in self.data.items():
            target = self.folder / name
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(json.dumps(item, ensure_ascii=False, sort_keys=True) + '\n')

    def validate(self):
        self.write()
        return BundleValidator(self.folder, [self.root], SCHEMA, Draft202012Validator, FormatChecker()).run()

    def invalid(self, phrase):
        result = self.validate()
        self.assertFalse(result['valid'], result)
        self.assertTrue(any(phrase in e['message'] for e in result['errors']), result)

    def add_claim(self, item):
        self.data['claims.json']['claims'].append(item)
        if item['disposition'] == 'canonical':
            self.data['handoff.json']['canonicalClaimIds'].append(item['id'])
            if item['changePolicy'] == 'locked':
                self.data['handoff.json']['lockedClaimIds'].append(item['id'])

    def test_valid_document_only_bundle_and_repeat_digest(self):
        first = self.validate()
        self.assertTrue(first['valid'], first)
        self.assertEqual('ready', first['readiness'])
        self.assertEqual(first['digest'], self.validate()['digest'])

    def test_all_schema_definitions_are_valid(self):
        Draft202012Validator.check_schema(SCHEMA)

    def test_duplicate_keys_nonfinite_and_wrappers_rejected(self):
        for raw in [b'{"a":1,"a":2}', b'{"a":NaN}', b'{"a":1e999}', b'```json\n{}\n```', b'{} trailing']:
            with self.subTest(raw=raw), self.assertRaises(ValueError):
                strict_json(raw)

    def test_missing_extra_files_and_extra_keys(self):
        self.data['brief.json']['rogueInstructions'] = 'Build UI'
        self.invalid('additionalProperties')
        del self.data['brief.json']['rogueInstructions']
        self.write()
        (self.folder / 'untrusted.json').write_text('{}')
        result = BundleValidator(self.folder, [self.root], SCHEMA, Draft202012Validator, FormatChecker()).run()
        self.assertFalse(result['valid'])
        self.assertTrue(any('unexpected' in e['message'] for e in result['errors']))

    def test_unsupported_version(self):
        self.data['brief.json']['schemaVersion'] = '2.0.0'
        self.invalid('const violation')

    def test_typed_scalar_references(self):
        self.data['pages/p-guide.json']['purpose'] = 'c-absent'
        self.invalid('dangling c')

    def test_duplicate_ids(self):
        duplicate = copy.deepcopy(self.data['claims.json']['claims'][0])
        duplicate['reason'] = 'A different record with same identifier.'
        self.data['claims.json']['claims'].append(duplicate)
        self.invalid('duplicate ID')

    def test_changed_source_and_fabricated_excerpt(self):
        self.data['sources.json']['evidence'][0]['excerpt'] = 'Fabricated customer proof'
        self.invalid('excerpt not present')
        self.data = bundle(self.root)
        (self.root / 'request.txt').write_text('Changed after compilation')
        self.invalid('sha256 mismatch')

    def test_untrusted_primary_root(self):
        self.data['manifest.json']['sourceRoots'] = ['/']
        self.invalid('CLI-approved roots')

    def test_source_path_escape_and_symlink(self):
        with tempfile.TemporaryDirectory() as outside:
            outside_file = Path(outside).resolve() / 'request.txt'
            outside_file.write_text('Unapproved evidence')
            self.data['sources.json']['sources'][0]['location']['value'] = str(outside_file)
            self.invalid('escapes CLI-approved roots')
        self.data = bundle(self.root)
        self.write()
        target = self.folder / 'brand.json'
        target.unlink()
        target.symlink_to(self.root / 'request.txt')
        result = BundleValidator(self.folder, [self.root], SCHEMA, Draft202012Validator, FormatChecker()).run()
        self.assertFalse(result['valid'])
        self.assertTrue(any('symlink' in e['message'] for e in result['errors']))

    def test_inference_cannot_be_fact(self):
        source = self.data['sources.json']['sources'][0]
        source.update(type='inference', location={'kind': 'inference', 'value': 'agent conclusion'})
        self.data['claims.json']['claims'][0].update(kind='fact', view='observed')
        self.invalid('eligible primary evidence')

    def test_code_cannot_declare_business_intent(self):
        self.data['sources.json']['sources'][0]['type'] = 'source-code'
        self.invalid('eligible primary evidence')

    def test_canonical_contradiction_and_implementation_prescription(self):
        self.add_claim(claim('c-contradiction', 'guide.purpose', 'Different purpose'))
        self.invalid('contradictory canonical')
        self.data = bundle(self.root)
        self.data['claims.json']['claims'][1]['value'] = 'Use HeroUI Button color=primary'
        self.invalid('implementation-specific prescription')

    def test_observed_library_evidence_is_allowed(self):
        self.add_claim(claim('c-library', 'guide.library', 'HeroUI Button', kind='fact', view='observed', domain='technical', changePolicy='preserve'))
        self.data['codebase.json']['uiLibraries'] = ['c-library']
        self.assertTrue(self.validate()['valid'])

    def test_cyclic_claims(self):
        self.data['claims.json']['claims'][0]['basisIds'] = ['c-purpose']
        self.data['claims.json']['claims'][1]['basisIds'] = ['c-name']
        self.invalid('cyclic claim')

    def test_derived_lock_rejected(self):
        self.data['claims.json']['claims'][1].update(kind='decision', view='recommended')
        self.invalid('cannot create locked')

    def test_existing_code_cannot_be_skipped(self):
        self.data['manifest.json']['codebaseExists'] = True
        self.invalid('cannot be skipped')

    def test_phase_order_and_coverage_cannot_be_skipped(self):
        self.data['manifest.json']['phases'][1]['number'] = 2
        self.data['manifest.json']['phases'][1]['reason'] = 'Incorrect phase order.'
        self.invalid('exactly 0 through 13')
        self.data = bundle(self.root)
        self.data['codebase.json']['coverage'].pop()
        self.invalid('mandatory discovery categories')

    def test_required_states_for_six_scenarios(self):
        scenarios = {'saas': ['asyncData', 'gated'], 'ecommerce': ['asyncData', 'form'],
                     'new': [], 'legacy': ['gated'], 'partial-redesign': ['form', 'destructive'],
                     'weak-request': ['asyncData', 'offlineSupported', 'mutation']}
        implications = {'asyncData': ['loading', 'error', 'empty'], 'form': ['validation', 'success', 'disabled'],
                        'gated': ['unauthorized', 'forbidden'], 'destructive': ['destructive-confirmation'], 'offlineSupported': ['offline'], 'mutation': ['loading', 'error', 'success', 'disabled']}
        for name, flags in scenarios.items():
            with self.subTest(scenario=name):
                self.data = bundle(self.root)
                page = self.data['pages/p-guide.json']
                required = {'default'}
                for flag in flags:
                    page['capabilities'][flag] = True
                    required.update(implications[flag])
                page['capabilityEvidenceIds'] = ['e-request'] if flags else []
                page['stateRequirements'] = sorted(required)
                page['states'] = [{'name': n, 'condition': 'c-default', 'requirements': ['c-default']} for n in sorted(required)]
                self.assertTrue(self.validate()['valid'])
                if flags:
                    page['states'].pop()
                    self.invalid('capability implications')

    def test_ia_duplicate_route_and_dependency_cycle(self):
        node = copy.deepcopy(self.data['information-architecture.json']['nodes'][0])
        node['id'] = 'ia-duplicate'
        self.data['information-architecture.json']['nodes'].append(node)
        self.invalid('duplicate route')
        self.data = bundle(self.root)
        self.data['information-architecture.json']['nodes'][0]['parentId'] = 'ia-guide-required'
        self.invalid('cyclic IA')

    def test_token_alias_cycle(self):
        self.data['tokens.json'].update(applicability='useful', tokens=[
            {'id': a, 'group': 'color', 'semanticRole': a, 'claimId': 'c-default', 'value': None, 'unit': None, 'aliasId': b, 'mode': None}
            for a,b in [('t-one','t-two'),('t-two','t-one')]])
        self.invalid('cyclic token')

    def test_asset_missing_and_license_cannot_be_hidden(self):
        self.data['pages/p-guide.json']['assetNeeds'] = ['a-photo']
        self.data['assets.json']['assets'] = [{'id': 'a-photo', 'kind': 'image', 'status': 'required',
            'semanticRole': 'field-photograph', 'purpose': 'c-purpose', 'sourceId': None, 'evidenceIds': [],
            'licenseKnowledge': {'status': 'unknown', 'evidenceIds': [], 'terms': None}, 'consumers': ['p-guide'],
            'aspectRatio': None, 'composition': [], 'contentRequirements': [], 'responsiveRequirements': [], 'constraints': [], 'unknownIds': []}]
        self.invalid('needs open unknown')
        self.data['unknowns.json']['unknowns'] = [unknown()]
        self.data['assets.json']['assets'][0]['unknownIds'] = ['u-gap']
        self.data['handoff.json'].update(readiness='conditional', unknownIds=['u-gap'])
        result = self.validate()
        self.assertTrue(result['valid'], result)
        self.assertEqual('conditional', result['readiness'])

    def test_open_blocker_and_cli_require_ready(self):
        self.data['unknowns.json']['unknowns'] = [unknown(classification='blocking')]
        self.data['handoff.json'].update(readiness='blocked', unknownIds=['u-gap'])
        result = self.validate()
        self.assertTrue(result['valid'], result)
        command = [sys.executable, str(Path(__file__).with_name('validate.py')), str(self.folder), '--project-root', str(self.root), '--require-ready']
        run = subprocess.run(command, capture_output=True, text=True)
        self.assertEqual(1, run.returncode)
        self.assertTrue(json.loads(run.stdout)['valid'])

    def test_unknown_handoff_is_exact_and_null_core_requires_gap(self):
        self.data['unknowns.json']['unknowns'] = [unknown()]
        self.invalid('exactly open unknowns')
        self.data = bundle(self.root)
        self.data['brief.json']['subject'] = None
        self.invalid('matching open unknown')

    def test_unresolved_conflict_must_not_remain_canonical(self):
        self.add_claim(claim('c-other', 'guide.purpose', 'Other purpose', disposition='unresolved'))
        self.data['unknowns.json']['conflicts'] = [{'id': 'x-purpose', 'domain': 'business', 'claimIds': ['c-purpose', 'c-other'],
            'resolution': 'unresolved', 'winnerClaimId': None, 'reason': 'Ownership unclear.', 'evidenceIds': ['e-request']}]
        self.data['handoff.json'].update(readiness='blocked', conflictIds=['x-purpose'])
        self.invalid('unresolved conflicts cannot')

    def test_removed_ids_are_tombstones(self):
        self.data['manifest.json']['changeSummary'].update(removedPageIds=['p-removed'], invalidatedClaims=['c-removed'])
        self.assertTrue(self.validate()['valid'])

    def test_stale_extra_page_rejected(self):
        self.data['pages/p-stale.json'] = copy.deepcopy(self.data['pages/p-guide.json'])
        self.data['pages/p-stale.json']['id'] = 'p-stale'
        self.invalid('artifact inventory')


    def source(self, identifier, text, source_type='document', status='current', standing='official'):
        path = self.root / (identifier + '.txt')
        path.write_text(text)
        original = copy.deepcopy(self.data['sources.json']['sources'][0])
        original.update(id=identifier, type=source_type, status=status,
            location={'kind': 'local', 'value': path.name}, fingerprint=hashlib.sha256(path.read_bytes()).hexdigest(),
            authority={k: standing for k in original['authority']})
        self.data['sources.json']['sources'].append(original)
        eid = 'e-' + identifier[2:]
        self.data['sources.json']['evidence'].append({'id': eid, 'sourceId': identifier, 'locator': path.name + ':1', 'excerpt': text, 'modality': 'text'})
        return eid

    def test_historical_requirement_can_be_preserved_and_superseded(self):
        eid = self.source('s-legacy', 'Historical brief requires name Field Notes.', status='historical', standing='legacy')
        self.add_claim(claim('c-legacy', 'guide.name', 'Field Notes', disposition='superseded', evidenceIds=[eid]))
        self.data['unknowns.json']['conflicts'] = [{'id': 'x-name', 'domain': 'business', 'claimIds': ['c-name', 'c-legacy'],
            'resolution': 'authority', 'winnerClaimId': 'c-name', 'reason': 'Current explicit name overrides the old brief.', 'evidenceIds': ['e-request', eid]}]
        result = self.validate()
        self.assertTrue(result['valid'], result)

    def test_intentional_change_retains_current_observation(self):
        eid = self.source('s-current', 'Current title is Field Notes.', source_type='source-code', standing='primary')
        self.add_claim(claim('c-current', 'guide.name', 'Field Notes', kind='fact', view='observed', evidenceIds=[eid], changePolicy='preserve'))
        self.data['codebase.json']['application'] = ['c-current']
        self.data['unknowns.json']['conflicts'] = [{'id': 'x-name', 'domain': 'business', 'claimIds': ['c-name', 'c-current'],
            'resolution': 'intentional-change', 'winnerClaimId': 'c-name', 'reason': 'Requested new title differs from current title.', 'evidenceIds': ['e-request', eid]}]
        result = self.validate()
        self.assertTrue(result['valid'], result)
        self.assertEqual('canonical', self.data['claims.json']['claims'][-1]['disposition'])

    def test_previous_context_cannot_resolve_unknown(self):
        eid = self.source('s-old', 'Prior agent claimed rights approved.', source_type='previous-context', standing='none')
        self.data['unknowns.json']['unknowns'] = [unknown(status='resolved', evidenceIds=[eid])]
        self.invalid('resolution evidence')

    def test_derived_decision_cannot_resolve_factual_unknown(self):
        self.add_claim(claim('c-proposal', 'guide.rights', 'Assume rights available.', kind='decision', view='recommended', changePolicy='open', basisIds=['c-purpose']))
        self.data['unknowns.json']['unknowns'] = [unknown(status='resolved', claimIds=['c-proposal'])]
        self.invalid('facts or requirements')

    def test_removal_cannot_include_active_page(self):
        self.data['manifest.json']['changeSummary'].update(removedPageIds=['p-guide'], notes=['Erroneous active removal.'])
        self.invalid('removed')

    def test_invalidation_may_retain_regenerated_stable_claim(self):
        self.data['manifest.json']['changeSummary'].update(invalidatedClaims=['c-name'], notes=['Prior name version regenerated under stable key.'])
        self.assertTrue(self.validate()['valid'])

    def test_unavailable_source_is_visible_and_not_factual(self):
        original = copy.deepcopy(self.data['sources.json']['sources'][0])
        original.update(id='s-unavailable', type='figma', location={'kind': 'remote', 'value': 'figma:unavailable'}, inspection='unavailable', status='unavailable', fingerprint=None)
        self.data['sources.json']['sources'].append(original)
        self.invalid('open unknown')
        self.data['unknowns.json']['unknowns'] = [unknown(sourceIds=['s-unavailable'])]
        self.data['handoff.json'].update(readiness='conditional', unknownIds=['u-gap'])
        self.assertTrue(self.validate()['valid'])

    def test_oversize_artifact_rejected(self):
        self.write()
        (self.folder / 'brief.json').write_bytes(b' ' * (2 * 1024 * 1024 + 1))
        result = BundleValidator(self.folder, [self.root], SCHEMA, Draft202012Validator, FormatChecker()).run()
        self.assertFalse(result['valid'])
        self.assertTrue(any('size limit' in e['message'] for e in result['errors']))



    def test_generic_derived_brand_direction_rejected(self):
        self.add_claim(claim('c-brand', 'guide.visual-direction', 'Modern and clean interface.', domain='brand', kind='decision', view='recommended', changePolicy='open', basisIds=['c-purpose']))
        self.data['brand.json']['visualDirection'] = ['c-brand']
        self.invalid('operational meaning')


if __name__ == '__main__':
    unittest.main()
