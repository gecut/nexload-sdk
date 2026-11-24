import { toSearchKey } from "../text";
export const IRAN_PROVINCES = [
  { code: "tehran", nameFa: "تهران", nameEn: "Tehran" },
  { code: "alborz", nameFa: "البرز", nameEn: "Alborz" },
  { code: "isfahan", nameFa: "اصفهان", nameEn: "Isfahan" },
  { code: "fars", nameFa: "فارس", nameEn: "Fars" },
  { code: "khorasan-razavi", nameFa: "خراسان رضوی", nameEn: "Razavi Khorasan" },
  {
    code: "east-azerbaijan",
    nameFa: "آذربایجان شرقی",
    nameEn: "East Azerbaijan",
  },
  {
    code: "west-azerbaijan",
    nameFa: "آذربایجان غربی",
    nameEn: "West Azerbaijan",
  },
  { code: "ardabil", nameFa: "اردبیل", nameEn: "Ardabil" },
  { code: "gilan", nameFa: "گیلان", nameEn: "Gilan" },
  { code: "mazandaran", nameFa: "مازندران", nameEn: "Mazandaran" },
  { code: "golestan", nameFa: "گلستان", nameEn: "Golestan" },
  { code: "qazvin", nameFa: "قزوین", nameEn: "Qazvin" },
  { code: "zanjan", nameFa: "زنجان", nameEn: "Zanjan" },
  { code: "qom", nameFa: "قم", nameEn: "Qom" },
  { code: "markazi", nameFa: "مرکزی", nameEn: "Markazi" },
  { code: "hamadan", nameFa: "همدان", nameEn: "Hamadan" },
  { code: "kurdistan", nameFa: "کردستان", nameEn: "Kurdistan" },
  { code: "kermanshah", nameFa: "کرمانشاه", nameEn: "Kermanshah" },
  { code: "ilam", nameFa: "ایلام", nameEn: "Ilam" },
  { code: "lorestan", nameFa: "لرستان", nameEn: "Lorestan" },
  { code: "khuzestan", nameFa: "خوزستان", nameEn: "Khuzestan" },
  {
    code: "chaharmahal-bakhtiari",
    nameFa: "چهارمحال و بختیاری",
    nameEn: "Chaharmahal and Bakhtiari",
  },
  {
    code: "kohgiluyeh-boyer-ahmad",
    nameFa: "کهگیلویه و بویراحمد",
    nameEn: "Kohgiluyeh and Boyer-Ahmad",
  },
  { code: "bushehr", nameFa: "بوشهر", nameEn: "Bushehr" },
  { code: "hormozgan", nameFa: "هرمزگان", nameEn: "Hormozgan" },
  { code: "kerman", nameFa: "کرمان", nameEn: "Kerman" },
  { code: "yazd", nameFa: "یزد", nameEn: "Yazd" },
  { code: "semnan", nameFa: "سمنان", nameEn: "Semnan" },
  { code: "south-khorasan", nameFa: "خراسان جنوبی", nameEn: "South Khorasan" },
  { code: "north-khorasan", nameFa: "خراسان شمالی", nameEn: "North Khorasan" },
  {
    code: "sistan-baluchestan",
    nameFa: "سیستان و بلوچستان",
    nameEn: "Sistan and Baluchestan",
  },
] as const;
export type ProvinceCode = (typeof IRAN_PROVINCES)[number]["code"];
export type Province = { code: ProvinceCode; nameFa: string; nameEn: string };
export const PROVINCE_CODES: readonly ProvinceCode[] = IRAN_PROVINCES.map(
  (p) => p.code,
);
export function findProvince(
  input: string | number | null | undefined,
): Province | null {
  if (typeof input !== "string" || !input) return null;
  const key = toSearchKey(input);

  return (
    IRAN_PROVINCES.find(
      (p) => p.code === key || toSearchKey(p.nameFa) === key,
    ) ?? null
  );
}
