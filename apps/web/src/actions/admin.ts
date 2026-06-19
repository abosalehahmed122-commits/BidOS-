'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@bid-os/db';
import { requireSuperAdmin } from '@/lib/admin';

/** Suspend / reactivate a user (blocks login). Super-admin only. */
export async function toggleUserActiveAction(userId: string): Promise<void> {
  const { user } = await requireSuperAdmin();
  if (userId === user.id) return; // never lock yourself out
  const target = await prisma.user.findUnique({ where: { id: userId }, select: { isActive: true } });
  if (!target) return;
  await prisma.user.update({ where: { id: userId }, data: { isActive: !target.isActive } });
  revalidatePath('/admin/users');
}
