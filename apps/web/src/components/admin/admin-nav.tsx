'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const items = [
  { href: '/admin', label: 'نظرة عامة' },
  { href: '/admin/workspaces', label: 'الشركات' },
  { href: '/admin/users', label: 'المستخدمون' },
  { href: '/admin/revenue', label: 'الإيرادات' },
  { href: '/admin/audit', label: 'سجل التدقيق' },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="mt-3 flex gap-1 overflow-x-auto">
      {items.map((it) => {
        const active = pathname === it.href;
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cn(
              'whitespace-nowrap rounded-lg px-4 py-2 text-sm transition-colors',
              active ? 'bg-gold-400 text-navy-950' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200',
            )}
          >
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
