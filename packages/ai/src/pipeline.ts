import {
  scoreTender,
  type BidScoreResult,
  type CompetitionLevel,
  type ExtractionResult,
  type ScoringSignals,
} from '@bid-os/core';
import type { AIProvider, AIUsage, AnalyzeTenderInput } from './types';

/** Company-specific overrides for scoring. Anything omitted uses sane defaults. */
export interface CompanyProfile {
  activityMatch?: number;
  classificationMet?: boolean;
  financialCapacitySar?: number;
  hasRequiredCertifications?: boolean;
  timelineFeasibility?: number;
  expectedCompetition?: CompetitionLevel;
  expectedMarginPct?: number;
}

/** Map an extraction result + company profile into scoring signals. */
export function deriveScoringSignals(
  result: ExtractionResult,
  profile: CompanyProfile = {},
): ScoringSignals {
  const blockingGaps = result.gaps.filter((g) => g.blocking).length;
  const requiredCapacity = result.estimatedValueSar ?? 0;

  const financialCapacityRatio =
    profile.financialCapacitySar && requiredCapacity > 0
      ? profile.financialCapacitySar / requiredCapacity
      : 1;

  const classificationMet =
    profile.classificationMet ??
    !result.gaps.some((g) => g.type === 'CLASSIFICATION_GAP' && g.blocking);

  return {
    activityMatch: profile.activityMatch ?? 70,
    classificationMet,
    financialCapacityRatio,
    hasRequiredCertifications: profile.hasRequiredCertifications ?? true,
    timelineFeasibility: profile.timelineFeasibility ?? 65,
    expectedCompetition: profile.expectedCompetition ?? 'MEDIUM',
    expectedMarginPct: profile.expectedMarginPct ?? 8,
    blockingGaps,
  };
}

export interface AnalyzeAndScoreOutput {
  result: ExtractionResult;
  usage: AIUsage;
  signals: ScoringSignals;
  bidScore: BidScoreResult;
}

/** Full analysis: run the provider, derive signals, compute the Bid/No-Bid score. */
export async function analyzeAndScore(
  provider: AIProvider,
  input: AnalyzeTenderInput,
  profile: CompanyProfile = {},
): Promise<AnalyzeAndScoreOutput> {
  const { result, usage } = await provider.analyzeTender(input);
  const signals = deriveScoringSignals(result, profile);
  const bidScore = scoreTender(signals);
  return { result, usage, signals, bidScore };
}
