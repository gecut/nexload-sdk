import { toEnglishDigits } from "../digits";
export function slugify(input: string | number | null | undefined): string {
  return toEnglishDigits((typeof input === "string" || typeof input === "number" ? String(input) : "").normalize("NFKC"))
    .replace(/[يى]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[\u064b-\u065f\u0670]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
