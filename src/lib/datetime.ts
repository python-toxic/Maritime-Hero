/**
 * Naive local datetime helpers for scheduling.
 * Avoids UTC conversion so the picked time matches what is stored and displayed.
 */

const LOCAL_DATETIME_RE = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/;

export function parseLocalDatetime(value: string): Date | null {
  const match = value.trim().match(LOCAL_DATETIME_RE);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hours = Number(match[4]);
  const minutes = Number(match[5]);
  const date = new Date(year, month - 1, day, hours, minutes, 0, 0);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export function toDatetimeLocalValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function mysqlToDatetimeLocal(value: string): string | null {
  const match = value.trim().match(LOCAL_DATETIME_RE);
  if (!match) return null;
  return `${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}`;
}

/** API payload: YYYY-MM-DD HH:mm:ss (no timezone). */
export function datetimeLocalToApi(value: string): string | null {
  const match = value.trim().match(LOCAL_DATETIME_RE);
  if (!match) return null;
  return `${match[1]}-${match[2]}-${match[3]} ${match[4]}:${match[5]}:00`;
}

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatNaiveDatetime(value?: string): string {
  if (!value) return "—";
  const match = value.trim().match(LOCAL_DATETIME_RE);
  if (!match) return value;
  const day = Number(match[3]);
  const month = MONTHS_SHORT[Number(match[2]) - 1];
  const year = match[1];
  const hours = Number(match[4]);
  const minutes = match[5];
  const h12 = hours % 12 || 12;
  const ampm = hours < 12 ? "am" : "pm";
  return `${day} ${month} ${year}, ${h12}:${minutes} ${ampm}`;
}

export function defaultScheduledDatetimeLocal(): string {
  const d = new Date();
  d.setHours(d.getHours() + 1, 0, 0, 0);
  return toDatetimeLocalValue(d);
}
