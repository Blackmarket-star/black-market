import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import persian_en from "react-date-object/locales/persian_en";

export { persian, persian_fa, persian_en };

/** Today's date as a Jalali DateObject (Persian calendar, fa locale). */
export function todayJalali(): DateObject {
  return new DateObject({ calendar: persian, locale: persian_fa });
}

/** Today's date as a Jalali "YYYY/MM/DD" string (Latin digits). */
export function todayJalaliString(): string {
  return new DateObject({
    date: new Date(),
    calendar: persian,
    locale: persian_en,
  }).format("YYYY/MM/DD");
}

/** Convert a Jalali "YYYY/MM/DD" string to a JS timestamp (ms). */
export function jalaliStringToTimestamp(jalaliStr: string): number {
  return new DateObject({
    date: jalaliStr,
    calendar: persian,
    locale: persian_en,
  }).toDate().getTime();
}

/** Format a JS timestamp as a Jalali "YYYY/MM/DD" string (Latin digits). */
export function timestampToJalaliString(ts: number): string {
  return new DateObject({
    date: new Date(ts),
    calendar: persian,
    locale: persian_en,
  }).format("YYYY/MM/DD");
}

/** Format a JS timestamp as a Persian-locale long date (e.g. ۲۳ مهر ۱۴۰۳). */
export function timestampToJalaliLong(ts: number): string {
  return new DateObject({
    date: new Date(ts),
    calendar: persian,
    locale: persian_fa,
  }).format("D MMMM YYYY");
}
