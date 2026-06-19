import { prisma } from '@bid-os/db';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate, formatSar } from '@/lib/format';

export default async function AdminOverview() {
  const [workspaces, users, tenders, proposals, invoiced, collected, recent] = await Promise.all([
    prisma.workspace.count(),
    prisma.user.count(),
    prisma.tender.count(),
    prisma.proposal.count(),
    prisma.invoice.aggregate({ _sum: { total: true } }),
    prisma.invoice.aggregate({ _sum: { total: true }, where: { status: 'PAID' } }),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: { id: true, name: true, email: true, createdAt: true },
    }),
  ]);

  const kpis = [
    { label: 'الشركات', value: String(workspaces) },
    { label: 'المستخدمون', value: String(users) },
    { label: 'المناقصات', value: String(tenders) },
    { label: 'العروض', value: String(proposals) },
    { label: 'إجمالي المفوتر', value: formatSar(invoiced._sum.total ?? 0) },
    { label: 'المحصّل', value: formatSar(collected._sum.total ?? 0) },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="p-5">
              <p className="text-sm text-slate-400">{k.label}</p>
              <p className="mt-1 text-3xl font-bold text-slate-50">{k.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="space-y-2 p-6">
          <h2 className="font-semibold text-slate-100">أحدث التسجيلات</h2>
          {recent.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3"
            >
              <div className="min-w-0">
                <p className="text-sm text-slate-100">{u.name}</p>
                <p className="text-xs text-slate-500" dir="ltr">
                  {u.email}
                </p>
              </div>
              <span className="text-xs text-slate-500">{formatDate(u.createdAt)}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
