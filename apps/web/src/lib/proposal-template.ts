import {
  BID_RECOMMENDATION_LABELS,
  DEADLINE_TYPE_LABELS,
  type BidRecommendation,
  type DeadlineType,
} from '@bid-os/core';

export type SectionType =
  | 'COVER'
  | 'EXECUTIVE_SUMMARY'
  | 'METHODOLOGY'
  | 'TIMELINE'
  | 'TEAM'
  | 'EXPERIENCE'
  | 'PRICING_BOQ'
  | 'COMPLIANCE';

export interface TemplateSection {
  type: SectionType;
  title: string;
  content: string;
}

interface TemplateTender {
  title: string;
  agency: string | null;
  referenceNumber: string | null;
  requirements: { title: string; mandatory: boolean; sourcePage: number | null }[];
  deadlines: { type: string; dueAt: Date }[];
  bidScore: { totalScore: number; recommendation: string } | null;
}

const arDate = (d: Date) => new Intl.DateTimeFormat('ar-SA-u-ca-gregory').format(d);

export function buildDefaultSections(tender: TemplateTender, workspaceName: string): TemplateSection[] {
  const mandatory = tender.requirements.filter((r) => r.mandatory);
  const compliance = mandatory.length
    ? mandatory
        .map((r) => `• ${r.title}${r.sourcePage ? ` (مرجع: صفحة ${r.sourcePage})` : ''}`)
        .join('\n')
    : 'تُستكمل مصفوفة الامتثال بعد تحليل كراسة الشروط.';

  const timeline = tender.deadlines.length
    ? tender.deadlines
        .map((d) => `• ${DEADLINE_TYPE_LABELS[d.type as DeadlineType]}: ${arDate(d.dueAt)}`)
        .join('\n')
    : 'يُحدّد الجدول الزمني التفصيلي وفق مواعيد الكراسة ونطاق العمل.';

  const scoreLine = tender.bidScore
    ? `بلغت درجة فرصة الدخول ${tender.bidScore.totalScore}/100 (${BID_RECOMMENDATION_LABELS[tender.bidScore.recommendation as BidRecommendation]}). `
    : '';

  return [
    {
      type: 'COVER',
      title: 'الغلاف',
      content: `${workspaceName}\n\nعرض فني ومالي\n\nمقدّم إلى: ${tender.agency ?? 'الجهة المالكة'}\n\nبخصوص: ${tender.title}${tender.referenceNumber ? `\nرقم المنافسة: ${tender.referenceNumber}` : ''}\n\nالتاريخ: ${arDate(new Date())}`,
    },
    {
      type: 'EXECUTIVE_SUMMARY',
      title: 'الملخص التنفيذي',
      content: `يسر ${workspaceName} تقديم عرضها للمشاركة في «${tender.title}». ${scoreLine}يقدّم هذا العرض منهجية تنفيذ متكاملة، وفريق عمل مؤهلاً، وجدولاً زمنياً واقعياً، مع التزام كامل بمتطلبات كراسة الشروط.`,
    },
    {
      type: 'METHODOLOGY',
      title: 'منهجية التنفيذ',
      content:
        'تعتمد منهجيتنا على مراحل واضحة: التخطيط والتعبئة، ثم التنفيذ، فضبط الجودة والسلامة، ثم التسليم والإغلاق.\n(حرّر هذا القسم بما يتوافق مع نطاق العمل في الكراسة.)',
    },
    { type: 'TIMELINE', title: 'الجدول الزمني', content: timeline },
    {
      type: 'TEAM',
      title: 'فريق العمل',
      content:
        'يُدرج هنا الهيكل التنظيمي للمشروع والسير الذاتية لأعضاء الفريق المقترح، مع إمكانية السحب من مكتبة وثائق الشركة.',
    },
    {
      type: 'EXPERIENCE',
      title: 'الخبرات السابقة',
      content:
        'تُدرج هنا سابقة الأعمال والمشاريع المماثلة وشهادات إنجاز الأعمال من مكتبة وثائق الشركة.',
    },
    {
      type: 'PRICING_BOQ',
      title: 'جدول الكميات والأسعار (BoQ)',
      content:
        'م | البند | الوحدة | الكمية | سعر الوحدة | الإجمالي\n١ | — | — | — | — | —\n٢ | — | — | — | — | —\n\nالإجمالي قبل الضريبة: —\nضريبة القيمة المضافة (15%): —\nالإجمالي شامل الضريبة: —',
    },
    { type: 'COMPLIANCE', title: 'مصفوفة الامتثال للمتطلبات', content: compliance },
  ];
}
