# Untyped interop seam

An external CommonJS package declares only `export = plugin`, but two released versions return either the function directly or `{ default: function }`.

Current callers use `(plugin as any).default ?? plugin` in four modules. The runtime function must accept a string and return a string. Invalid module shapes should fail during adapter initialization.

The package cannot be replaced in this task. Design a single adapter that contains any unavoidable assertion and returns a safe `(value: string) => string` contract.
