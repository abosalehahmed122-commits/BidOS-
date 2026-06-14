import { describe, expect, it } from 'vitest';
import type { ExtractionResult } from '@bid-os/core';
import { analyzeAndScore, deriveScoringSignals } from './pipeline';
import { MockProvider } from './providers/mock';

function resultWith(overrides: Partial<ExtractionResult>): ExtractionResult {
  return {
    summary: '',
    agency: null,
    referenceNumber: null,
    scopeOfWork: null,
    estimatedValueSar: 1_000_000,
    bidBondPercent: null,
    performanceBondPercent: null,
    paymentTermsDays: null,
    requirements: [],
    requiredAttachments: [],
    deadlines: [],
    risks: [],
    gaps: [],
    ...overrides,
  };
}

describe('deriveScoringSignals', () => {
  it('counts blocking gaps and infers classification from a blocking classification gap', () => {
    const signals = deriveScoringSignals(
      resultWith({
        gaps: [
          { type: 'CLASSIFICATION_GAP', title: 'x', description: null, blocking: true, confidence: 0.8 },
        ],
      }),
    );
    expect(signals.blockingGaps).toBe(1);
    expect(signals.classificationMet).toBe(false);
  });

  it('computes the financial capacity ratio from the company profile', () => {
    const signals = deriveScoringSignals(resultWith({ estimatedValueSar: 2_000_000 }), {
      financialCapacitySar: 1_000_000,
    });
    expect(signals.financialCapacityRatio).toBe(0.5);
  });

  it('profile overrides take precedence', () => {
    const signals = deriveScoringSignals(resultWith({}), {
      classificationMet: true,
      activityMatch: 95,
    });
    expect(signals.classificationMet).toBe(true);
    expect(signals.activityMatch).toBe(95);
  });
});

describe('analyzeAndScore', () => {
  it('runs the provider end-to-end and produces a bid score', async () => {
    const out = await analyzeAndScore(new MockProvider(), {
      title: 'منافسة',
      pages: [{ pageNumber: 1, text: 'x' }],
    });
    expect(out.result.requirements.length).toBeGreaterThan(0);
    expect(out.bidScore.totalScore).toBeGreaterThanOrEqual(0);
    expect(out.bidScore.totalScore).toBeLessThanOrEqual(100);
    expect(['BID', 'NO_BID', 'REVIEW']).toContain(out.bidScore.recommendation);
  });
});
