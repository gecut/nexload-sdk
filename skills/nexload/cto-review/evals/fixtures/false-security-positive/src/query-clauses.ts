// Purely internal private helper for static SQL query clause mapping
export type SortOrder = "asc" | "desc";

const ALLOWED_COLUMNS = new Set(["id", "created_at", "updated_at"]);

export function buildStaticOrderBy(column: string, order: SortOrder): string {
  // Safe: validates against hardcoded internal enum set before formatting
  if (!ALLOWED_COLUMNS.has(column)) {
    throw new Error(`Invalid column: ${column}`);
  }
  const dir = order === "asc" ? "ASC" : "DESC";
  return `ORDER BY ${column} ${dir}`;
}
