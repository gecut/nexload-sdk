# Refresh ownership

The following internal service is running in two processes. Each caller must wait for completion and observe persistence failures. Concurrent refreshes in the same process should share the running operation. There is no caller cancellation API. `fetchAndPersist` already uses the owning store's transaction plus unique version constraint, atomically rejecting stale updates; it has no external write effects. Preserve those contracts.

```ts
const inFlight = new Map<string, Promise<void>>();

export async function refresh(id: string) {
  if (inFlight.has(id)) return;
  const work = fetchAndPersist(id).catch(() => undefined);
  inFlight.set(id, work);
  void work.finally(() => inFlight.delete(id));
}
```

Correct the service and state the decisive checks. Do not alter the store implementation or add infrastructure.
