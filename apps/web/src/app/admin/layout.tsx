import type { ReactNode } from 'react';
import Link from 'next/link';
import { requireSuperAdmin } from '@/lib/admin';
import { AdminNav } from '@/components/admin/admin-nav';

export const metadata = { title: 'أدمن المنصّة — Bid OS' };

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireSuperAdmin();
  return (
    <div className="min-h-screen">
      <header className="border-b border-white/5 px-6 py-4 lg:px-10">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-slate-50">أدمن المنصّة</h1>
          <Link href="/dashboard" className="text-sm text-slate-400 hover:text-slate-200">
            ← العودة للتطبيق
          </Link>
        </div>
        <AdminNav />
      </header>
      <main className="px-6 py-6 lg:px-10">{children}</main>
    </div>
  );
}
