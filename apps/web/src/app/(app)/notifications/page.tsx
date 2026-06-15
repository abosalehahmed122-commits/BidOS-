import Link from 'next/link';
import { Bell, CalendarClock, FileClock } from 'lucide-react';
import { forWorkspace } from '@bid-os/db';
import { requireSession } from '@/lib/session';
import { PageHeader } from '@/components/app/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { markAllNotificationsReadAction } from '@/actions/notifications';
import { deadlineLabel, formatDate } from '@/lib/format';

export const metadata = { title: 'التنبيهات — Bid OS' };

export default async function NotificationsPage() {
  const { user, membership } = await requireSession();
  const db = forWorkspace(membership.workspaceId);
  const now = new Date();
  const monthAhead = new Date(Date.now() + 30 * 86_400_000);
  const weekAhead = new Date(Date.now() + 7 * 86_400_000);

  const [notifications, expiringDocs, upcomingDeadlines] = await Promise.all([
    db.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 50 }),
    db.companyDocument.findMany({
      where: { expiryDate: { gte: now, lte: monthAhead } },
      orderBy: { expiryDate: 'asc' },
    }),
    db.deadline.findMany({
      where: { dueAt: { gte: now, lte: weekAhead } },
      orderBy: { dueAt: 'asc' },
      include: { tender: true },
    }),
  ]);

  const unread = notifications.filter((n) => !n.readAt).length;

  return (
    <div>
      <PageHeader
        title="التنبيهات"
        description="تنبيهات ذكية بالمواعيد والوثائق والتحليلات"
        action={
          unread > 0 ? (
            <form action={markAllNotificationsReadAction}>
              <Button type="submit" variant="outline" size="sm">
                تعليم الكل كمقروء ({unread})
              </Button>
            </form>
          ) : undefined
        }
      />

      <div className="space-y-6 px-6 py-6 lg:px-10">
        {/* Smart alerts (derived live) */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardContent className="space-y-3 p-6">
              <h2 className="flex items-center gap-2 font-semibold text-slate-100">
                <CalendarClock className="h-5 w-5 text-gold-400" /> مواعيد قريبة (٧ أيام)
              </h2>
              {upcomingDeadlines.length === 0 && <p className="text-sm text-slate-500">لا مواعيد قريبة.</p>}
              {upcomingDeadlines.map((d) => (
                <Link key={d.id} href={`/tenders/${d.tenderId}`} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 hover:bg-white/5">
                  <span className="truncate text-sm text-slate-200">{d.tender.title}</span>
                  <Badge variant="amber">{deadlineLabel(d.dueAt)}</Badge>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-6">
              <h2 className="flex items-center gap-2 font-semibold text-slate-100">
                <FileClock className="h-5 w-5 text-gold-400" /> وثائق ستنتهي (٣٠ يوم)
              </h2>
              {expiringDocs.length === 0 && <p className="text-sm text-slate-500">لا وثائق قريبة الانتهاء.</p>}
              {expiringDocs.map((doc) => (
                <Link key={doc.id} href="/documents" className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 hover:bg-white/5">
                  <span className="truncate text-sm text-slate-200">{doc.name}</span>
                  <Badge variant="amber">{doc.expiryDate ? deadlineLabel(doc.expiryDate) : ''}</Badge>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Persisted notifications */}
        <Card>
          <CardContent className="space-y-2 p-6">
            <h2 className="flex items-center gap-2 font-semibold text-slate-100">
              <Bell className="h-5 w-5 text-gold-400" /> السجل
            </h2>
            {notifications.length === 0 && <p className="text-sm text-slate-500">لا تنبيهات بعد.</p>}
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`rounded-xl border px-4 py-3 ${n.readAt ? 'border-white/5 bg-white/[0.02]' : 'border-gold-400/20 bg-gold-400/5'}`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-100">{n.title}</p>
                  <span className="text-xs text-slate-500">{formatDate(n.createdAt)}</span>
                </div>
                {n.body && <p className="mt-1 text-xs text-slate-400">{n.body}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
