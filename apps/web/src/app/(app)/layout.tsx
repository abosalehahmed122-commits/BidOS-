import type { ReactNode } from 'react';
import { requireSession } from '@/lib/session';
import { Sidebar } from '@/components/app/sidebar';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const { membership } = await requireSession();
  return (
    <div className="flex min-h-screen">
      <Sidebar membership={membership} />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
