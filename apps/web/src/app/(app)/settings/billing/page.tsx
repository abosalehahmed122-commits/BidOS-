import QRCode from 'qrcode';
import { forWorkspace, prisma } from '@bid-os/db';
import { can } from '@bid-os/core';
import { requireSession } from '@/lib/session';
import { getBillingContext, getUsage } from '@/lib/billing';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { SubmitButton } from '@/components/auth/submit-button';
import { changePlanAction } from '@/actions/billing';
import { formatDate, formatSar } from '@/lib/format';

export const metadata = { title: 'الاشتراك — Bid OS' };

const STATUS_LABELS: Record<string, string> = {
  TRIALING: 'تجريبي',
  ACTIVE: 'نشط',
  PAST_DUE: 'متأخر السداد',
  CANCELED: 'ملغى',
  INCOMPLETE: 'غير مكتمل',
};

const INVOICE_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'مسودة',
  OPEN: 'غير مدفوعة',
  PAID: 'مدفوعة',
  VOID: 'ملغاة',
  UNCOLLECTIBLE: 'متعذّرة',
};

export default async function BillingPage() {
  const { membership } = await requireSession();
  const ws = membership.workspaceId;

  if (!can(membership.role, 'billing:view')) {
    return (
      <Card>
        <CardContent className="px-6 py-12 text-center text-sm text-slate-400">
          الاشتراك متاح لمديري مساحة العمل فقط.
        </CardContent>
      </Card>
    );
  }

  const db = forWorkspace(ws);
  const [{ plan, sub, limits }, usage, plans, invoices, seats] = await Promise.all([
    getBillingContext(ws),
    getUsage(ws),
    prisma.plan.findMany({ where: { isActive: true }, orderBy: { priceMonthly: 'asc' } }),
    db.invoice.findMany({ orderBy: { issuedAt: 'desc' }, take: 12 }),
    db.membership.count(),
  ]);
  const canManage = can(membership.role, 'billing:manage');

  const qrByInvoice: Record<string, string | null> = Object.fromEntries(
    await Promise.all(
      invoices.map(
        async (i) =>
          [i.id, i.qrPayload ? await QRCode.toDataURL(i.qrPayload, { margin: 1, width: 120 }) : null] as const,
      ),
    ),
  );

  const usageRows = [
    { label: 'المناقصات هذا الشهر', value: usage.TENDERS_ANALYZED ?? 0, limit: limits.tendersPerMonth },
    { label: 'صفحات الذكاء الاصطناعي', value: usage.AI_PAGES ?? 0, limit: limits.aiPagesPerMonth },
    { label: 'العروض المولّدة', value: usage.PROPOSALS_GENERATED ?? 0, limit: limits.proposalsPerMonth },
    { label: 'المقاعد', value: seats, limit: limits.seats },
  ];

  return (
    <div className="space-y-6">
      {/* Current subscription */}
      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-slate-100">الباقة الحالية: {plan?.name ?? 'بدون'}</h2>
              {sub && (
                <p className="mt-1 text-sm text-slate-400">
                  تتجدد في {formatDate(sub.currentPeriodEnd)}
                  {sub.cancelAtPeriodEnd ? ' · ستُلغى في نهاية الفترة' : ''}
                </p>
              )}
            </div>
            <Badge variant={sub?.status === 'ACTIVE' ? 'emerald' : 'gold'}>
              {STATUS_LABELS[sub?.status ?? ''] ?? 'غير مشترك'}
            </Badge>
          </div>
          <div className="grid gap-4 border-t border-white/5 pt-4 sm:grid-cols-2 lg:grid-cols-4">
            {usageRows.map((row) => (
              <div key={row.label}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-slate-300">{row.label}</span>
                  <span className="text-slate-500">
                    {row.value} / {row.limit < 0 ? '∞' : row.limit}
                  </span>
                </div>
                <Progress value={row.limit < 0 ? 8 : Math.min(100, (row.value / Math.max(row.limit, 1)) * 100)} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Plans */}
      <div>
        <h2 className="mb-3 font-semibold text-slate-100">الباقات</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((p) => {
            const isCurrent = plan?.id === p.id;
            const features = ((p.features as string[] | null) ?? []) as string[];
            return (
              <Card key={p.id} className={isCurrent ? 'border-gold-400/40' : ''}>
                <CardContent className="flex h-full flex-col gap-3 p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-100">{p.name}</h3>
                    {isCurrent && <Badge variant="gold">حالية</Badge>}
                  </div>
                  <p className="text-2xl font-bold text-slate-50">
                    {p.priceMonthly > 0 ? formatSar(p.priceMonthly) : 'مجاني'}
                    {p.priceMonthly > 0 && <span className="text-sm font-normal text-slate-500"> / شهر</span>}
                  </p>
                  <ul className="flex-1 space-y-1 text-xs text-slate-400">
                    {features.map((f) => (
                      <li key={f}>• {f}</li>
                    ))}
                  </ul>
                  {canManage && !isCurrent && (
                    <form action={changePlanAction.bind(null, p.code)}>
                      <SubmitButton variant="outline" className="w-full">
                        اختيار الباقة
                      </SubmitButton>
                    </form>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
        {!canManage && (
          <p className="mt-2 text-xs text-slate-500">تغيير الباقة متاح للمالك فقط. الدفع الإلكتروني سيُفعّل لاحقاً.</p>
        )}
      </div>

      {/* Invoices */}
      <div>
        <h2 className="mb-3 font-semibold text-slate-100">الفواتير</h2>
        {invoices.length === 0 ? (
          <Card>
            <CardContent className="px-6 py-10 text-center text-sm text-slate-500">لا فواتير بعد.</CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {invoices.map((inv) => (
              <Card key={inv.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                  <div>
                    <p className="font-medium text-slate-100" dir="ltr">
                      {inv.number}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDate(inv.issuedAt)} · شامل ضريبة القيمة المضافة
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-left">
                      <p className="font-semibold text-slate-100">{formatSar(inv.total)}</p>
                      <Badge variant={inv.status === 'PAID' ? 'emerald' : 'amber'}>
                        {INVOICE_STATUS_LABELS[inv.status] ?? inv.status}
                      </Badge>
                    </div>
                    {qrByInvoice[inv.id] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={qrByInvoice[inv.id] ?? ''} alt="ZATCA QR" className="h-16 w-16 rounded bg-white p-1" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
