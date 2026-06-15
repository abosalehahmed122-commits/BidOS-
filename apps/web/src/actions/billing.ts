'use server';

import { revalidatePath } from 'next/cache';
import { forWorkspace, prisma } from '@bid-os/db';
import { can } from '@bid-os/core';
import { requireSession } from '@/lib/session';
import { buildZatcaQr } from '@/lib/zatca';

const PLACEHOLDER_VAT = '300000000000003';

export async function changePlanAction(planCode: string): Promise<void> {
  const { user, membership } = await requireSession();
  if (!can(membership.role, 'billing:manage')) throw new Error('لا تملك صلاحية إدارة الاشتراك');
  const ws = membership.workspaceId;
  const db = forWorkspace(ws);

  const plan = await prisma.plan.findUnique({ where: { code: planCode } });
  if (!plan) throw new Error('الباقة غير موجودة');
  const workspace = await prisma.workspace.findUnique({ where: { id: ws } });

  const now = new Date();
  const periodEnd = new Date(now.getTime() + 30 * 86_400_000);

  await prisma.subscription.upsert({
    where: { workspaceId: ws },
    create: { workspaceId: ws, planId: plan.id, status: 'ACTIVE', currentPeriodEnd: periodEnd },
    update: {
      planId: plan.id,
      status: 'ACTIVE',
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
    },
  });

  // Paid plans get a ZATCA-compliant invoice. Payment provider is deferred, so
  // the invoice is OPEN (unpaid) until a gateway is connected.
  if (plan.priceMonthly > 0) {
    const subtotal = plan.priceMonthly;
    const vatAmount = Math.round(subtotal * 0.15);
    const total = subtotal + vatAmount;
    const count = await prisma.invoice.count({ where: { workspaceId: ws } });
    const number = `INV-${now.getFullYear()}-${String(count + 1).padStart(5, '0')}`;
    const sellerName = workspace?.name ?? 'Bid OS';
    const vatNumber = workspace?.vatNumber ?? PLACEHOLDER_VAT;
    const qrPayload = buildZatcaQr({ sellerName, vatNumber, timestamp: now, total, vatAmount });

    await prisma.invoice.create({
      data: {
        workspaceId: ws,
        number,
        status: 'OPEN',
        subtotal,
        vatRate: 0.15,
        vatAmount,
        total,
        sellerName,
        sellerVatNumber: vatNumber,
        buyerName: sellerName,
        qrPayload,
        dueAt: periodEnd,
      },
    });
  }

  await db.auditLog.create({
    data: { workspaceId: ws, actorId: user.id, action: 'billing.changePlan', entity: 'Subscription', entityId: ws },
  });
  revalidatePath('/settings/billing');
}
