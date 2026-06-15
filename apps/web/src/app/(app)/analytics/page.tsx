import { forWorkspace } from '@bid-os/db';
import { TENDER_STATUSES, TENDER_STATUS_LABELS, type TenderStatus } from '@bid-os/core';
import { requireSession } from '@/lib/session';
import { PageHeader } from '@/components/app/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export const metadata = { title: 'التحليلات — Bid OS' };

const DECISION_LABELS: Record<string, string> = {
  BID: 'دخول',
  NO_BID: 'عدم دخول',
  DEFER: 'تأجيل',
};

export default async function AnalyticsPage() {
  const { membership } = await requireSession();
  const db = forWorkspace(membership.workspaceId);

  const [statusGroups, decisionGroups, scoreAgg, tendersTotal, proposalsTotal] = await Promise.all([
    db.tender.groupBy({ by: ['status'], _count: { _all: true } }),
    db.decisionLog.groupBy({ by: ['decision'], _count: { _all: true } }),
    db.bidScore.aggregate({ _avg: { totalScore: true } }),
    db.tender.count(),
    db.proposal.count(),
  ]);

  const statusMap: Record<string, number> = {};
  for (const g of statusGroups) statusMap[g.status] = g._count._all;
  const won = statusMap.WON ?? 0;
  const lost = statusMap.LOST ?? 0;
  const winRate = won + lost > 0 ? Math.round((won / (won + lost)) * 100) : 0;
  const submitted = (statusMap.SUBMITTED ?? 0) + won + lost;
  const avgScore = Math.round(scoreAgg._avg.totalScore ?? 0);

  const kpis = [
    { label: 'إجمالي المناقصات', value: String(tendersTotal) },
    { label: 'نسبة الفوز', value: `${winRate}%` },
    { label: 'العروض المقدّمة', value: String(submitted) },
    { label: 'متوسط درجة الدخول', value: String(avgScore) },
  ];

  const decisionMap: Record<string, number> = {};
  for (const g of decisionGroups) decisionMap[g.decision] = g._count._all;

  return (
    <div>
      <PageHeader title="التحليلات والأرشفة" description="نسب الفوز وتوزيع المناقصات وقرارات الدخول" />
      <div className="space-y-6 px-6 py-6 lg:px-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((k) => (
            <Card key={k.label}>
              <CardContent className="p-5">
                <p className="text-sm text-slate-400">{k.label}</p>
                <p className="mt-1 text-3xl font-bold text-slate-50">{k.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardContent className="space-y-3 p-6">
              <h2 className="font-semibold text-slate-100">توزيع المناقصات بالحالة</h2>
              {tendersTotal === 0 && <p className="text-sm text-slate-500">لا مناقصات بعد.</p>}
              {TENDER_STATUSES.map((status) => {
                const count = statusMap[status] ?? 0;
                if (count === 0) return null;
                return (
                  <div key={status} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-200">{TENDER_STATUS_LABELS[status as TenderStatus]}</span>
                      <span className="text-slate-500">{count}</span>
                    </div>
                    <Progress value={Math.min(100, (count / Math.max(tendersTotal, 1)) * 100)} />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 p-6">
              <h2 className="font-semibold text-slate-100">قرارات الدخول</h2>
              <div className="grid grid-cols-3 gap-3 text-center">
                {(['BID', 'NO_BID', 'DEFER'] as const).map((d) => (
                  <div key={d} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                    <p className="text-2xl font-bold text-slate-50">{decisionMap[d] ?? 0}</p>
                    <p className="mt-1 text-xs text-slate-400">{DECISION_LABELS[d]}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/5 pt-4 text-sm text-slate-400">
                إجمالي العروض المولّدة: <span className="text-slate-100">{proposalsTotal}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
