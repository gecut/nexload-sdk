# Payload compatibility

Direct peers are `payload` and `@payloadcms/richtext-lexical` in `>=3.68.5 <4`. Every installed Payload family package must use the exact same version.

Use only official richtext-lexical exports. Do not depend directly on `lexical` or `@lexical/*`. Verify minimum and latest Payload 3 through packed consumers and a real config containing root and field editors.

Payload owns feature dependency and priority sorting. Nexload owns deterministic input compilation and duplicate rejection.
