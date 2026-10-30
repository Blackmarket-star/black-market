export function formatPrice(value: number): string {
  return new Intl.NumberFormat("fa-IR").format(Math.round(value)) + " تومان";
}

export function formatRial(value: number): string {
  return new Intl.NumberFormat("fa-IR").format(Math.round(value)) + " ریال";
}

export function formatDate(ts: number): string {
  const date = new Date(ts);
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatShortDate(ts: number): string {
  return new Intl.DateTimeFormat("fa-IR", {
    month: "short",
    day: "numeric",
  }).format(new Date(ts));
}

export function isSameDay(a: number, b: number): boolean {
  const d1 = new Date(a);
  const d2 = new Date(b);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function isSameMonth(a: number, b: number): boolean {
  const d1 = new Date(a);
  const d2 = new Date(b);
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth();
}

export function dayLabel(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return new Intl.DateTimeFormat("fa-IR", { weekday: "short" }).format(d);
}
