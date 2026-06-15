'use server';

import { revalidatePath } from 'next/cache';
import { forWorkspace } from '@bid-os/db';
import { requireSession } from '@/lib/session';

export async function markAllNotificationsReadAction(): Promise<void> {
  const { user, membership } = await requireSession();
  const db = forWorkspace(membership.workspaceId);
  await db.notification.updateMany({
    where: { userId: user.id, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath('/notifications');
}
