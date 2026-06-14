'use client';

import { useFormState } from 'react-dom';
import { ROLE_LABELS, ROLES, type Role } from '@bid-os/core';
import { changeMemberRoleAction, removeMemberAction } from '@/actions/settings';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/input';

export function MemberRow({
  id,
  name,
  email,
  role,
  isSelf,
  canChangeRole,
  canRemove,
}: {
  id: string;
  name: string;
  email: string;
  role: Role;
  isSelf: boolean;
  canChangeRole: boolean;
  canRemove: boolean;
}) {
  const [roleState, roleAction] = useFormState(changeMemberRoleAction.bind(null, id), {});
  const [removeState, removeAction] = useFormState(removeMemberAction.bind(null, id), {});
  const error = roleState.error ?? removeState.error;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4">
      <div className="min-w-0">
        <p className="text-sm text-slate-100">
          {name}
          {isSelf && <span className="text-xs text-slate-500"> (أنت)</span>}
        </p>
        <p className="text-xs text-slate-500" dir="ltr">
          {email}
        </p>
        {error && <p className="mt-1 text-xs text-red-300">{error}</p>}
      </div>

      <div className="flex items-center gap-2">
        {canChangeRole && !isSelf ? (
          <form action={roleAction} className="flex items-center gap-2">
            <Select name="role" defaultValue={role} className="h-9 w-28">
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </Select>
            <Button type="submit" variant="outline" size="sm">
              حفظ
            </Button>
          </form>
        ) : (
          <Badge variant="slate">{ROLE_LABELS[role]}</Badge>
        )}

        {canRemove && !isSelf && (
          <form action={removeAction}>
            <Button type="submit" variant="danger" size="sm">
              إزالة
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
