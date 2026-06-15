import { describe, expect, it } from 'vitest';
import { isWithinLimit, remaining, usagePercent } from './usage';

describe('isWithinLimit', () => {
  it('allows when under the limit', () => {
    expect(isWithinLimit(5, 1, 10)).toBe(true);
  });
  it('allows reaching the limit exactly', () => {
    expect(isWithinLimit(9, 1, 10)).toBe(true);
  });
  it('blocks when exceeding the limit', () => {
    expect(isWithinLimit(10, 1, 10)).toBe(false);
  });
  it('treats a negative limit as unlimited', () => {
    expect(isWithinLimit(9_999, 1, -1)).toBe(true);
  });
  it('blocks any amount when the limit is zero', () => {
    expect(isWithinLimit(0, 1, 0)).toBe(false);
  });
});

describe('remaining', () => {
  it('returns the gap to the limit', () => {
    expect(remaining(3, 10)).toBe(7);
  });
  it('never goes negative', () => {
    expect(remaining(15, 10)).toBe(0);
  });
  it('is infinite when unlimited', () => {
    expect(remaining(15, -1)).toBe(Number.POSITIVE_INFINITY);
  });
});

describe('usagePercent', () => {
  it('computes a clamped percentage', () => {
    expect(usagePercent(5, 10)).toBe(50);
    expect(usagePercent(20, 10)).toBe(100);
  });
  it('returns 0 for unlimited', () => {
    expect(usagePercent(5, -1)).toBe(0);
  });
});
