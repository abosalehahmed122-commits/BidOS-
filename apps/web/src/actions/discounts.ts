'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { forWorkspace } from '@bid-os/db';
import { can } from '@bid-os/core';
import { requireSession } from '@/lib/session';

export interface DiscountState {
  error?: string;
  success?: string;
}

const createSchema = z.object({
  code: z
    .string()
    .min(3, 'الكود قصير جداً')
    .max(40)
    .transform((s) => s.trim().toUpperCase()),
  type: z.enum(['PERCENT', 'FIXED']),
  value: z.coerce.number().int().min(1, 'القيمة مطلوبة'),
  maxRedemptions: z.coerce.number().int().min(1).optional(),
  expiresAt: z.coerce.date().optional(),
});

export async function createDiscountAction(
  _prev: DiscountState,
  formData: FormData,
): Promise<DiscountState> {
  const { membership } = await requireSession();
  if (!can(membership.role, 'billing:manage')) return { error: 'لا تملك صلاحية إدارة الخصومات' };

  const parsed = createSchema.safeParse({
    code: formData.get('code'),
    type: formData.get('type'),
    value: formData.get('value'),
    maxRedemptions: formData.get('maxRedemptions') || undefined,
    expiresAt: formData.get('expiresAt') || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'بيانات غير صحيحة' };
  if (parsed.data.type === 'PERCENT' && parsed.data.value > 100) {
    return { error: 'النسبة يجب أن تكون 100 أو أقل' };
  }

  const db = forWorkspace(membership.workspaceId);
  const exists = await db.discountCode.findFirst({ where: { code: parsed.data.code } });
  if (exists) return { error: 'هذا الكود موجود مسبقاً' };

  await db.discountCode.create({
    data: {
      workspaceId: membership.workspaceId,
      code: parsed.data.code,
      type: parsed.data.type,
      // FIXED is entered in SAR by the admin → stored in halalas.
      value: parsed.data.type === 'FIXED' ? Math.round(parsed.data.value * 100) : parsed.data.value,
      maxRedemptions: parsed.data.maxRedemptions ?? null,
      expiresAt: parsed.data.expiresAt ?? null,
    },
  });
  revalidatePath('/settings/discounts');
  return { success: 'تم إنشاء كود الخصم' };
}

export async function toggleDiscountAction(id: string): Promise<void> {
  const { membership } = await requireSession();
  if (!can(membership.role, 'billing:manage')) throw new Error('forbidden');
  const db = forWorkspace(membership.workspaceId);
  const d = await db.discountCode.findFirst({ where: { id } });
  if (!d) return;
  await db.discountCode.update({ where: { id }, data: { active: !d.active } });
  revalidatePath('/settings/discounts');
}
