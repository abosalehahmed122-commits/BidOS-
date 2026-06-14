import type { ReactNode } from 'react';
import { requireSession } from '@/lib/session';
import { PageHeader } from '@/components/app/page-header';
import { SettingsNav } from '@/components/settings/settings-nav';

export default async function SettingsLayout({ children }: { children: ReactNode }) {
  await requireSession();
  return (
    <div>
      <PageHeader title="الإعدادات" description="حسابك وأعضاء الفريق ومساحة العمل" />
      <SettingsNav />
      <div className="px-6 py-6 lg:px-10">{children}</div>
    </div>
  );
}
