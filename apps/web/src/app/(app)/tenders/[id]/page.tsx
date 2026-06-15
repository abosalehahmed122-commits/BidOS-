import type { ReactNode } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AlertTriangle, FileText, Quote, Sparkles } from 'lucide-react';
import { forWorkspace } from '@bid-os/db';
import {
  BID_RECOMMENDATION_LABELS,
  DEADLINE_TYPE_LABELS,
  GAP_TYPE_LABELS,
  REQUIREMENT_CATEGORY_LABELS,
  RISK_CATEGORY_LABELS,
  can,
  type BidFactor,
  type DeadlineType,
  type GapType,
  type RequirementCategory,
  type RiskCategory,
} from '@bid-os/core';
import { requireSession } from '@/lib/session';
import { ProposalsPanel } from '@/components/proposals/proposals-panel';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScoreRing } from '@/components/app/score-ring';
import { RecommendationBadge, SeverityBadge, TenderStatusBadge } from '@/components/app/status-badges';
import { SubmitButton } from '@/components/auth/submit-button';
import { DecisionForm } from '@/components/tenders/decision-form';
import { analyzeTenderAction } from '@/actions/tenders';
import { cn } from '@/lib/utils';
import { deadlineLabel, formatDate, formatSar } from '@/lib/format';

const TABS = [
  { key: 'overview', label: 'نظرة عامة' },
  { key: 'requirements', label: 'المتطلبات' },
  { key: 'risks', label: 'النواقص والمخاطر' },
  { key: 'score', label: 'التقييم' },
  { key: 'proposal', label: 'العرض' },
  { key: 'decisions', label: 'سجل القرارات' },
  { key: 'documents', label: 'المستندات' },
] as const;

const DECISION_LABELS: Record<string, string> = {
  BID: 'الدخول',
  NO_BID: 'عدم الدخول',
  DEFER: 'تأجيل',
};

