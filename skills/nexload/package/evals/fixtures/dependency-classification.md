# Dependency classification

A new Payload Admin date component imports `react`, `payload`, and `react-day-picker`. The host app must share React/Payload identity. The date picker is implementation-owned and is not exposed in public props. The package build currently externalizes all three libraries.

Decide dependency/peer ownership and what the packed-consumer smoke must prove.
