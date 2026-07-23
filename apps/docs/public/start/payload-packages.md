# Choose a Payload package

Compare Payload Fields, Payload Editor, and Payload Schema by responsibility.

**Topic:** ecosystem
**Canonical page:** https://gecut.github.io/nexload-sdk/start/payload-packages/
| Package | Owns | Does not own |
| --- | --- | --- |
| `@nexload-sdk/payload-fields` | Concrete semantic Payload field factories and matching Admin UI | General schema derivation or editor feature policy |
| `@nexload-sdk/payload-editor` | Semantic Payload Lexical feature and preset configuration | Rich-text fields, frontend rendering, Blocks schemas, or themes |
| `@nexload-sdk/payload-schema` | Canonical field validation compiled into Payload fields and reusable Zod schemas | Collections, access control, populated documents, or CRUD DTO inference |

The packages can be composed, but they do not wrap one another. Keep collection lifecycle, access, drafts, localization, tabs, and application business rules in the Payload application.
