import type { ReactNode } from 'react';
import { forWorkspace, prisma } from '@bid-os/db';
import { requireSession } from '@/lib/session';
import { isSuperAdminEmail } from '@/lib/admin';
import { Sidebar } from '@/components/app/sidebar';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const { user, membership } = await requireSession();
  const [unreadCount, me] = await Promise.all([
    forWorkspace(membership.workspaceId).notification.count({
      where: { userId: user.id, readAt: null },
    }),
    prisma.user.findUnique({ where: { id: user.id }, select: { isSuperAdmin: true } }),
  ]);
  const superAdmin = !!me?.isSuperAdmin || isSuperAdminEmail(user.email);
  return (
    <div className="flex min-h-screen">
      <Sidebar membership={membership} unreadCount={unreadCount} isSuperAdmin={superAdmin} />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
