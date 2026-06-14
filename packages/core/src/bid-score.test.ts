import { describe, expect, it } from 'vitest';
import {
  computeWeightedScore,
  recommendationFor,
  scoreTender,
  type ScoringSignals,
} from './bid-score';

const strongSignals: ScoringSignals = {
  activityMatch: 95,
  classificationMet: true,
  financialCapacityRatio: 1.5,
  hasRequiredCertifications: true,
  timelineFeasibility: 85,
  expectedCompetition: 'LOW',
  expectedMarginPct: 12,
  blockingGaps: 0,
};

describe('computeWeightedScore', () => {
  it('normalizes weights and clamps scores', () => {
    const score = computeWeightedScore([
      { key: 'a', label: 'a', weight: 1, score: 100, rationale: '' },
      { key: 'b', label: 'b', weight: 1, score: 0, rationale: '' },
    ]);
    expect(score).toBe(50);
  });

  it('returns 0 when total weight is 0', () => {
    expect(computeWeightedScore([])).toBe(0);
  });

  it('clamps out-of-range scores', () => {
    const score = computeWeightedScore([
      { key: 'a', label: 'a', weight: 1, score: 250, rationale: '' },
    ]);
    expect(score).toBe(100);
  });
});

describe('recommendationFor', () => {
  it('maps thresholds correctly', () => {
    expect(recommendationFor(80)).toBe('BID');
    expect(recommendationFor(60)).toBe('REVIEW');
    expect(recommendationFor(30)).toBe('NO_BID');
  });
});

describe('scoreTender', () => {
  it('recommends BID for strong signals with no blocking gaps', () => {
    const result = scoreTender(strongSignals);
    expect(result.totalScore).toBeGreaterThanOrEqual(70);
    expect(result.recommendation).toBe('BID');
    expect(result.factors).toHaveLength(6);
    expect(result.rationale).toContain('الدرجة الإجمالية');
  });

  it('never returns BID when there is a blocking gap', () => {
    const result = scoreTender({ ...strongSignals, blockingGaps: 1 });
    expect(result.recommendation).not.toBe('BID');
    expect(result.rationale).toContain('نقص حرج');
  });

  it('penalizes a missing classification', () => {
    const withClassification = scoreTender(strongSignals).totalScore;
    const withoutClassification = scoreTender({
      ...strongSignals,
      classificationMet: false,
    }).totalScore;
    expect(withoutClassification).toBeLessThan(withClassification);
  });

  it('recommends NO_BID for weak signals', () => {
    const result = scoreTender({
      activityMatch: 30,
      classificationMet: false,
      financialCapacityRatio: 0.4,
      hasRequiredCertifications: false,
      timelineFeasibility: 35,
      expectedCompetition: 'HIGH',
      expectedMarginPct: 2,
      blockingGaps: 2,
    });
    expect(result.recommendation).toBe('NO_BID');
    expect(result.totalScore).toBeLessThan(50);
  });
});
