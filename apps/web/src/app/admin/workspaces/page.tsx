import { prisma } from '@bid-os/db';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/format';

export const metadata = { title: 'الشركات — أدمن Bid OS' };

const STATUS_LABELS: Record<string, string> = {
  TRIALING: 'تجريبي',
  ACTIVE: 'نشط',
  PAST_DUE: 'متأخر',
  CANCELED: 'ملغى',
  INCOMPLETE: 'غير مكتمل',
};

export default async function AdminWorkspaces() {
  const workspaces = await prisma.workspace.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      subscription: { include: { plan: true } },
      memberships: { where: { role: 'OWNER' }, take: 1, include: { user: true } },
      _count: { select: { memberships: true, tenders: true } },
    },
  });

  return (
    <Card>
      <CardContent className="space-y-3 p-6">
        <h2 className="font-semibold text-slate-100">كل الشركات ({workspaces.length})</h2>
        {workspaces.map((ws) => {
          const owner = ws.memberships[0]?.user;
          return (
            <div
              key={ws.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-100">{ws.name}</p>
                <p className="text-xs text-slate-500" dir="ltr">
                  {owner?.email ?? '—'}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <Badge variant="gold">{ws.subscription?.plan.name ?? 'بدون باقة'}</Badge>
                {ws.subscription && (
                  <Badge variant={ws.subscription.status === 'ACTIVE' ? 'emerald' : 'slate'}>
                    {STATUS_LABELS[ws.subscription.status] ?? ws.subscription.status}
                  </Badge>
                )}
                <span>{ws._count.memberships} عضو</span>
                <span>· {ws._count.tenders} مناقصة</span>
                <span>· {formatDate(ws.createdAt)}</span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
