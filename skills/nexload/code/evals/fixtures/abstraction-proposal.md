# Abstraction proposal

A single `fetch` call needs to retry once when the response status is 503. The proposal adds `TransportManager`, `TransportFactory`, `TransportRegistry`, `RetryPlugin`, `BatchPlugin`, and `CachePlugin`, though only the retry behavior is requested.

The repository already uses native `fetch`. There is one caller and no current alternate transport, cache, batch request, or plugin consumer. Public behavior outside the single retry must remain unchanged.
