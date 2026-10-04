# @nexload-sdk/lru-cache

Deterministic, consumer-owned in-memory LRU cache.

## Usage

```typescript
import { LruCache } from "@nexload-sdk/lru-cache";

const cache = new LruCache<string, number>({ maxSize: 100, ttlMs: 60000 });
cache.set("key", 42);
console.log(cache.get("key")); // 42
```
