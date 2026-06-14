'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { forWorkspace, type Prisma } from '@bid-os/db';
import { analyzeAndScore, getProvider, type DocumentPage } from '@bid-os/ai';
import { can, createTenderSchema, ForbiddenError, recordDecisionSchema } from '@bid-os/core';
import { requireSession } from '@/lib/session';
import { getStorage, tenderDocKey } from '@/lib/storage';
import { extractPdfPages } from '@/lib/pdf';
import { enqueue } from '@/lib/queue';

export interface TenderFormState {
  error?: string;
}

async function ctx() {
  const { user, membership } = await requireSession();
  return { user, membership, ws: membership.workspaceId, db: forWorkspace(membership.workspaceId) };
}

function asJson(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

export async function createTenderAction(
  _prev: TenderFormState,
  formData: FormData,
): Promise<TenderFormState> {
  const { user, ws, db, membership } = await ctx();
  if (!can(membership.role, 'tender:create')) {
    return { error: 'لا تملك صلاحية إنشاء مناقصة' };
  }

  const parsed = createTenderSchema.safeParse({
    title: formData.get('title'),
    referenceNumber: formData.get('referenceNumber') || undefined,
    agency: formData.get('agency') || undefined,
    sourceUrl: formData.get('sourceUrl') || undefined,
    submissionDeadline: formData.get('submissionDeadline') || undefined,
    estimatedValueSar: formData.get('estimatedValueSar') || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'بيانات غير صحيحة' };
  }
  const d = parsed.data;

  const tender = await db.tender.create({
    data: {
      workspaceId: ws,
      title: d.title,
      referenceNumber: d.referenceNumber ?? null,
      agency: d.agency ?? null,
      sourceUrl: d.sourceUrl ?? null,
      source: d.sourceUrl ? 'ETIMAD' : 'MANUAL',
      submissionDeadline: d.submissionDeadline ?? null,
      estimatedValue: d.estimatedValueSar != null ? Math.round(d.estimatedValueSar * 100) : null,
      createdById: user.id,
    },
  });

  const booklet = formData.get('booklet');
  if (booklet instanceof File && booklet.size > 0) {
    const buffer = Buffer.from(await booklet.arrayBuffer());
    const key = tenderDocKey(ws, tender.id, booklet.name);
    await getStorage().put({ key, body: buffer, contentType: booklet.type });
    await db.tenderDocument.create({
      data: {
        workspaceId: ws,
        tenderId: tender.id,
        kind: 'BOOKLET',
        fileName: booklet.name,
        mimeType: booklet.type || 'application/pdf',
        sizeBytes: booklet.size,
        storageKey: key,
        uploadedById: user.id,
      },
    });
  }

  await db.auditLog.create({
    data: { workspaceId: ws, actorId: user.id, action: 'tender.create', entity: 'Tender', entityId: tender.id },
  });

  redirect(`/tenders/${tender.id}`);
}

export async function analyzeTenderAction(tenderId: string): Promise<void> {
  const { user, ws, membership, db } = await ctx();
  if (!can(membership.role, 'tender:analyze')) throw new ForbiddenError('tender:analyze');

  const tender = await db.tender.findFirst({ where: { id: tenderId } });
  if (!tender) throw new Error('المناقصة غير موجودة');

  const lastRun = await db.extractionRun.findFirst({
    where: { tenderId },
    orderBy: { version: 'desc' },
  });
  const version = (lastRun?.version ?? 0) + 1;

  const run = await db.extractionRun.create({
    data: {
      workspaceId: ws,
      tenderId,
      version,
      status: 'RUNNING',
      stage: 'EXTRACTING',
      progress: 20,
      provider: process.env.AI_PROVIDER ?? 'mock',
      startedAt: new Date(),
    },
  });

  try {
    const provider = getProvider();

    // Load the booklet and extract real page text to feed the provider.
    const booklet = await db.tenderDocument.findFirst({
      where: { tenderId, kind: 'BOOKLET' },
      orderBy: { createdAt: 'desc' },
    });
    let pages: DocumentPage[] = [];
    if (booklet) {
      try {
        const bytes = await getStorage().read(booklet.storageKey);
        pages = await extractPdfPages(bytes);
        if (pages.length > 0) {
          await db.tenderDocument.update({
            where: { id: booklet.id },
            data: { pageCount: pages.length },
          });
        }
      } catch {
        // Booklet unreadable / not a digital PDF — fall back to title-only.
      }
    }

    const { result, usage, bidScore } = await enqueue('tender.analyze', () =>
      analyzeAndScore(provider, { title: tender.title, pages }),
    );

    // Replace previously derived data (decisions/audit are kept).
    await db.requirement.deleteMany({ where: { tenderId } });
    await db.attachment.deleteMany({ where: { tenderId } });
    await db.deadline.deleteMany({ where: { tenderId } });
    await db.riskItem.deleteMany({ where: { tenderId } });
    await db.gapItem.deleteMany({ where: { tenderId } });

    await db.requirement.createMany({
      data: result.requirements.map((r) => ({
        workspaceId: ws, tenderId, extractionRunId: run.id,
        category: r.category, title: r.title, description: r.description,
        mandatory: r.mandatory, sourcePage: r.sourcePage, sourceQuote: r.sourceQuote, confidence: r.confidence,
      })),
    });
    await db.attachment.createMany({
      data: result.requiredAttachments.map((a) => ({
        workspaceId: ws, tenderId, extractionRunId: run.id,
        name: a.name, description: a.description, mandatory: a.mandatory, sourcePage: a.sourcePage, confidence: a.confidence,
      })),
    });
    await db.deadline.createMany({
      data: result.deadlines.map((dl) => ({
        workspaceId: ws, tenderId, type: dl.type, title: dl.title,
        dueAt: new Date(dl.dueAt), sourcePage: dl.sourcePage, confidence: dl.confidence,
      })),
    });
    await db.riskItem.createMany({
      data: result.risks.map((rk) => ({
        workspaceId: ws, tenderId, extractionRunId: run.id,
        severity: rk.severity, category: rk.category, title: rk.title, description: rk.description,
        sourcePage: rk.sourcePage, sourceQuote: rk.sourceQuote, confidence: rk.confidence,
      })),
    });
    await db.gapItem.createMany({
      data: result.gaps.map((g) => ({
        workspaceId: ws, tenderId, type: g.type, title: g.title,
        description: g.description, blocking: g.blocking, confidence: g.confidence,
      })),
    });

    await db.bidScore.upsert({
      where: { tenderId },
      update: {
        extractionRunId: run.id, totalScore: bidScore.totalScore, recommendation: bidScore.recommendation,
        factors: asJson(bidScore.factors), rationale: bidScore.rationale, computedAt: new Date(),
      },
      create: {
        workspaceId: ws, tenderId, extractionRunId: run.id, totalScore: bidScore.totalScore,
        recommendation: bidScore.recommendation, factors: asJson(bidScore.factors), rationale: bidScore.rationale,
      },
    });

    await db.extractionRun.update({
      where: { id: run.id },
      data: {
        status: 'SUCCEEDED', stage: 'COMPLETED', progress: 100, model: usage.model,
        promptTokens: usage.promptTokens, completionTokens: usage.completionTokens,
        costCents: usage.costCents, result: asJson(result), finishedAt: new Date(),
      },
    });
    await db.tender.update({
      where: { id: tenderId },
      data: {
        status: tender.status === 'NEW' ? 'UNDER_REVIEW' : tender.status,
        estimatedValue:
          result.estimatedValueSar != null ? Math.round(result.estimatedValueSar * 100) : tender.estimatedValue,
      },
    });
    await db.auditLog.create({
      data: { workspaceId: ws, actorId: user.id, action: 'tender.analyze', entity: 'ExtractionRun', entityId: run.id },
    });
  } catch (error) {
    await db.extractionRun.update({
      where: { id: run.id },
      data: { status: 'FAILED', error: String(error), finishedAt: new Date() },
    });
    throw error;
  }

  revalidatePath(`/tenders/${tenderId}`);
}

export async function recordDecisionAction(
  tenderId: string,
  _prev: TenderFormState,
  formData: FormData,
): Promise<TenderFormState> {
  const { user, ws, membership, db } = await ctx();
  if (!can(membership.role, 'decision:create')) {
    return { error: 'لا تملك صلاحية تسجيل القرار' };
  }

  const parsed = recordDecisionSchema.safeParse({
    decision: formData.get('decision'),
    reason: formData.get('reason'),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'بيانات غير صحيحة' };
  }
  const { decision, reason } = parsed.data;

  const bidScore = await db.bidScore.findFirst({ where: { tenderId } });

  await db.decisionLog.create({
    data: {
      workspaceId: ws,
      tenderId,
      decision,
      reason,
      decidedById: user.id,
      bidScoreSnapshot: bidScore
        ? asJson({ totalScore: bidScore.totalScore, recommendation: bidScore.recommendation })
        : undefined,
    },
  });

  const status =
    decision === 'BID' ? 'DECIDED_BID' : decision === 'NO_BID' ? 'DECIDED_NO_BID' : 'UNDER_REVIEW';
  await db.tender.update({ where: { id: tenderId }, data: { status } });
  await db.auditLog.create({
    data: { workspaceId: ws, actorId: user.id, action: 'decision.record', entity: 'Tender', entityId: tenderId },
  });

  revalidatePath(`/tenders/${tenderId}`);
  return {};
}
