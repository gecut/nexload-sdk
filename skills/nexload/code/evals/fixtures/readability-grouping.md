# Report readability

Improve readability of `buildReport` only; preserve outputs, calls, ordering, and failure behavior. A neighboring legacy file is outside scope. Existing API names and contracts remain unchanged.

```ts
export async function buildReport(id: string) {
  const record = await loadRecord(id);
  const config = await loadReportConfig(id);
  if (!record) {
    return null;
  }
  const width = config.width;

  const height = config.height;


  const area = width * height;
  if (config.compact) {
    recordLayout(area);
  } else {
    recordLayout(area * 2);
  }
  try {
    await enrichRecord(record);
  } catch (error) {
    recordFailureKind("enrichment");
    throw error;
  } finally {
    releaseReportResources(id);
  }
  const rows = mapRows(record, config);
  return { id, rows };
}
```
