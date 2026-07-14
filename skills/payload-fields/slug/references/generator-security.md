# Generator security

## Server-only registration

Register callbacks in `payloadFieldsPlugin({ slugGenerators, generateSlugAccess })`. A field receives only `generator: "key"`; never serialize the callback, prompt, API key, or credential into client props.

The plugin appends `POST /payload-fields/generate-slug` after existing endpoints. Check for an application endpoint collision before registration.

## Request pipeline

Required order:

1. require truthy `req.user` (401);
2. run optional access policy (403 when false);
3. parse JSON and require a non-null object;
4. require string generator/sourceValue and optional string currentSlug (400);
5. resolve only an own property in the registered generator map (404);
6. invoke server callback with validated input and `{ req }`;
7. apply final `formatSlug` and return `{ slug }`;
8. suppress generator exceptions as structured 500.

Own-property lookup prevents prototype keys such as `toString` from acting as generators. Null/primitive/missing bodies must return structured invalid input rather than throwing.

## Access policy

Authentication is not authorization. Provide `generateSlugAccess` when a generator has cost, sensitive data, model access, or role restrictions. Use `req` to make server-side decisions; never trust the client key/source alone.

Current access callback exceptions are not normalized by the endpoint. If hardening that path, define a stable fail-closed response and test it before changing public behavior.

## Non-contract controls

The package does not implement rate limiting, CSRF policy, audit logs, generator timeouts, uniqueness, or moderation. Add these at the Payload/deployment/application boundary and document ownership.

The Admin component currently throws failed fetch responses without rendering an error state, and `void generate()` can surface an unhandled rejection. Treat UI error feedback as unfinished until component tests cover it.
