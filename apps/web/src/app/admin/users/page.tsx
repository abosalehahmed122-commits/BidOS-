import { prisma } from '@bid-os/db';
import { requireSession } from '@/lib/session';
import { Card, CardContent } from '@/components/ui/card';
import { UserRow } from '@/components/admin/user-row';
import { formatDate } from '@/lib/format';

export const metadata = { title: 'المستخدمون — أدمن Bid OS' };

export default async function AdminUsers() {
  const { user } = await requireSession();
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: { _count: { select: { memberships: true } } },
  });

  return (
    <Card>
      <CardContent className="space-y-3 p-6">
        <h2 className="font-semibold text-slate-100">كل المستخدمين ({users.length})</h2>
        {users.map((u) => (
          <UserRow
            key={u.id}
            id={u.id}
            name={u.name}
            email={u.email}
            phone={u.phone}
            isActive={u.isActive}
            isSuperAdmin={u.isSuperAdmin}
            isSelf={u.id === user.id}
            memberships={u._count.memberships}
            created={formatDate(u.createdAt)}
          />
        ))}
      </CardContent>
    </Card>
  );
}
