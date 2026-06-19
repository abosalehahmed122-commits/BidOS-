import { notFound } from 'next/navigation';
import { prisma } from '@bid-os/db';
import { ROLE_LABELS, type Role } from '@bid-os/core';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/input';
import { changeWorkspacePlanAction, toggleWorkspaceSuspendedAction } from '@/actions/admin';
import { formatDate, formatSar } from '@/lib/format';

const INVOICE_STATUS: Record<string, string> = {
  DRAFT: 'مسودة',
  OPEN: 'غير مدفوعة',
  PAID: 'مدفوعة',
  VOID: 'ملغاة',
  UNCOLLECTIBLE: 'متعذّرة',
};

function period(d = new Date()): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

export default async function AdminWorkspaceDetail({ params }: { params: { id: string } }) {
  const ws = await prisma.workspace.findUnique({
    where: { id: params.id },
    include: {
      subscription: { include: { plan: true } },
      memberships: { include: { user: true }, orderBy: { createdAt: 'asc' } },
      _count: { select: { tenders: true, companyDocs: true } },
    },
  });
  if (!ws) notFound();

  const [plans, invoices, usage, proposalsCount] = await Promise.all([
    prisma.plan.findMany({ where: { isActive: true }, orderBy: { priceMonthly: 'asc' } }),
    prisma.invoice.findMany({ where: { workspaceId: ws.id }, orderBy: { issuedAt: 'desc' }, take: 10 }),
    prisma.usageMeter.findMany({ where: { workspaceId: ws.id, period: period() } }),
    prisma.proposal.count({ where: { workspaceId: ws.id } }),
  ]);
  const usageMap: Record<string, number> = {};
  for (const m of usage) usageMap[m.metric] = m.value;

  return (
    <div className="space-y-6">
      {/* Header + controls */}
      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-50">{ws.name}</h2>
              <p className="mt-1 text-xs text-slate-500" dir="ltr">
                {ws.slug} · CR {ws.crNumber ?? '—'} · VAT {ws.vatNumber ?? '—'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {ws.suspendedAt ? <Badge variant="red">موقوفة</Badge> : <Badge variant="emerald">نشطة</Badge>}
              <form action={toggleWorkspaceSuspendedAction.bind(null, ws.id)}>
                <Button type="submit" variant={ws.suspendedAt ? 'outline' : 'danger'} size="sm">
                  {ws.suspendedAt ? 'إلغاء التعليق' : 'تعليق الشركة'}
                </Button>
              </form>
            </div>
          </div>

          <div className="grid gap-4 border-t border-white/5 pt-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
            <Stat label="الباقة" value={ws.subscription?.plan.name ?? 'بدون'} />
            <Stat label="المناقصات" value={String(ws._count.tenders)} />
            <Stat label="العروض" value={String(proposalsCount)} />
            <Stat label="وثائق الشركة" value={String(ws._count.companyDocs)} />
            <Stat label="مناقصات هذا الشهر" value={String(usageMap.TENDERS_ANALYZED ?? 0)} />
            <Stat label="صفحات AI" value={String(usageMap.AI_PAGES ?? 0)} />
            <Stat label="عروض مولّدة" value={String(usageMap.PROPOSALS_GENERATED ?? 0)} />
            <Stat label="الأعضاء" value={String(ws.memberships.length)} />
          </div>

          {/* Change plan */}
          <form
            action={changeWorkspacePlanAction.bind(null, ws.id)}
            className="flex items-end gap-2 border-t border-white/5 pt-4"
          >
            <div>
              <label className="mb-1 block text-xs text-slate-400">تغيير الباقة (تجاوز إداري)</label>
              <Select name="planCode" defaultValue={ws.subscription?.plan.code ?? ''} className="w-48">
                {plans.map((p) => (
                  <option key={p.id} value={p.code}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </div>
            <Button type="submit" variant="outline" size="sm">
              تطبيق
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Members */}
      <Card>
        <CardContent className="space-y-2 p-6">
          <h3 className="font-semibold text-slate-100">الأعضاء</h3>
          {ws.memberships.map((m) => (
            <div key={m.id} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-4 py-2">
              <div>
                <p className="text-sm text-slate-100">{m.user.name}</p>
                <p className="text-xs text-slate-500" dir="ltr">{m.user.email}</p>
              </div>
              <Badge variant="slate">{ROLE_LABELS[m.role as Role]}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card>
        <CardContent className="space-y-2 p-6">
          <h3 className="font-semibold text-slate-100">الفواتير</h3>
          {invoices.length === 0 && <p className="text-sm text-slate-500">لا فواتير.</p>}
          {invoices.map((inv) => (
            <div key={inv.id} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-4 py-2 text-sm">
              <span className="text-slate-300" dir="ltr">{inv.number}</span>
              <span className="text-slate-400">{formatDate(inv.issuedAt)}</span>
              <span className="text-slate-100">{formatSar(inv.total)}</span>
              <Badge variant={inv.status === 'PAID' ? 'emerald' : 'amber'}>
                {INVOICE_STATUS[inv.status] ?? inv.status}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-0.5 font-semibold text-slate-100">{value}</p>
    </div>
  );
}
