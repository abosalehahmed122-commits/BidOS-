import { prisma } from '@bid-os/db';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/format';

export const metadata = { title: 'سجل التدقيق — أدمن Bid OS' };

const ACTION_LABELS: Record<string, string> = {
  'tender.analyze': 'تحليل مناقصة',
  'proposal.generate': 'توليد عرض',
  'member.invite': 'دعوة عضو',
  'billing.changePlan': 'تغيير باقة',
  'decision.record': 'تسجيل قرار',
};

export default async function AdminAudit() {
  const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });

  const nonEmpty = (x: string | null): x is string => !!x;
  const wsIds = [...new Set(logs.map((l) => l.workspaceId).filter(nonEmpty))];
  const actorIds = [...new Set(logs.map((l) => l.actorId).filter(nonEmpty))];
  const [workspaces, actors] = await Promise.all([
    prisma.workspace.findMany({ where: { id: { in: wsIds } }, select: { id: true, name: true } }),
    prisma.user.findMany({ where: { id: { in: actorIds } }, select: { id: true, email: true } }),
  ]);
  const wsMap = new Map(workspaces.map((w) => [w.id, w.name]));
  const actorMap = new Map(actors.map((a) => [a.id, a.email]));

  return (
    <Card>
      <CardContent className="space-y-2 p-6">
        <h2 className="font-semibold text-slate-100">سجل التدقيق عبر المنصّة ({logs.length})</h2>
        {logs.length === 0 && <p className="text-sm text-slate-500">لا أحداث بعد.</p>}
        {logs.map((log) => (
          <div
            key={log.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-4 py-2 text-sm"
          >
            <div className="flex items-center gap-2">
              <Badge variant="gold">{ACTION_LABELS[log.action] ?? log.action}</Badge>
              <span className="text-xs text-slate-500">{log.entity}</span>
            </div>
            <span className="min-w-0 flex-1 truncate text-slate-400">
              {(log.workspaceId && wsMap.get(log.workspaceId)) ?? '—'}
            </span>
            <span className="text-xs text-slate-500" dir="ltr">
              {(log.actorId && actorMap.get(log.actorId)) ?? '—'}
            </span>
            <span className="text-xs text-slate-500">{formatDate(log.createdAt)}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
