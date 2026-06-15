'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const items = [
  { href: '/settings/account', label: 'حسابي' },
  { href: '/settings/members', label: 'الأعضاء' },
  { href: '/settings/workspace', label: 'مساحة العمل' },
  { href: '/settings/billing', label: 'الاشتراك' },
];

export function SettingsNav() {
  const pathname = usePathname();
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-white/5 px-6 lg:px-10">
      {items.map((it) => {
        const active = pathname === it.href;
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cn(
              'whitespace-nowrap border-b-2 px-4 py-3 text-sm transition-colors',
              active
                ? 'border-gold-400 text-slate-50'
                : 'border-transparent text-slate-400 hover:text-slate-200',
            )}
          >
            {it.label}
          </Link>
        );
      })}
    </div>
  );
}
