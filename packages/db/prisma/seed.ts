/**
 * Seed — realistic Arabic demo data for Bid OS.
 * Run with: pnpm db:seed   (requires a live DATABASE_URL)
 *
 * Uses the base client with explicit `workspaceId` (Prisma's create types require
 * it). At runtime, app code reads through `forWorkspace()` for tenant isolation.
 */
import bcrypt from 'bcryptjs';
import { prisma } from '../src/client';
import {
  BidRecommendation,
  DeadlineType,
  DecisionType,
  CompanyDocumentType,
  ProposalSectionType,
  ProposalStatus,
  RequirementCategory,
  RiskCategory,
  RiskSeverity,
  Role,
  SubscriptionStatus,
  TenderSource,
  TenderStatus,
} from '@prisma/client';

const WS = 'demo-workspace';
const USER = 'demo-user';
const TENDER = 'demo-tender';

function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

async function main() {
  // --- Plans -------------------------------------------------------------
  const plans = [
    {
      code: 'trial',
      name: 'تجريبي',
      priceMonthly: 0,
      limits: { tendersPerMonth: 2, aiPagesPerMonth: 60, seats: 2, storageBytes: 524288000, proposalsPerMonth: 1 },
      features: ['تحليل كراسة', 'تقييم فرصة الدخول'],
    },
    {
      code: 'basic',
      name: 'أساسي',
      priceMonthly: 14900, // 149 ر.س قبل الضريبة (171.35 شامل 15%)
      limits: { tendersPerMonth: 10, aiPagesPerMonth: 600, seats: 5, storageBytes: 5368709120, proposalsPerMonth: 10 },
      features: ['كل ميزات التجريبي', 'مكتبة وثائق الشركة', 'توليد العروض'],
    },
    {
      code: 'pro',
      name: 'احترافي',
      priceMonthly: 49900, // 499 ر.س قبل الضريبة (573.85 شامل 15%)
      limits: { tendersPerMonth: 40, aiPagesPerMonth: 3000, seats: 15, storageBytes: 53687091200, proposalsPerMonth: 40 },
      features: ['كل ميزات الأساسي', 'فرق العمل والمهام', 'رادار المواعيد', 'تحليلات متقدمة'],
    },
    {
      code: 'enterprise',
      name: 'مؤسسات',
      priceMonthly: 0,
      limits: { tendersPerMonth: -1, aiPagesPerMonth: -1, seats: -1, storageBytes: -1, proposalsPerMonth: -1 },
      features: ['كل ميزات الاحترافي', 'حدود مخصصة', 'OCR ذاتي الاستضافة', 'دعم مخصص'],
    },
  ];
  for (const p of plans) {
    await prisma.plan.upsert({ where: { code: p.code }, update: { name: p.name, priceMonthly: p.priceMonthly, limits: p.limits, features: p.features }, create: p });
  }
  const proPlan = await prisma.plan.findUniqueOrThrow({ where: { code: 'pro' } });

  // --- User + Workspace + Membership + Subscription ----------------------
  const passwordHash = await bcrypt.hash('Demo1234!', 10);
  await prisma.user.upsert({
    where: { id: USER },
    update: {},
    create: { id: USER, email: 'demo@bid-os.sa', name: 'أحمد العتيبي', passwordHash, emailVerified: new Date() },
  });
  await prisma.workspace.upsert({
    where: { id: WS },
    update: {},
    create: { id: WS, name: 'شركة الإنشاءات المتقدمة', slug: 'advanced-construction', vatNumber: '300000000000003', crNumber: '1010101010' },
  });
  await prisma.membership.upsert({
    where: { userId_workspaceId: { userId: USER, workspaceId: WS } },
    update: { role: Role.OWNER },
    create: { userId: USER, workspaceId: WS, role: Role.OWNER },
  });
  await prisma.subscription.upsert({
    where: { workspaceId: WS },
    update: {},
    create: { workspaceId: WS, planId: proPlan.id, status: SubscriptionStatus.TRIALING, currentPeriodEnd: daysFromNow(14) },
  });

  // --- Tender + analysis -------------------------------------------------
  await prisma.tender.upsert({
    where: { id: TENDER },
    update: {},
    create: {
      id: TENDER,
      workspaceId: WS,
      title: 'إنشاء وتأهيل مبنى إداري للجهة الحكومية',
      referenceNumber: '250139000123',
      agency: 'وزارة الشؤون البلدية والقروية والإسكان',
      source: TenderSource.MANUAL,
      status: TenderStatus.UNDER_REVIEW,
      submissionDeadline: daysFromNow(12),
      estimatedValue: 480000000,
      createdById: USER,
    },
  });

  if ((await prisma.requirement.count({ where: { tenderId: TENDER } })) === 0) {
    await prisma.requirement.createMany({
      data: [
        { workspaceId: WS, tenderId: TENDER, category: RequirementCategory.CERTIFICATION, title: 'تصنيف مقاولين درجة رابعة في مجال المباني', mandatory: true, sourcePage: 4, sourceQuote: 'يشترط أن يكون المتقدم مصنفاً في مجال المباني درجة رابعة على الأقل.', confidence: 0.94 },
        { workspaceId: WS, tenderId: TENDER, category: RequirementCategory.FINANCIAL, title: 'قدرة مالية لا تقل عن 5 ملايين ريال', mandatory: true, sourcePage: 5, sourceQuote: 'تقديم ما يثبت القدرة المالية بقيمة لا تقل عن (5,000,000) ريال.', confidence: 0.9 },
        { workspaceId: WS, tenderId: TENDER, category: RequirementCategory.LOCAL_CONTENT, title: 'الالتزام بنسبة المحتوى المحلي المطلوبة', mandatory: true, sourcePage: 7, sourceQuote: 'الالتزام بالحد الأدنى لنسبة المحتوى المحلي وفق آلية هيئة المحتوى المحلي.', confidence: 0.82 },
        { workspaceId: WS, tenderId: TENDER, category: RequirementCategory.TECHNICAL, title: 'خبرة في تنفيذ ثلاثة مشاريع مماثلة خلال 5 سنوات', mandatory: true, sourcePage: 6, sourceQuote: 'إرفاق ما يثبت تنفيذ ثلاثة مشاريع مماثلة خلال الخمس سنوات الماضية.', confidence: 0.88 },
      ],
    });
    await prisma.deadline.createMany({
      data: [
        { workspaceId: WS, tenderId: TENDER, type: DeadlineType.INQUIRIES, title: 'آخر موعد للاستفسارات', dueAt: daysFromNow(4), sourcePage: 2, confidence: 0.95 },
        { workspaceId: WS, tenderId: TENDER, type: DeadlineType.SUBMISSION, title: 'آخر موعد لتقديم العروض', dueAt: daysFromNow(12), sourcePage: 2, confidence: 0.97 },
        { workspaceId: WS, tenderId: TENDER, type: DeadlineType.BID_OPENING, title: 'فتح المظاريف', dueAt: daysFromNow(13), sourcePage: 2, confidence: 0.93 },
      ],
    });
    await prisma.riskItem.createMany({
      data: [
        { workspaceId: WS, tenderId: TENDER, severity: RiskSeverity.HIGH, category: RiskCategory.PENALTY, title: 'غرامة تأخير مرتفعة (1% أسبوعياً بحد أقصى 10%)', description: 'نسبة غرامة التأخير أعلى من المتوسط في مشاريع مماثلة.', sourcePage: 9, sourceQuote: 'تُطبق غرامة تأخير بنسبة 1% عن كل أسبوع تأخير بحد أقصى 10% من قيمة العقد.', confidence: 0.91 },
        { workspaceId: WS, tenderId: TENDER, severity: RiskSeverity.MEDIUM, category: RiskCategory.PAYMENT_TERMS, title: 'مدة سداد المستخلصات 60 يوماً', description: 'قد تؤثر على التدفق النقدي للمشروع.', sourcePage: 10, confidence: 0.8 },
      ],
    });
    await prisma.gapItem.createMany({
      data: [
        { workspaceId: WS, tenderId: TENDER, type: 'CLASSIFICATION_GAP', title: 'شهادة التصنيف الحالية درجة خامسة', description: 'المطلوب درجة رابعة — يلزم ترقية التصنيف قبل التقديم.', blocking: true, confidence: 0.85 },
      ],
    });
    await prisma.bidScore.create({
      data: {
        workspaceId: WS,
        tenderId: TENDER,
        totalScore: 62,
        recommendation: BidRecommendation.REVIEW,
        rationale: 'الفرصة واعدة من حيث القيمة والمجال، لكنها مشروطة بترقية التصنيف وتحسين هامش الربح بسبب غرامة التأخير المرتفعة.',
        factors: [
          { key: 'activity_match', label: 'مطابقة النشاط', weight: 0.2, score: 90, rationale: 'المجال (المباني) ضمن نشاط الشركة الأساسي.' },
          { key: 'classification', label: 'التصنيف', weight: 0.2, score: 40, rationale: 'التصنيف الحالي أدنى من المطلوب بدرجة واحدة.' },
          { key: 'financial', label: 'القدرة المالية', weight: 0.2, score: 75, rationale: 'القدرة المالية كافية لكنها قريبة من الحد الأدنى.' },
          { key: 'timeline', label: 'الجدول الزمني', weight: 0.15, score: 70, rationale: 'المدة معقولة مع ضغط بسيط على التعبئة.' },
          { key: 'risk', label: 'المخاطر', weight: 0.15, score: 45, rationale: 'غرامة تأخير مرتفعة وشروط سداد متأخرة.' },
          { key: 'margin', label: 'هامش الربح المتوقع', weight: 0.1, score: 65, rationale: 'هامش مقبول بعد تسعير المخاطر.' },
        ],
      },
    });
    await prisma.decisionLog.create({
      data: {
        workspaceId: WS,
        tenderId: TENDER,
        decision: DecisionType.DEFER,
        reason: 'تأجيل القرار لحين التأكد من إمكانية ترقية التصنيف خلال أسبوع.',
        decidedById: USER,
        bidScoreSnapshot: { totalScore: 62, recommendation: 'REVIEW' },
      },
    });
    const proposal = await prisma.proposal.create({
      data: { workspaceId: WS, tenderId: TENDER, title: 'العرض الفني والمالي — مبنى إداري', status: ProposalStatus.DRAFT, createdById: USER },
    });
    await prisma.proposalSection.createMany({
      data: [
        { workspaceId: WS, proposalId: proposal.id, type: ProposalSectionType.COVER, title: 'الغلاف', order: 0, contentMd: '# العرض الفني والمالي' },
        { workspaceId: WS, proposalId: proposal.id, type: ProposalSectionType.METHODOLOGY, title: 'المنهجية', order: 1, contentMd: 'منهجية التنفيذ على ثلاث مراحل...' },
        { workspaceId: WS, proposalId: proposal.id, type: ProposalSectionType.TIMELINE, title: 'الجدول الزمني', order: 2 },
        { workspaceId: WS, proposalId: proposal.id, type: ProposalSectionType.PRICING_BOQ, title: 'جدول الكميات والأسعار', order: 3 },
      ],
    });
  }

  if ((await prisma.companyDocument.count({ where: { workspaceId: WS } })) === 0) {
    await prisma.companyDocument.createMany({
      data: [
        { workspaceId: WS, type: CompanyDocumentType.COMMERCIAL_REGISTRATION, name: 'السجل التجاري', fileName: 'cr.pdf', mimeType: 'application/pdf', sizeBytes: 102400, storageKey: 'seed/cr.pdf', expiryDate: daysFromNow(180), uploadedById: USER },
        { workspaceId: WS, type: CompanyDocumentType.ZAKAT_CERTIFICATE, name: 'شهادة الزكاة', fileName: 'zakat.pdf', mimeType: 'application/pdf', sizeBytes: 98304, storageKey: 'seed/zakat.pdf', expiryDate: daysFromNow(20), uploadedById: USER },
        { workspaceId: WS, type: CompanyDocumentType.CONTRACTOR_CLASSIFICATION, name: 'شهادة تصنيف المقاولين', fileName: 'classification.pdf', mimeType: 'application/pdf', sizeBytes: 110592, storageKey: 'seed/classification.pdf', expiryDate: daysFromNow(400), uploadedById: USER },
      ],
    });
  }

  console.log('✓ Seed complete. Login: demo@bid-os.sa / Demo1234!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
