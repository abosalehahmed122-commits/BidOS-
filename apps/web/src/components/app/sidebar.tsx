import Link from 'next/link';
import { Bell, LogOut } from 'lucide-react';
import type { WorkspaceMembership } from '@bid-os/auth';
import { ROLE_LABELS } from '@bid-os/core';
import { logoutAction } from '@/actions/auth';
import { NavLinks } from './nav-links';

export function Sidebar({
  membership,
  unreadCount = 0,
}: {
  membership: WorkspaceMembership;
  unreadCount?: number;
}) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-l border-white/5 bg-navy-900/40 p-4 lg:flex">
      <Link href="/dashboard" className="mb-6 flex items-center gap-2 px-2 pt-2">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-gold-400 font-bold text-navy-950">
          B
        </span>
        <span className="font-semibold text-slate-50">Bid OS</span>
      </Link>

      <div className="mb-4 rounded-xl border border-white/5 bg-white/[0.03] p-3">
        <p className="truncate text-sm font-medium text-slate-100">{membership.workspaceName}</p>
        <p className="text-xs text-slate-400">{ROLE_LABELS[membership.role]}</p>
      </div>

      <NavLinks />

      <Link
        href="/notifications"
        className="mt-1 flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-slate-300 transition-colors hover:bg-white/5"
      >
        <span className="flex items-center gap-3">
          <Bell className="h-4 w-4" />
          التنبيهات
        </span>
        {unreadCount > 0 && (
          <span className="rounded-full bg-gold-400 px-2 text-xs font-medium text-navy-950">
            {unreadCount}
          </span>
        )}
      </Link>

      <form action={logoutAction} className="mt-auto">
        <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-300 transition-colors hover:bg-white/5">
          <LogOut className="h-4 w-4" />
          تسجيل الخروج
        </button>
      </form>
    </aside>
  );
}
