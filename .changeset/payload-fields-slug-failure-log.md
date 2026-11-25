---
"@nexload-sdk/payload-fields": patch
---

Log slug generator failures once through `req.payload.logger` (`payload_fields.slug.generation_failed`) before responding 500.
