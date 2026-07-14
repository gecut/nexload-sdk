# Metric names and labels

## Prometheus names

Metric names replace characters outside `[a-zA-Z0-9_:]` with underscores, collapse repeated underscores, trim underscores, lowercase, then prepend the configured raw prefix. The prefix itself is not normalized or validated; use a known-safe prefix in application configuration.

Keep collector names stable and semantic. Do not encode volatile IDs in metric names.

## Prometheus labels

Allowed labels are:

```text
service, scope, check, component, dependency, runtime,
status, error_code, collector, version
```

Disallowed and empty labels are dropped while the sample remains. Labels are sorted for stable formatting. Default labels and metric labels are merged; current metric labels can override service/scope at runtime, so prevent collisions at the collector boundary.

## HELP descriptions

With `includeDescriptions: true`, built-in series and collector metrics with descriptions emit `# HELP`. Descriptions must be stable and safe text. Do not assume HELP is enabled by default.

## OTel attributes

OTel record conversion copies metric labels verbatim after service/scope attributes. It provides no allowlist, redaction, or cardinality guard, and labels can override base attributes. Audit every label before conversion.

## Cardinality policy

Allow bounded enums and stable component/dependency names. Reject request, trace, user, session, token, raw URL, exception, timestamp, arbitrary tenant, and dynamically discovered resource identifiers unless a bounded explicit allowlist proves safety.

Exporter label behavior is not a substitute for safe collector design.
