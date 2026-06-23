---
title: LLM overview
---

Use the root package for orchestration only. Add runtime/framework/exporter packages explicitly.

Do not add liveness checks for databases, caches, HTTP dependencies, or CPU pressure unless the user explicitly wants process restarts for those failures.
