'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@bid-os/db';
import { requireSuperAdmin } from '@/lib/admin';

/** Suspend / reactivate a user (blocks login). */
export async function toggleUserActiveAction(userId: string): Promise<void> {
  const { user } = await requireSuperAdmin();
  if (userId === user.id) return;
  const target = await prisma.user.findUnique({ where: { id: userId }, select: { isActive: true } });
  if (!target) return;
  await prisma.user.update({ where: { id: userId }, data: { isActive: !target.isActive } });
  revalidatePath('/admin/users');
}

/** Grant / revoke platform super-admin. */
export async function toggleSuperAdminAction(userId: string): Promise<void> {
  const { user } = await requireSuperAdmin();
  if (userId === user.id) return; // don't demote yourself
  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { isSuperAdmin: true },
  });
  if (!target) return;
  await prisma.user.update({
    where: { id: userId },
    data: { isSuperAdmin: !target.isSuperAdmin },
  });
  revalidatePath('/admin/users');
}

/** Suspend / restore a whole workspace (blocks all its members). */
export async function toggleWorkspaceSuspendedAction(workspaceId: string): Promise<void> {
  await requireSuperAdmin();
  const ws = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { suspendedAt: true },
  });
  if (!ws) return;
  await prisma.workspace.update({
    where: { id: workspaceId },
    data: { suspendedAt: ws.suspendedAt ? null : new Date() },
  });
  revalidatePath(`/admin/workspaces/${workspaceId}`);
  revalidatePath('/admin/workspaces');
}

/** Override a workspace's plan (e.g. comp a customer, fix a downgrade). */
export async function changeWorkspacePlanAction(
  workspaceId: string,
  formData: FormData,
): Promise<void> {
  await requireSuperAdmin();
  const planCode = formData.get('planCode')?.toString();
  if (!planCode) return;
  const plan = await prisma.plan.findUnique({ where: { code: planCode } });
  if (!plan) return;
  const now = new Date();
  const periodEnd = new Date(now.getTime() + 30 * 86_400_000);
  await prisma.subscription.upsert({
    where: { workspaceId },
    create: { workspaceId, planId: plan.id, status: 'ACTIVE', currentPeriodEnd: periodEnd },
    update: { planId: plan.id, status: 'ACTIVE', currentPeriodStart: now, currentPeriodEnd: periodEnd },
  });
  revalidatePath(`/admin/workspaces/${workspaceId}`);
}
