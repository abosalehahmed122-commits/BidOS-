import type { BidRecommendation } from './constants';

export interface BidFactor {
  key: string;
  label: string;
  /** Relative importance; weights are normalized internally. */
  weight: number;
  /** 0..100 */
  score: number;
  rationale: string;
}

export interface BidScoreResult {
  totalScore: number;
  recommendation: BidRecommendation;
  factors: BidFactor[];
  rationale: string;
}

export const DEFAULT_THRESHOLDS = { bid: 70, review: 50 } as const;

/** Weighted 0..100 score from raw factors (weights normalized, score clamped). */
export function computeWeightedScore(factors: BidFactor[]): number {
  const totalWeight = factors.reduce((sum, f) => sum + Math.max(0, f.weight), 0);
  if (totalWeight === 0) return 0;
  const weighted = factors.reduce((sum, f) => {
    const score = Math.min(100, Math.max(0, f.score));
    return sum + score * Math.max(0, f.weight);
  }, 0);
  return Math.round(weighted / totalWeight);
}

export function recommendationFor(
  totalScore: number,
  thresholds = DEFAULT_THRESHOLDS,
): BidRecommendation {
  if (totalScore >= thresholds.bid) return 'BID';
  if (totalScore >= thresholds.review) return 'REVIEW';
  return 'NO_BID';
}

// --- Domain-level scoring ---------------------------------------------------

export type CompetitionLevel = 'LOW' | 'MEDIUM' | 'HIGH';

/** Signals derived from the extraction + the company profile. */
export interface ScoringSignals {
  /** 0..100 — how well the tender matches the company's core activity. */
  activityMatch: number;
  /** Is the required contractor classification met? */
  classificationMet: boolean;
  /** company financial capacity ÷ required capacity (1 = exactly enough). */
  financialCapacityRatio: number;
  /** All mandatory certifications already held? */
  hasRequiredCertifications: boolean;
  /** 0..100 — feasibility of delivering within the timeline. */
  timelineFeasibility: number;
  expectedCompetition: CompetitionLevel;
  /** Expected gross margin percentage, e.g. 8 for 8%. */
  expectedMarginPct: number;
  /** Number of blocking gaps (e.g., missing mandatory classification). */
  blockingGaps: number;
}

export interface ScoringWeights {
  activityMatch: number;
  classification: number;
  financial: number;
  timeline: number;
  competition: number;
  margin: number;
}

export const DEFAULT_WEIGHTS: ScoringWeights = {
  activityMatch: 0.2,
  classification: 0.2,
  financial: 0.2,
  timeline: 0.15,
  competition: 0.15,
  margin: 0.1,
};

function competitionScore(level: CompetitionLevel): number {
  return level === 'LOW' ? 90 : level === 'MEDIUM' ? 60 : 30;
}

function marginScore(pct: number): number {
  // <3% poor, ~10% good, >=15% excellent.
  if (pct <= 0) return 0;
  return Math.min(100, Math.round((pct / 15) * 100));
}

function financialScore(ratio: number): number {
  if (ratio <= 0) return 0;
  return Math.min(100, Math.round(ratio * 70)); // ratio 1.43+ => 100
}

/**
 * Produces an explainable Bid/No-Bid score. Each factor carries an Arabic
 * rationale. Blocking gaps cap the recommendation so a "BID" never hides a
 * disqualifier.
 */
export function scoreTender(
  signals: ScoringSignals,
  weights: ScoringWeights = DEFAULT_WEIGHTS,
  thresholds = DEFAULT_THRESHOLDS,
): BidScoreResult {
  const factors: BidFactor[] = [
    {
      key: 'activity_match',
      label: 'مطابقة النشاط',
      weight: weights.activityMatch,
      score: clamp(signals.activityMatch),
      rationale:
        signals.activityMatch >= 70
          ? 'المنافسة ضمن نشاط الشركة الأساسي.'
          : 'المنافسة بعيدة جزئياً عن نشاط الشركة الأساسي.',
    },
    {
      key: 'classification',
      label: 'التصنيف',
      weight: weights.classification,
      score: signals.classificationMet ? 95 : 35,
      rationale: signals.classificationMet
        ? 'تصنيف الشركة يستوفي الشرط.'
        : 'تصنيف الشركة لا يستوفي الدرجة المطلوبة — قد يكون مانعاً للتأهل.',
    },
    {
      key: 'financial',
      label: 'القدرة المالية',
      weight: weights.financial,
      score: financialScore(signals.financialCapacityRatio),
      rationale:
        signals.financialCapacityRatio >= 1
          ? 'القدرة المالية كافية لمتطلبات المنافسة.'
          : 'القدرة المالية أقل من المطلوب.',
    },
    {
      key: 'timeline',
      label: 'الجدول الزمني',
      weight: weights.timeline,
      score: clamp(signals.timelineFeasibility),
      rationale:
        signals.timelineFeasibility >= 70
          ? 'المدة الزمنية قابلة للتحقيق.'
          : 'المدة الزمنية ضاغطة وتحتاج خطة تعبئة دقيقة.',
    },
    {
      key: 'competition',
      label: 'المنافسة المتوقعة',
      weight: weights.competition,
      score: competitionScore(signals.expectedCompetition),
      rationale: `مستوى المنافسة المتوقع ${
        signals.expectedCompetition === 'LOW'
          ? 'منخفض'
          : signals.expectedCompetition === 'MEDIUM'
            ? 'متوسط'
            : 'مرتفع'
      }.`,
    },
    {
      key: 'margin',
      label: 'هامش الربح المتوقع',
      weight: weights.margin,
      score: marginScore(signals.expectedMarginPct),
      rationale:
        signals.expectedMarginPct >= 8
          ? 'هامش الربح المتوقع جيد.'
          : 'هامش الربح المتوقع منخفض بعد تسعير المخاطر.',
    },
  ];

  if (!signals.hasRequiredCertifications) {
    const cert = factors.find((f) => f.key === 'classification');
    if (cert) cert.rationale += ' كما توجد شهادات مطلوبة غير متوفرة.';
  }

  const totalScore = computeWeightedScore(factors);
  let recommendation = recommendationFor(totalScore, thresholds);

  // Blocking gaps cannot be outscored.
  if (signals.blockingGaps > 0 && recommendation === 'BID') {
    recommendation = 'REVIEW';
  }

  const sorted = [...factors].sort((a, b) => a.score - b.score);
  const weakest = sorted[0];
  const strongest = sorted[sorted.length - 1];
  let rationale = `الدرجة الإجمالية ${totalScore}/100. أقوى عامل: ${strongest!.label}، وأضعف عامل: ${weakest!.label}.`;
  if (signals.blockingGaps > 0) {
    rationale += ` يوجد ${signals.blockingGaps} نقص حرج يجب معالجته قبل التقديم.`;
  }

  return { totalScore, recommendation, factors, rationale };
}

function clamp(n: number): number {
  return Math.min(100, Math.max(0, Math.round(n)));
}
