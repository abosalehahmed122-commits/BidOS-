import Link from 'next/link';
import { FolderKanban, Plus } from 'lucide-react';
import { forWorkspace } from '@bid-os/db';
import { requireSession } from '@/lib/session';
import { PageHeader } from '@/components/app/page-header';
import { buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RecommendationBadge, TenderStatusBadge } from '@/components/app/status-badges';
import { formatDate, formatSar } from '@/lib/format';

export default async function TendersPage() {
  const { membership } = await requireSession();
  const db = forWorkspace(membership.workspaceId);
  const tenders = await db.tender.findMany({
    orderBy: { createdAt: 'desc' },
    include: { bidScore: true, _count: { select: { riskItems: true, requirements: true } } },
  });

  return (
    <div>
      <PageHeader
        title="المناقصات"
        description="كل مناقصاتك في مكان واحد"
        action={
          <Link href="/tenders/new" className={buttonVariants({ size: 'sm' })}>
            <Plus className="h-4 w-4" /> مناقصة جديدة
          </Link>
        }
      />

      <div className="px-6 py-6 lg:px-10">
        {tenders.length === 0 ? (
          <Card className="flex flex-col items-center gap-4 px-6 py-16 text-center">
            <FolderKanban className="h-12 w-12 text-slate-600" />
            <div>
              <p className="text-lg font-medium text-slate-200">لا توجد مناقصات بعد</p>
              <p className="mt-1 text-sm text-slate-400">ابدأ برفع كراسة الشروط لتحليلها.</p>
            </div>
            <Link href="/tenders/new" className={buttonVariants()}>
              <Plus className="h-4 w-4" /> أضف أول مناقصة
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {tenders.map((t) => (
              <Link
                key={t.id}
                href={`/tenders/${t.id}`}
                className="block rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition-colors hover:bg-white/5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-100">{t.title}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      {t.agency ?? 'بدون جهة'}
                      {t.referenceNumber ? ` · ${t.referenceNumber}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {t.bidScore && <RecommendationBadge rec={t.bidScore.recommendation} />}
                    <TenderStatusBadge status={t.status} />
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500">
                  {t.estimatedValue != null && <span>القيمة: {formatSar(t.estimatedValue)}</span>}
                  {t.submissionDeadline && <span>التسليم: {formatDate(t.submissionDeadline)}</span>}
                  <span>{t._count.requirements} متطلب · {t._count.riskItems} مخاطرة</span>
                  {t.bidScore && <span>درجة الفرصة: {t.bidScore.totalScore}/100</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
