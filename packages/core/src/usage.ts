/**
 * Pure usage-limit helpers for subscription metering.
 * A negative limit means unlimited.
 */
export function isWithinLimit(currentUsage: number, amount: number, limit: number): boolean {
  if (limit < 0) return true;
  return currentUsage + amount <= limit;
}

export function remaining(currentUsage: number, limit: number): number {
  if (limit < 0) return Number.POSITIVE_INFINITY;
  return Math.max(0, limit - currentUsage);
}

export function usagePercent(currentUsage: number, limit: number): number {
  if (limit < 0) return 0;
  if (limit === 0) return 100;
  return Math.min(100, Math.round((currentUsage / limit) * 100));
}
