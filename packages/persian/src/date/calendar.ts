// Adapted from jalaali-js (MIT), Behrang Noruzi Niya.

const BREAKS = [
  -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192,
  2262, 2324, 2394, 2456, 3178,
];
const div = (a: number, b: number) => ~~(a / b);
const mod = (a: number, b: number) => a - ~~(a / b) * b;
function jalCal(jy: number) {
  if (jy < -61 || jy >= 3178) throw new RangeError("Invalid Jalali year");
  const gy = jy + 621;
  let leapJ = -14;
  let jp = -61;
  let jump = 0;

  for (let i = 1; i < BREAKS.length; i++) {
    const jm = BREAKS[i] ?? 3178;
    jump = jm - jp;
    if (jy < jm) break;
    leapJ += div(jump, 33) * 8 + div(mod(jump, 33), 4);
    jp = jm;
  }
  let n = jy - jp;
  leapJ += div(n, 33) * 8 + div(mod(n, 33) + 3, 4);
  if (mod(jump, 33) === 4 && jump - n === 4) leapJ += 1;
  const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;
  const march = 20 + leapJ - leapG;

  if (jump - n < 6) n = n - jump + div(jump + 4, 33) * 33;
  let leap = mod(mod(n + 1, 33) - 1, 4);

  if (leap === -1) leap = 4;

  return { leap, gy, march }; // isLeap ⇔ leap === 0
}
function g2d(gy: number, gm: number, gd: number) {
  const d =
    div((gy + div(gm - 8, 6) + 100100) * 1461, 4) +
    div(153 * mod(gm + 9, 12) + 2, 5) +
    gd -
    34840408;

  return d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
}
function d2g(jdn: number) {
  let j = 4 * jdn + 139361631;
  j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
  const i = div(mod(j, 1461), 4) * 5 + 308;
  const gd = div(mod(i, 153), 5) + 1;
  const gm = mod(div(i, 153), 12) + 1;

  return { gy: div(j, 1461) - 100100 + div(8 - gm, 6), gm, gd };
}
const j2d = (jy: number, jm: number, jd: number) => {
  const r = jalCal(jy);

  return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1;
};
function d2j(jdn: number) {
  const gy = d2g(jdn).gy;
  let jy = gy - 621;
  const r = jalCal(jy);
  let k = jdn - g2d(gy, 3, r.march);

  if (k >= 0) {
    if (k <= 185) return { jy, jm: 1 + div(k, 31), jd: mod(k, 31) + 1 };
    k -= 186;
  } else {
    jy -= 1;
    k += 179;
    if (r.leap === 1) k += 1;
  }

  return { jy, jm: 7 + div(k, 30), jd: mod(k, 30) + 1 };
}
export type CalendarDate = { year: number; month: number; day: number };
function checkYear(year: number): void {
  if (!Number.isInteger(year) || year < 1 || year > 3176)
    throw new RangeError("Invalid Jalali year");
}
export function isJalaliLeapYear(year: number): boolean {
  checkYear(year);

  return jalCal(year).leap === 0;
}
export function jalaliMonthLength(year: number, month: number): number {
  checkYear(year);
  if (!Number.isInteger(month) || month < 1 || month > 12)
    throw new RangeError("Invalid month");

  return month <= 6 ? 31 : month <= 11 ? 30 : isJalaliLeapYear(year) ? 30 : 29;
}
export function isValidJalaliDate(
  year: number,
  month: number,
  day: number,
): boolean {
  if (
    !Number.isInteger(year) ||
    year < 1 ||
    year > 3176 ||
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12
  )
    return false;

  return (
    Number.isInteger(day) && day >= 1 && day <= jalaliMonthLength(year, month)
  );
}
export function jalaliToGregorian(
  year: number,
  month: number,
  day: number,
): CalendarDate {
  if (!isValidJalaliDate(year, month, day))
    throw new RangeError("Invalid date");
  const { gy, gm, gd } = d2g(j2d(year, month, day));

  return { year: gy, month: gm, day: gd };
}
export function gregorianToJalali(
  year: number,
  month: number,
  day: number,
): CalendarDate {
  if (
    ![year, month, day].every(Number.isInteger) ||
    year < 622 || year > 3798 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  )
    throw new RangeError("Invalid date");
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const lengths = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  if (day > (lengths[month - 1] ?? 0)) throw new RangeError("Invalid date");
  const { jy, jm, jd } = d2j(g2d(year, month, day));
  checkYear(jy);

  return { year: jy, month: jm, day: jd };
}
