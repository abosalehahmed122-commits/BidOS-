import { describe, expect, it } from 'vitest';
import { buildZatcaQr } from './zatca';

/** Decode base64 → byte array, then walk the TLV tags. */
function parseTlv(b64: string): Record<number, string> {
  const bin = Buffer.from(b64, 'base64');
  const out: Record<number, string> = {};
  let i = 0;
  while (i < bin.length) {
    const tag = bin[i]!;
    const len = bin[i + 1]!;
    out[tag] = bin.subarray(i + 2, i + 2 + len).toString('utf8');
    i += 2 + len;
  }
  return out;
}

describe('buildZatcaQr', () => {
  const payload = buildZatcaQr({
    sellerName: 'شركة بيد',
    vatNumber: '300000000000003',
    timestamp: new Date('2026-06-15T10:00:00.000Z'),
    total: 11500, // 115.00 SAR
    vatAmount: 1500, // 15.00 SAR
  });

  it('produces a valid base64 string', () => {
    expect(payload).toMatch(/^[A-Za-z0-9+/]+=*$/);
  });

  it('encodes the five mandatory ZATCA fields', () => {
    const tags = parseTlv(payload);
    expect(tags[1]).toBe('شركة بيد');
    expect(tags[2]).toBe('300000000000003');
    expect(tags[3]).toBe('2026-06-15T10:00:00.000Z');
    expect(tags[4]).toBe('115.00');
    expect(tags[5]).toBe('15.00');
  });
});
