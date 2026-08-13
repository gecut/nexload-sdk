# Webhook handler

```ts
const seen = new Set<string>();

export async function handle(req: Request) {
  const body = await req.json() as WebhookEvent;
  console.error("failed webhook", req.headers.get("authorization"), body);
  if (seen.has(body.id)) return;
  seen.add(body.id);
  await dispatch(body.type, body.data);
}
```

Requests are untrusted and handlers may run concurrently or in multiple processes. No retention or cleanup policy exists for `seen`.
