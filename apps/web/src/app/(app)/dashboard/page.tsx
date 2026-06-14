import Link from 'next/link';
import { CalendarClock, FileClock, FolderKanban, Trophy } from 'lucide-react';
import { forWorkspace } from '@bid-os/db';
import { DEADLINE_TYPE_LABELS, type DeadlineType } from '@bid-os/core';
import { requireSession } from '@/lib/session';
import { PageHeader } from '@/components/app/page-header';
import { KpiCard } from '@/components/app/kpi-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RecommendationBadge, TenderStatusBadge } from '@/components/app/status-badges';
import { deadlineLabel, formatDate } from '@/lib/format';

export default async function DashboardPage() {
  const { membership } = await requireSession();
  const db = forWorkspace(membership.workspaceId);
  const now = new Date();
  const weekAhead = new Date(Date.now() + 7 * 86_400_000);
  const monthAhead = new Date(Date.now() + 30 * 86_400_000);

  const [activeCount, deadlinesWeek, won, lost, expiringDocs, upcoming, recent] = await Promise.all([
    db.tender.count({ where: { status: { in: ['NEW', 'UNDER_REVIEW', 'DECIDED_BID', 'SUBMITTED'] } } }),
    db.deadline.count({ where: { dueAt: { gte: now, lte: weekAhead } } }),
    db.tender.count({ where: { status: 'WON' } }),
    db.tender.count({ where: { status: 'LOST' } }),
    db.companyDocument.count({ where: { expiryDate: { gte: now, lte: monthAhead } } }),
    db.deadline.findMany({
      where: { dueAt: { gte: now } },
      orderBy: { dueAt: 'asc' },
      take: 6,
      include: { tender: true },
    }),
    db.tender.findMany({ orderBy: { updatedAt: 'desc' }, take: 5, include: { bidScore: true } }),
  ]);

  const winRate = won + lost > 0 ? Math.round((won / (won + lost)) * 100) : 0;

  return (
    <div>
      <PageHeader title="لوحة التحكم" description={`أهلاً، ${membership.workspaceName}`} />

      <div className="space-y-6 px-6 py-6 lg:px-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="مناقصات نشطة" value={activeCount} icon={FolderKanban} />
          <KpiCard label="مواعيد هذا الأسبوع" value={deadlinesWeek} icon={CalendarClock} />
          <KpiCard label="نسبة الفوز" value={`${winRate}%`} hint={`${won} فوز / ${lost} خسارة`} icon={Trophy} />
          <KpiCard label="وثائق ستنتهي قريباً" value={expiringDocs} hint="خلال ٣٠ يوماً" icon={FileClock} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Deadline radar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarClock className="h-5 w-5 text-gold-400" /> رادار المواعيد
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcoming.length === 0 && <p className="text-sm text-slate-400">لا مواعيد قادمة.</p>}
              {upcoming.map((d) => (
                <Link
                  key={d.id}
                  href={`/tenders/${d.tenderId}`}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 hover:bg-white/5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm text-slate-100">{d.tender.title}</p>
                    <p className="text-xs text-slate-500">
                      {DEADLINE_TYPE_LABELS[d.type as DeadlineType]} · {formatDate(d.dueAt)}
                    </p>
                  </div>
                  <Badge variant={deadlineBadgeVariant(d.dueAt)}>{deadlineLabel(d.dueAt)}</Badge>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Recent tenders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderKanban className="h-5 w-5 text-gold-400" /> أحدث المناقصات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recent.length === 0 && (
                <p className="text-sm text-slate-400">
                  لا مناقصات بعد.{' '}
                  <Link href="/tenders/new" className="text-gold-300">
                    أضف أول مناقصة
                  </Link>
                </p>
              )}
              {recent.map((t) => (
                <Link
                  key={t.id}
                  href={`/tenders/${t.id}`}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 hover:bg-white/5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm text-slate-100">{t.title}</p>
                    <p className="text-xs text-slate-500">{t.agency ?? 'بدون جهة محددة'}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {t.bidScore && <RecommendationBadge rec={t.bidScore.recommendation} />}
                    <TenderStatusBadge status={t.status} />
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function deadlineBadgeVariant(dueAt: Date): 'red' | 'amber' | 'slate' {
  const days = Math.ceil((dueAt.getTime() - Date.now()) / 86_400_000);
  if (days <= 3) return 'red';
  if (days <= 7) return 'amber';
  return 'slate';
}
