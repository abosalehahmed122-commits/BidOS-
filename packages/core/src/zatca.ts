/**
 * ZATCA (Saudi e-invoicing) Phase 1 QR generation — pure & cross-environment
 * (no Node Buffer), so it is unit-testable. Encodes the five mandatory TLV
 * fields and returns the base64 payload the QR image must contain.
 * Phase 2 (clearance/reporting integration) is V2.
 */
const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function toBase64(bytes: number[]): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i] ?? 0;
    const b1 = bytes[i + 1];
    const b2 = bytes[i + 2];
    const triple = (b0 << 16) | ((b1 ?? 0) << 8) | (b2 ?? 0);
    out += B64[(triple >> 18) & 63]! + B64[(triple >> 12) & 63]!;
    out += b1 === undefined ? '=' : B64[(triple >> 6) & 63]!;
    out += b2 === undefined ? '=' : B64[triple & 63]!;
  }
  return out;
}

function tlv(tag: number, value: string): number[] {
  const bytes = Array.from(new TextEncoder().encode(value));
  return [tag, bytes.length, ...bytes];
}

export interface ZatcaQrInput {
  sellerName: string;
  vatNumber: string;
  timestamp: Date;
  /** total incl. VAT, in halalas */
  total: number;
  /** VAT amount, in halalas */
  vatAmount: number;
}

export function buildZatcaQr(input: ZatcaQrInput): string {
  const bytes = [
    ...tlv(1, input.sellerName),
    ...tlv(2, input.vatNumber),
    ...tlv(3, input.timestamp.toISOString()),
    ...tlv(4, (input.total / 100).toFixed(2)),
    ...tlv(5, (input.vatAmount / 100).toFixed(2)),
  ];
  return toBase64(bytes);
}
