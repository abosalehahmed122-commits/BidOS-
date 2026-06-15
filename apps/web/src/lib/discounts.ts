import { forWorkspace } from '@bid-os/db';

export interface RedeemedDiscount {
  discount: number; // halalas to subtract from the subtotal
  codeId: string;
  label: string;
}

/**
 * Validate and redeem a discount code against a subtotal (in halalas).
 * Throws a friendly Arabic error if the code is invalid. Increments redemptions.
 * Server-only helper (not a Server Action) — callers must enforce auth first.
 */
export async function redeemDiscount(
  ws: string,
  rawCode: string,
  subtotal: number,
): Promise<RedeemedDiscount> {
  const db = forWorkspace(ws);
  const code = rawCode.trim().toUpperCase();
  const d = await db.discountCode.findFirst({ where: { code, active: true } });
  if (!d) throw new Error('كود الخصم غير صالح أو غير مفعّل');
  if (d.expiresAt && d.expiresAt < new Date()) throw new Error('انتهت صلاحية كود الخصم');
  if (d.maxRedemptions != null && d.redeemedCount >= d.maxRedemptions) {
    throw new Error('تم استنفاد عدد مرات استخدام كود الخصم');
  }

  const discount =
    d.type === 'PERCENT' ? Math.round((subtotal * d.value) / 100) : Math.min(subtotal, d.value);
  const label = d.type === 'PERCENT' ? `${d.value}%` : `${(d.value / 100).toFixed(0)} ر.س`;

  await db.discountCode.update({ where: { id: d.id }, data: { redeemedCount: { increment: 1 } } });
  return { discount, codeId: d.id, label };
}
