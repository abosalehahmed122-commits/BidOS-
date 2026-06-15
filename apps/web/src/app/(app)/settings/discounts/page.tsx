import { forWorkspace } from '@bid-os/db';
import { can } from '@bid-os/core';
import { requireSession } from '@/lib/session';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DiscountForm } from '@/components/settings/discount-form';
import { toggleDiscountAction } from '@/actions/discounts';
import { formatDate } from '@/lib/format';

export const metadata = { title: 'أكواد الخصم — Bid OS' };

export default async function DiscountsPage() {
  const { membership } = await requireSession();

  if (!can(membership.role, 'billing:manage')) {
    return (
      <Card>
        <CardContent className="px-6 py-12 text-center text-sm text-slate-400">
          إدارة أكواد الخصم متاحة للمالك فقط.
        </CardContent>
      </Card>
    );
  }

  const db = forWorkspace(membership.workspaceId);
  const codes = await db.discountCode.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <div className="max-w-3xl space-y-6">
      <Card>
        <CardContent className="p-6">
          <h2 className="mb-4 font-semibold text-slate-100">إنشاء كود خصم</h2>
          <DiscountForm />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-6">
          <h2 className="font-semibold text-slate-100">الأكواد ({codes.length})</h2>
          {codes.length === 0 && <p className="text-sm text-slate-500">لا أكواد بعد.</p>}
          {codes.map((c) => {
            const expired = c.expiresAt != null && c.expiresAt < new Date();
            const value = c.type === 'PERCENT' ? `${c.value}%` : `${(c.value / 100).toFixed(0)} ر.س`;
            return (
              <div
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4"
              >
                <div className="min-w-0">
                  <p className="font-medium text-slate-100" dir="ltr">
                    {c.code} <span className="text-gold-400">· {value}</span>
                  </p>
                  <p className="text-xs text-slate-500">
                    استُخدم {c.redeemedCount}
                    {c.maxRedemptions != null ? ` / ${c.maxRedemptions}` : ''}
                    {c.expiresAt ? ` · ينتهي ${formatDate(c.expiresAt)}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {expired ? (
                    <Badge variant="red">منتهٍ</Badge>
                  ) : (
                    <Badge variant={c.active ? 'emerald' : 'slate'}>{c.active ? 'مفعّل' : 'موقوف'}</Badge>
                  )}
                  <form action={toggleDiscountAction.bind(null, c.id)}>
                    <Button type="submit" variant="outline" size="sm">
                      {c.active ? 'إيقاف' : 'تفعيل'}
                    </Button>
                  </form>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
