// Directory compiled from two independent research passes (see gemini-research.md and
// perplexity-research.md). An identifier is listed only when both passes agree on it,
// or one pass gives it with clear evidence and the other does not contradict it.
// Merged and dissolved institutions keep their own id and codes because legacy cards
// and Sheba numbers still exist; `mergedInto` names the successor that took over
// deposits or claims.
//
// UNRESOLVED (owner review): identifiers left out because the sources conflict or
// only one weak source supports them.
// - Card BIN 636797 (central-bank): single candidate, no issuer allocation found.
// - Card BIN 604932 (sepah): one GitHub gist only; other pass withholds it.
// - Card BIN 505426 (gardeshgari): one pass only, no issuer-level allocation.
// - Card BIN 505809 (middle-east): one pass only; also labelled Novin Karafarin elsewhere.
// - Card BIN 581874 (iran-venezuela): one pass only; other pass withholds it.
// - Card BIN 626314 (tat): one pass only; likely transposition of ayandeh 636214.
// - Card BINs 170019 (melli) and 903769 (saderat): directory leads, no issuer evidence.
// - Card BIN 636214: ayandeh here; some historical lists label it Tat.
// - Sub-BIN 50222915 (wepod on pasargad): single blog source; no wepod record added.
// - Bankino (middle-east brand, claimed BIN 505785 also used by iran-zamin): no record added.
// - Sheba 073 (kosar): one pass only, from a single third-party list.
// - Sheba 080 (noor): one pass only; other lists give 080 to Middle East or Novin Karafarin.
// - Sheba 090 (mehr-iran alternate): directory lead, no official allocation.
// - Codeless institutions (tat, salehin, ati, caspian, askariyeh, arman, samen, eih) have
//   no BIN or Sheba code in either pass, so they get no record.
export const BANK_IDS = [
  "central-bank",
  "industry-mine",
  "mellat",
  "refah",
  "maskan",
  "sepah",
  "keshavarzi",
  "melli",
  "tejarat",
  "saderat",
  "export-development",
  "post-bank",
  "tosee-taavon",
  "tosee",
  "ghavamin",
  "karafarin",
  "parsian",
  "eghtesad-novin",
  "saman",
  "blu",
  "pasargad",
  "sarmayeh",
  "sina",
  "mehr-iran",
  "shahr",
  "ayandeh",
  "ansar",
  "gardeshgari",
  "hekmat-iranian",
  "dey",
  "iran-zamin",
  "resalat",
  "kosar",
  "melal",
  "middle-east",
  "mehr-eghtesad",
  "noor",
  "iran-venezuela",
] as const;
export type BankId = (typeof BANK_IDS)[number];
export const IRAN_BANKS: readonly {
  id: BankId;
  nameFa: string;
  nameEn: string;
  mergedInto?: BankId;
}[] = [
  {
    id: "central-bank",
    nameFa: "بانک مرکزی جمهوری اسلامی ایران",
    nameEn: "Central Bank of Iran",
  },
  {
    id: "industry-mine",
    nameFa: "بانک صنعت و معدن",
    nameEn: "Bank of Industry and Mine",
  },
  { id: "mellat", nameFa: "بانک ملت", nameEn: "Bank Mellat" },
  { id: "refah", nameFa: "بانک رفاه کارگران", nameEn: "Bank Refah Kargaran" },
  { id: "maskan", nameFa: "بانک مسکن", nameEn: "Bank Maskan" },
  { id: "sepah", nameFa: "بانک سپه", nameEn: "Bank Sepah" },
  { id: "keshavarzi", nameFa: "بانک کشاورزی", nameEn: "Bank Keshavarzi" },
  { id: "melli", nameFa: "بانک ملی ایران", nameEn: "Bank Melli Iran" },
  { id: "tejarat", nameFa: "بانک تجارت", nameEn: "Bank Tejarat" },
  { id: "saderat", nameFa: "بانک صادرات ایران", nameEn: "Bank Saderat Iran" },
  {
    id: "export-development",
    nameFa: "بانک توسعه صادرات ایران",
    nameEn: "Export Development Bank of Iran",
  },
  { id: "post-bank", nameFa: "پست بانک ایران", nameEn: "Post Bank of Iran" },
  {
    id: "tosee-taavon",
    nameFa: "بانک توسعه تعاون",
    nameEn: "Cooperative Development Bank",
  },
  {
    id: "tosee",
    nameFa: "مؤسسه اعتباری توسعه",
    nameEn: "Tosee Credit Institution",
  },
  {
    id: "ghavamin",
    nameFa: "بانک قوامین",
    nameEn: "Ghavamin Bank",
    mergedInto: "sepah",
  },
  { id: "karafarin", nameFa: "بانک کارآفرین", nameEn: "Karafarin Bank" },
  { id: "parsian", nameFa: "بانک پارسیان", nameEn: "Parsian Bank" },
  {
    id: "eghtesad-novin",
    nameFa: "بانک اقتصادنوین",
    nameEn: "Eghtesad Novin Bank",
  },
  { id: "saman", nameFa: "بانک سامان", nameEn: "Saman Bank" },
  { id: "blu", nameFa: "بلوبانک", nameEn: "Blu Bank" },
  { id: "pasargad", nameFa: "بانک پاسارگاد", nameEn: "Bank Pasargad" },
  { id: "sarmayeh", nameFa: "بانک سرمایه", nameEn: "Bank Sarmayeh" },
  { id: "sina", nameFa: "بانک سینا", nameEn: "Sina Bank" },
  {
    id: "mehr-iran",
    nameFa: "بانک قرض‌الحسنه مهر ایران",
    nameEn: "Mehr Iran Qarz-al-Hasaneh Bank",
  },
  { id: "shahr", nameFa: "بانک شهر", nameEn: "Bank Shahr" },
  {
    id: "ayandeh",
    nameFa: "بانک آینده",
    nameEn: "Ayandeh Bank",
    mergedInto: "melli",
  },
  {
    id: "ansar",
    nameFa: "بانک انصار",
    nameEn: "Ansar Bank",
    mergedInto: "sepah",
  },
  { id: "gardeshgari", nameFa: "بانک گردشگری", nameEn: "Tourism Bank" },
  {
    id: "hekmat-iranian",
    nameFa: "بانک حکمت ایرانیان",
    nameEn: "Hekmat Iranian Bank",
    mergedInto: "sepah",
  },
  { id: "dey", nameFa: "بانک دی", nameEn: "Bank Dey" },
  { id: "iran-zamin", nameFa: "بانک ایران زمین", nameEn: "Iran Zamin Bank" },
  {
    id: "resalat",
    nameFa: "بانک قرض‌الحسنه رسالت",
    nameEn: "Resalat Qarz-al-Hasaneh Bank",
  },
  {
    id: "kosar",
    nameFa: "مؤسسه اعتباری کوثر",
    nameEn: "Kosar Credit Institution",
    mergedInto: "sepah",
  },
  {
    id: "melal",
    nameFa: "مؤسسه اعتباری ملل",
    nameEn: "Melal Credit Institution",
  },
  { id: "middle-east", nameFa: "بانک خاورمیانه", nameEn: "Middle East Bank" },
  {
    id: "mehr-eghtesad",
    nameFa: "بانک مهر اقتصاد",
    nameEn: "Mehr Eghtesad Bank",
    mergedInto: "sepah",
  },
  {
    id: "noor",
    nameFa: "مؤسسه اعتباری نور",
    nameEn: "Noor Credit Institution",
    mergedInto: "melli",
  },
  {
    id: "iran-venezuela",
    nameFa: "بانک مشترک ایران و ونزوئلا",
    nameEn: "Iran-Venezuela Bi-National Bank",
  },
];
export function getBank(id: BankId): (typeof IRAN_BANKS)[number] {
  const bank = IRAN_BANKS.find((b) => b.id === id);

  if (!bank) throw new RangeError("Invalid bank");

  return bank;
}
// Blu shares 621986 with Saman; detectBankByCard splits it on digits 7-8.
export const CARD_BINS: Readonly<Record<string, BankId>> = {
  "636795": "central-bank",
  "627961": "industry-mine",
  "610433": "mellat",
  "991975": "mellat",
  "589463": "refah",
  "628023": "maskan",
  "589210": "sepah",
  "603770": "keshavarzi",
  "639217": "keshavarzi",
  "603799": "melli",
  "627353": "tejarat",
  "585983": "tejarat",
  "603769": "saderat",
  "627648": "export-development",
  "207177": "export-development",
  "627760": "post-bank",
  "502908": "tosee-taavon",
  "628157": "tosee",
  "639599": "ghavamin",
  "627488": "karafarin",
  "502910": "karafarin",
  "622106": "parsian",
  "627884": "parsian",
  "639194": "parsian",
  "627412": "eghtesad-novin",
  "621986": "saman",
  "502229": "pasargad",
  "639347": "pasargad",
  "639607": "sarmayeh",
  "639346": "sina",
  "606373": "mehr-iran",
  "502806": "shahr",
  "504706": "shahr",
  "636214": "ayandeh",
  "627381": "ansar",
  "505416": "gardeshgari",
  "636949": "hekmat-iranian",
  "502938": "dey",
  "505785": "iran-zamin",
  "504172": "resalat",
  "505801": "kosar",
  "606256": "melal",
  "585947": "middle-east",
  "639370": "mehr-eghtesad",
  "507677": "noor",
};
// Sheba code 056 resolves to saman; blu has no Sheba code of its own.
export const SHEBA_CODES: Readonly<Record<string, BankId>> = {
  "010": "central-bank",
  "011": "industry-mine",
  "012": "mellat",
  "013": "refah",
  "014": "maskan",
  "015": "sepah",
  "016": "keshavarzi",
  "017": "melli",
  "018": "tejarat",
  "019": "saderat",
  "020": "export-development",
  "021": "post-bank",
  "022": "tosee-taavon",
  "051": "tosee",
  "052": "ghavamin",
  "053": "karafarin",
  "054": "parsian",
  "055": "eghtesad-novin",
  "056": "saman",
  "057": "pasargad",
  "058": "sarmayeh",
  "059": "sina",
  "060": "mehr-iran",
  "061": "shahr",
  "062": "ayandeh",
  "063": "ansar",
  "064": "gardeshgari",
  "065": "hekmat-iranian",
  "066": "dey",
  "069": "iran-zamin",
  "070": "resalat",
  "075": "melal",
  "078": "middle-east",
  "079": "mehr-eghtesad",
  "095": "iran-venezuela",
};
