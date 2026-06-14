'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FolderArchive, FolderKanban, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { href: '/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { href: '/tenders', label: 'المناقصات', icon: FolderKanban },
  { href: '/documents', label: 'مكتبة الوثائق', icon: FolderArchive },
];

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav className="space-y-1">
      {items.map((it) => {
        const active = pathname === it.href || pathname.startsWith(`${it.href}/`);
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
              active ? 'bg-gold-400/15 text-gold-200' : 'text-slate-300 hover:bg-white/5',
            )}
          >
            <it.icon className="h-4 w-4" />
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
