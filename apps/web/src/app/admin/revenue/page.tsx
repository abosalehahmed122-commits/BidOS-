import { prisma } from '@bid-os/db';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatSar } from '@/lib/format';

export const metadata = { title: 'الإيرادات — أدمن Bid OS' };

const INVOICE_STATUS: Record<string, string> = {
  DRAFT: 'مسودة',
  OPEN: 'غير مدفوعة',
  PAID: 'مدفوعة',
  VOID: 'ملغاة',
  UNCOLLECTIBLE: 'متعذّرة',
};

export default async function AdminRevenue() {
  const [invoiced, collected, open, activeSubs, invoices] = await Promise.all([
    prisma.invoice.aggregate({ _sum: { total: true }, _count: true }),
    prisma.invoice.aggregate({ _sum: { total: true }, where: { status: 'PAID' } }),
    prisma.invoice.aggregate({ _sum: { total: true }, where: { status: 'OPEN' } }),
    prisma.subscription.findMany({ where: { status: 'ACTIVE' }, include: { plan: true } }),
    prisma.invoice.findMany({
      orderBy: { issuedAt: 'desc' },
      take: 50,
      include: { workspace: { select: { name: true } } },
    }),
  ]);

  // MRR = sum of active paid plans (pre-VAT, in halalas).
  const mrr = activeSubs.reduce((sum, s) => sum + s.plan.priceMonthly, 0);
  const perPlan = new Map<string, number>();
  for (const s of activeSubs) perPlan.set(s.plan.name, (perPlan.get(s.plan.name) ?? 0) + 1);

  const kpis = [
    { label: 'MRR (مشتركون نشطون)', value: formatSar(mrr) },
    { label: 'إجمالي المفوتر', value: formatSar(invoiced._sum.total ?? 0) },
    { label: 'المحصّل', value: formatSar(collected._sum.total ?? 0) },
    { label: 'غير محصّل', value: formatSar(open._sum.total ?? 0) },
    { label: 'عدد الفواتير', value: String(invoiced._count) },
    { label: 'اشتراكات نشطة', value: String(activeSubs.length) },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="p-5">
              <p className="text-sm text-slate-400">{k.label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-50">{k.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {perPlan.size > 0 && (
        <Card>
          <CardContent className="space-y-2 p-6">
            <h2 className="font-semibold text-slate-100">المشتركون حسب الباقة</h2>
            {[...perPlan.entries()].map(([name, count]) => (
              <div key={name} className="flex items-center justify-between text-sm">
                <span className="text-slate-200">{name}</span>
                <span className="text-slate-400">{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="space-y-2 p-6">
          <h2 className="font-semibold text-slate-100">آخر الفواتير</h2>
          {invoices.map((inv) => (
            <div key={inv.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-4 py-2 text-sm">
              <span className="text-slate-300" dir="ltr">{inv.number}</span>
              <span className="min-w-0 flex-1 truncate text-slate-400">{inv.workspace.name}</span>
              <span className="text-slate-500">{formatDate(inv.issuedAt)}</span>
              <span className="text-slate-100">{formatSar(inv.total)}</span>
              <Badge variant={inv.status === 'PAID' ? 'emerald' : 'amber'}>
                {INVOICE_STATUS[inv.status] ?? inv.status}
              </Badge>
            </div>
          ))}
          {invoices.length === 0 && <p className="text-sm text-slate-500">لا فواتير بعد.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
