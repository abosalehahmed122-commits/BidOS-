// Enum value tuples (kept in sync with prisma/schema.prisma) + Arabic UI labels.
// Values are identical strings to the Prisma enums, so they are interchangeable.

export const ROLES = ['OWNER', 'ADMIN', 'ANALYST', 'VIEWER'] as const;
export type Role = (typeof ROLES)[number];

export const REQUIREMENT_CATEGORIES = [
  'TECHNICAL',
  'FINANCIAL',
  'LEGAL',
  'CERTIFICATION',
  'GUARANTEE',
  'LOCAL_CONTENT',
  'HSE',
  'OTHER',
] as const;
export type RequirementCategory = (typeof REQUIREMENT_CATEGORIES)[number];

export const DEADLINE_TYPES = [
  'INQUIRIES',
  'BID_OPENING',
  'SUBMISSION',
  'SITE_VISIT',
  'AWARD',
  'OTHER',
] as const;
export type DeadlineType = (typeof DEADLINE_TYPES)[number];

export const RISK_SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
export type RiskSeverity = (typeof RISK_SEVERITIES)[number];

export const RISK_CATEGORIES = [
  'PENALTY',
  'INTELLECTUAL_PROPERTY',
  'PAYMENT_TERMS',
  'CONTRADICTION',
  'SCOPE_CREEP',
  'GUARANTEE',
  'INSURANCE',
  'OTHER',
] as const;
export type RiskCategory = (typeof RISK_CATEGORIES)[number];

export const GAP_TYPES = [
  'MISSING_DOCUMENT',
  'MISSING_CERTIFICATION',
  'CAPABILITY_GAP',
  'FINANCIAL_GAP',
  'CLASSIFICATION_GAP',
  'OTHER',
] as const;
export type GapType = (typeof GAP_TYPES)[number];

export const BID_RECOMMENDATIONS = ['BID', 'NO_BID', 'REVIEW'] as const;
export type BidRecommendation = (typeof BID_RECOMMENDATIONS)[number];

export const TENDER_STATUSES = [
  'NEW',
  'UNDER_REVIEW',
  'DECIDED_BID',
  'DECIDED_NO_BID',
  'SUBMITTED',
  'WON',
  'LOST',
  'ARCHIVED',
] as const;
export type TenderStatus = (typeof TENDER_STATUSES)[number];

// --- Arabic UI labels -------------------------------------------------------

export const ROLE_LABELS: Record<Role, string> = {
  OWNER: 'مالك',
  ADMIN: 'مدير',
  ANALYST: 'محلل',
  VIEWER: 'مشاهد',
};

export const REQUIREMENT_CATEGORY_LABELS: Record<RequirementCategory, string> = {
  TECHNICAL: 'متطلب فني',
  FINANCIAL: 'متطلب مالي',
  LEGAL: 'متطلب نظامي',
  CERTIFICATION: 'شهادة/ترخيص',
  GUARANTEE: 'ضمان',
  LOCAL_CONTENT: 'محتوى محلي',
  HSE: 'سلامة وصحة وبيئة',
  OTHER: 'أخرى',
};

export const DEADLINE_TYPE_LABELS: Record<DeadlineType, string> = {
  INQUIRIES: 'آخر موعد للاستفسارات',
  BID_OPENING: 'فتح المظاريف',
  SUBMISSION: 'تسليم العروض',
  SITE_VISIT: 'زيارة الموقع',
  AWARD: 'الترسية',
  OTHER: 'موعد آخر',
};

export const RISK_SEVERITY_LABELS: Record<RiskSeverity, string> = {
  LOW: 'منخفض',
  MEDIUM: 'متوسط',
  HIGH: 'مرتفع',
  CRITICAL: 'حرج',
};

export const RISK_CATEGORY_LABELS: Record<RiskCategory, string> = {
  PENALTY: 'غرامات',
  INTELLECTUAL_PROPERTY: 'ملكية فكرية',
  PAYMENT_TERMS: 'شروط الدفع',
  CONTRADICTION: 'تعارض في الكراسة',
  SCOPE_CREEP: 'توسّع نطاق العمل',
  GUARANTEE: 'ضمانات',
  INSURANCE: 'تأمين',
  OTHER: 'أخرى',
};

export const GAP_TYPE_LABELS: Record<GapType, string> = {
  MISSING_DOCUMENT: 'مستند ناقص',
  MISSING_CERTIFICATION: 'شهادة ناقصة',
  CAPABILITY_GAP: 'نقص في القدرة',
  FINANCIAL_GAP: 'نقص مالي',
  CLASSIFICATION_GAP: 'نقص في التصنيف',
  OTHER: 'أخرى',
};

export const BID_RECOMMENDATION_LABELS: Record<BidRecommendation, string> = {
  BID: 'يُنصح بالدخول',
  NO_BID: 'لا يُنصح بالدخول',
  REVIEW: 'يحتاج مراجعة',
};

export const TENDER_STATUS_LABELS: Record<TenderStatus, string> = {
  NEW: 'جديدة',
  UNDER_REVIEW: 'تحت الدراسة',
  DECIDED_BID: 'تقرر الدخول',
  DECIDED_NO_BID: 'تقرر عدم الدخول',
  SUBMITTED: 'قُدّم العرض',
  WON: 'فائزة',
  LOST: 'خاسرة',
  ARCHIVED: 'مؤرشفة',
};