export default async function TenderDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { membership } = await requireSession();
  const db = forWorkspace(membership.workspaceId);

  const tender = await db.tender.findFirst({
    where: { id: params.id },
    include: {
      documents: { orderBy: { createdAt: 'desc' } },
      requirements: { orderBy: { confidence: 'asc' } },
      attachments: true,
      deadlines: { orderBy: { dueAt: 'asc' } },
      riskItems: { orderBy: { severity: 'desc' } },
      gapItems: true,
      bidScore: true,
      decisionLogs: { orderBy: { decidedAt: 'desc' } },
      extractionRuns: { orderBy: { version: 'desc' }, take: 1 },
      proposals: {
        orderBy: { version: 'desc' },
        include: { sections: { orderBy: { order: 'asc' } } },
      },
    },
  });
  if (!tender) notFound();

  const tab = TABS.find((t) => t.key === searchParams.tab)?.key ?? 'overview';
  const hasAnalysis = tender.requirements.length > 0 || !!tender.bidScore;
  const lowConfidence = tender.requirements.filter((r) => r.confidence < 0.7).length;
  const lastRun = tender.extractionRuns[0];
  const factors = (tender.bidScore?.factors ?? []) as unknown as BidFactor[];
  const proposalVMs = tender.proposals.map((p) => ({
    id: p.id,
    title: p.title,
    version: p.version,
    status: p.status,
    sections: p.sections.map((s) => ({ id: s.id, title: s.title, contentMd: s.contentMd ?? '' })),
  }));

  return (
    <div>
      {/* Header */}
      <div className="border-b border-white/5 px-6 py-6 lg:px-10">
        <div className="mb-1 flex items-center gap-2 text-sm text-slate-400">
          <Link href="/tenders" className="hover:text-slate-200">المناقصات</Link>
          <span>/</span>
        </div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-slate-50">{tender.title}</h1>
            <p className="mt-1 text-sm text-slate-400">
              {tender.agency ?? 'بدون جهة'}
              {tender.referenceNumber ? ` · رقم المنافسة ${tender.referenceNumber}` : ''}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
              <TenderStatusBadge status={tender.status} />
              {tender.bidScore && <RecommendationBadge rec={tender.bidScore.recommendation} />}
              {tender.estimatedValue != null && (
                <span className="text-slate-400">القيمة: {formatSar(tender.estimatedValue)}</span>
              )}
              {tender.submissionDeadline && (
                <Badge variant="amber">التسليم {deadlineLabel(tender.submissionDeadline)}</Badge>
              )}
            </div>
          </div>
          <form action={analyzeTenderAction.bind(null, tender.id)}>
            <SubmitButton variant={hasAnalysis ? 'outline' : 'primary'}>
              <Sparkles className="h-4 w-4" />
              {hasAnalysis ? 'إعادة التحليل' : 'حلّل الآن'}
            </SubmitButton>
          </form>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-white/5 px-6 lg:px-10">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/tenders/${tender.id}?tab=${t.key}`}
            className={cn(
              'whitespace-nowrap border-b-2 px-4 py-3 text-sm transition-colors',
              tab === t.key
                ? 'border-gold-400 text-slate-50'
                : 'border-transparent text-slate-400 hover:text-slate-200',
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="px-6 py-6 lg:px-10">
        {!hasAnalysis && tab !== 'documents' && tab !== 'decisions' && tab !== 'proposal' && (
          <EmptyAnalysis />
        )}

        {tab === 'overview' && (
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardContent className="space-y-4 p-6">
                <h3 className="font-semibold text-slate-100">المواعيد الحرجة</h3>
                {tender.deadlines.length === 0 && <Muted>لا مواعيد مستخرجة بعد.</Muted>}
                {tender.deadlines.map((d) => (
                  <div key={d.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
                    <div>
                      <p className="text-sm text-slate-100">{DEADLINE_TYPE_LABELS[d.type as DeadlineType]}</p>
                      <p className="text-xs text-slate-500">{formatDate(d.dueAt)}</p>
                    </div>
                    <Badge variant="amber">{deadlineLabel(d.dueAt)}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                {tender.bidScore ? (
                  <>
                    <ScoreRing score={tender.bidScore.totalScore} recommendation={tender.bidScore.recommendation} />
                    <RecommendationBadge rec={tender.bidScore.recommendation} />
                    <p className="text-xs text-slate-400">{tender.bidScore.rationale}</p>
                  </>
                ) : (
                  <Muted>لا يوجد تقييم بعد.</Muted>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {tab === 'requirements' && (
          <div className="space-y-6">
            {lowConfidence > 0 && (
              <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                <AlertTriangle className="h-4 w-4" /> {lowConfidence} عنصراً بثقة منخفضة — يُنصح بمراجعتها يدوياً.
              </div>
            )}
            <Section title={`المتطلبات (${tender.requirements.length})`}>
              {tender.requirements.map((r) => (
                <Card key={r.id}>
                  <CardContent className="space-y-2 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="slate">{REQUIREMENT_CATEGORY_LABELS[r.category as RequirementCategory]}</Badge>
                        {r.mandatory && <Badge variant="red">إلزامي</Badge>}
                      </div>
                      <Confidence value={r.confidence} />
                    </div>
                    <p className="font-medium text-slate-100">{r.title}</p>
                    {r.description && <p className="text-sm text-slate-400">{r.description}</p>}
                    <Citation page={r.sourcePage} quote={r.sourceQuote} />
                  </CardContent>
                </Card>
              ))}
            </Section>
            {tender.attachments.length > 0 && (
              <Section title={`المرفقات المطلوبة (${tender.attachments.length})`}>
                {tender.attachments.map((a) => (
                  <Card key={a.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <p className="text-sm text-slate-100">{a.name}</p>
                      <div className="flex items-center gap-2">
                        {a.mandatory && <Badge variant="red">إلزامي</Badge>}
                        <Confidence value={a.confidence} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </Section>
            )}
          </div>
        )}

        {tab === 'risks' && (
          <div className="space-y-6">
            <Section title={`المخاطر (${tender.riskItems.length})`}>
              {tender.riskItems.length === 0 && <Muted>لا مخاطر مستخرجة.</Muted>}
              {tender.riskItems.map((r) => (
                <Card key={r.id}>
                  <CardContent className="space-y-2 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <SeverityBadge sev={r.severity} />
                        <Badge variant="slate">{RISK_CATEGORY_LABELS[r.category as RiskCategory]}</Badge>
                      </div>
                      <Confidence value={r.confidence} />
                    </div>
                    <p className="font-medium text-slate-100">{r.title}</p>
                    {r.description && <p className="text-sm text-slate-400">{r.description}</p>}
                    <Citation page={r.sourcePage} quote={r.sourceQuote} />
                  </CardContent>
                </Card>
              ))}
            </Section>
            <Section title={`النواقص (${tender.gapItems.length})`}>
              {tender.gapItems.length === 0 && <Muted>لا نواقص مرصودة.</Muted>}
              {tender.gapItems.map((g) => (
                <Card key={g.id}>
                  <CardContent className="space-y-2 p-5">
                    <div className="flex items-center justify-between">
                      <Badge variant="slate">{GAP_TYPE_LABELS[g.type as GapType]}</Badge>
                      {g.blocking && <Badge variant="red">مانع للتأهل</Badge>}
                    </div>
                    <p className="font-medium text-slate-100">{g.title}</p>
                    {g.description && <p className="text-sm text-slate-400">{g.description}</p>}
                  </CardContent>
                </Card>
              ))}
            </Section>
          </div>
        )}

        {tab === 'score' && (
          <div className="grid gap-6 lg:grid-cols-3">
            <Card>
              <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                {tender.bidScore ? (
                  <>
                    <ScoreRing score={tender.bidScore.totalScore} recommendation={tender.bidScore.recommendation} />
                    <RecommendationBadge rec={tender.bidScore.recommendation} />
                  </>
                ) : (
                  <Muted>لا يوجد تقييم بعد.</Muted>
                )}
              </CardContent>
            </Card>
            <Card className="lg:col-span-2">
              <CardContent className="space-y-4 p-6">
                <h3 className="font-semibold text-slate-100">العوامل</h3>
                {factors.map((f) => (
                  <div key={f.key} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-200">{f.label}</span>
                      <span className="text-slate-400">{f.score}/100 · وزن {Math.round(f.weight * 100)}%</span>
                    </div>
                    <Progress value={f.score} />
                    <p className="text-xs text-slate-500">{f.rationale}</p>
                  </div>
                ))}
                {factors.length === 0 && <Muted>شغّل التحليل لحساب التقييم.</Muted>}
              </CardContent>
            </Card>
          </div>
        )}

        {tab === 'proposal' && (
          <ProposalsPanel
            tenderId={tender.id}
            proposals={proposalVMs}
            canCreate={can(membership.role, 'proposal:create')}
            canUpdate={can(membership.role, 'proposal:update')}
            canDelete={can(membership.role, 'proposal:delete')}
          />
        )}

        {tab === 'decisions' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4 font-semibold text-slate-100">تسجيل قرار</h3>
                <DecisionForm tenderId={tender.id} />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-3 p-6">
                <h3 className="font-semibold text-slate-100">السجل (للقراءة فقط)</h3>
                {tender.decisionLogs.length === 0 && <Muted>لا قرارات مسجلة.</Muted>}
                {tender.decisionLogs.map((log) => (
                  <div key={log.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                    <div className="flex items-center justify-between">
                      <Badge variant={log.decision === 'BID' ? 'emerald' : log.decision === 'NO_BID' ? 'red' : 'gold'}>
                        {DECISION_LABELS[log.decision]}
                      </Badge>
                      <span className="text-xs text-slate-500">{formatDate(log.decidedAt)}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-300">{log.reason}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {tab === 'documents' && (
          <Section title={`المستندات (${tender.documents.length})`}>
            {tender.documents.length === 0 && <Muted>لم تُرفع أي مستندات.</Muted>}
            {tender.documents.map((doc) => (
              <Card key={doc.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gold-400" />
                    <div>
                      <p className="text-sm text-slate-100">{doc.fileName}</p>
                      <p className="text-xs text-slate-500">
                        {(doc.sizeBytes / 1024).toFixed(0)} كيلوبايت · {doc.kind === 'BOOKLET' ? 'كراسة الشروط' : 'مرفق'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </Section>
        )}

        {lastRun && (
          <p className="mt-8 text-center text-xs text-slate-600">
            آخر تحليل: مزوّد {lastRun.provider}
            {lastRun.model ? ` · ${lastRun.model}` : ''} · {lastRun.promptTokens + lastRun.completionTokens} رمز ·
            هذه نتائج مساعدة للقرار وتحتاج مراجعة بشرية.
          </p>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-slate-400">{title}</h3>
      {children}
    </div>
  );
}

function Muted({ children }: { children: ReactNode }) {
  return <p className="text-sm text-slate-500">{children}</p>;
}

function Confidence({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const low = value < 0.7;
  return (
    <span className={cn('text-xs', low ? 'text-amber-300' : 'text-slate-500')}>
      {low ? '⚠ ' : ''}ثقة {pct}%
    </span>
  );
}

function Citation({ page, quote }: { page: number | null; quote?: string | null }) {
  if (!quote && page == null) return null;
  return (
    <div className="flex items-start gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-xs text-slate-400">
      <Quote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-600" />
      <span>
        {quote ? `«${quote}»` : ''}
        {page != null ? ` — صفحة ${page}` : ''}
      </span>
    </div>
  );
}

function EmptyAnalysis() {
  return (
    <Card className="mb-6 flex flex-col items-center gap-3 px-6 py-10 text-center">
      <Sparkles className="h-10 w-10 text-slate-600" />
      <p className="text-slate-200">لم يتم تحليل هذه المناقصة بعد</p>
      <p className="text-sm text-slate-400">اضغط «حلّل الآن» في الأعلى لاستخراج المتطلبات والمخاطر وحساب فرصة الدخول.</p>
    </Card>
  );
}
