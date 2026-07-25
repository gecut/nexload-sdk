# Endpoint assembly

Pass the same contract to `createPayloadEndpoints`. The handler object mirrors every namespace and operation exactly; missing, extra, non-function, or malformed leaves fail during endpoint creation. Access overrides mirror only leaves that need a different policy and may be partial.

The default base path is normalized by the package; when a custom `basePath` is available in live declarations, configure the client with the same value. Generated operation routes use POST. The current public contract also provides matching OPTIONS behavior when exposed by the installed version; verify the returned endpoint list rather than assuming Payload creates preflight routes.

Empty parsed output returns 204 with no body. Other success returns JSON 200. All responses must pass through Payload's CORS header helper.
