# Runtime split proposal

`@nexload-sdk/session` currently contains runtime-neutral session policy. A change proposes importing `node:crypto`, browser storage, and a Payload Admin React control from the root entrypoint so one factory can expose every environment. The package has Node and browser consumers.

Design the smallest package/entrypoint shape and verification matrix without prebuilding speculative adapters.
