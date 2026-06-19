'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toggleUserActiveAction } from '@/actions/admin';

export function UserRow({
  id,
  name,
  email,
  phone,
  isActive,
  isSuperAdmin,
  isSelf,
  memberships,
  created,
}: {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  isSuperAdmin: boolean;
  isSelf: boolean;
  memberships: number;
  created: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4">
      <div className="min-w-0">
        <p className="text-sm text-slate-100">
          {name}
          {isSuperAdmin && <Badge variant="gold" className="mr-2">أدمن منصّة</Badge>}
          {isSelf && <span className="text-xs text-slate-500"> (أنت)</span>}
        </p>
        <p className="text-xs text-slate-500" dir="ltr">
          {email}
          {phone ? ` · ${phone}` : ''}
        </p>
      </div>
      <div className="flex items-center gap-3 text-xs text-slate-400">
        <span>{memberships} مساحة</span>
        <span>· {created}</span>
        {isActive ? <Badge variant="emerald">نشط</Badge> : <Badge variant="red">موقوف</Badge>}
        {!isSelf && (
          <form action={toggleUserActiveAction.bind(null, id)}>
            <Button type="submit" variant="outline" size="sm">
              {isActive ? 'إيقاف' : 'تفعيل'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
