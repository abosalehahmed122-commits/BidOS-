const AR = 'ar-SA';

/** Format halalas (SAR * 100) as an Arabic currency string. */
export function formatSar(halalas: number): string {
  return new Intl.NumberFormat(AR, {
    style: 'currency',
    currency: 'SAR',
    maximumFractionDigits: 0,
  }).format(halalas / 100);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat(AR).format(n);
}

export function formatDate(value: Date | string): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat(AR, { dateStyle: 'medium' }).format(date);
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat(AR, { style: 'percent', maximumFractionDigits: 0 }).format(value);
}

/** Whole days from now until `value` (negative if past). */
export function daysUntil(value: Date | string): number {
  const date = typeof value === 'string' ? new Date(value) : value;
  return Math.ceil((date.getTime() - Date.now()) / 86_400_000);
}

/** Arabic relative deadline label, e.g. "خلال ٣ أيام" / "انتهى". */
export function deadlineLabel(value: Date | string): string {
  const days = daysUntil(value);
  if (days < 0) return 'انتهى الموعد';
  if (days === 0) return 'اليوم';
  if (days === 1) return 'غداً';
  return `خلال ${formatNumber(days)} يوم`;
}
