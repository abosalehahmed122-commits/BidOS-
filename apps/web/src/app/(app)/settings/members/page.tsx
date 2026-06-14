import { forWorkspace } from '@bid-os/db';
import { can, type Role } from '@bid-os/core';
import { requireSession } from '@/lib/session';
import { Card, CardContent } from '@/components/ui/card';
import { InviteMemberForm } from '@/components/settings/invite-member-form';
import { MemberRow } from '@/components/settings/member-row';

export const metadata = { title: 'الأعضاء — Bid OS' };

export default async function MembersPage() {
  const { user, membership } = await requireSession();
  const db = forWorkspace(membership.workspaceId);
  const members = await db.membership.findMany({
    include: { user: true },
    orderBy: { createdAt: 'asc' },
  });

  const canInvite = can(membership.role, 'member:invite');
  const canChangeRole = can(membership.role, 'member:role');
  const canRemove = can(membership.role, 'member:remove');

  return (
    <div className="max-w-3xl space-y-6">
      {canInvite && (
        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 font-semibold text-slate-100">دعوة عضو جديد</h2>
            <InviteMemberForm />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="space-y-3 p-6">
          <h2 className="font-semibold text-slate-100">الأعضاء ({members.length})</h2>
          {members.map((m) => (
            <MemberRow
              key={m.id}
              id={m.id}
              name={m.user.name}
              email={m.user.email}
              role={m.role as Role}
              isSelf={m.userId === user.id}
              canChangeRole={canChangeRole}
              canRemove={canRemove}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
