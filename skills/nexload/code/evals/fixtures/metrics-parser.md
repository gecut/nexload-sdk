# Metrics parser request

`packages/example/src/parse-metrics.ts` receives the result of `JSON.parse` from a process probe. Expected input is `{ "samples": [{ "name": "rss", "value": 42 }] }`.

The proposal creates `parseMetrics.ts`, casts the result to `MetricsResponse`, installs lodash for `get`, adds `MetricsParserManager`, `ParserFactory`, and a registry for future formats, then returns `samples[0].value`.

Only the JSON format above is currently required. Missing samples, non-finite values, and wrong shapes must produce the existing `undefined` result. No new public export is requested.
