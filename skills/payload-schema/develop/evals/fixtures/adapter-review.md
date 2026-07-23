# Package fixture: adapter failures

Canonical gallery fields produce a nested Zod issue at path `[0, "alt"]`. Payload supplies field path `["gallery"]` and request object `req`.

A separate native text schema has an async refinement that returns a Promise only when the value starts with `"remote:"`.

Review task: specify the exact Payload error path and request propagation for the data failure. Then specify when and how the conditional async path becomes a package configuration error without inspecting private Zod metadata.
