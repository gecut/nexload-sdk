# Collision diagnosis

Payload itself can apply last-wins behavior for duplicate keys, so Nexload rejects collisions before sanitization. Inspect the error `path`, the enabled managed keys, and each extension provider `key`.

For dependency failures, inspect `dependencies`, `dependenciesPriority`, and `dependenciesSoft` on the provider. Do not work around them by exposing or mutating the private registry; correct the provider set.
