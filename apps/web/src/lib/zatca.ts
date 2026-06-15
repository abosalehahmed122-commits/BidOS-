/**
 * ZATCA (Saudi e-invoicing) Phase 1 QR generation.
 * Encodes the mandatory TLV fields and returns a base64 payload, which is what
 * the QR image should contain. Phase 2 (clearance/reporting integration) is V2.
 */
function tlv(tag: number, value: string): Buffer {
  const v = Buffer.from(value, 'utf8');
  return Buffer.concat([Buffer.from([tag, v.length]), v]);
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
  const payload = Buffer.concat([
    tlv(1, input.sellerName),
    tlv(2, input.vatNumber),
    tlv(3, input.timestamp.toISOString()),
    tlv(4, (input.total / 100).toFixed(2)),
    tlv(5, (input.vatAmount / 100).toFixed(2)),
  ]);
  return payload.toString('base64');
}
