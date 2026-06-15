import type { ReactNode } from 'react';
import { forWorkspace } from '@bid-os/db';
import { requireSession } from '@/lib/session';
import { Sidebar } from '@/components/app/sidebar';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const { user, membership } = await requireSession();
  const unreadCount = await forWorkspace(membership.workspaceId).notification.count({
    where: { userId: user.id, readAt: null },
  });
  return (
    <div className="flex min-h-screen">
      <Sidebar membership={membership} unreadCount={unreadCount} />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
