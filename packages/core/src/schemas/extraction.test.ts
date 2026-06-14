import { describe, expect, it } from 'vitest';
import { extractionResultSchema } from './extraction';

const valid = {
  summary: 'منافسة لإنشاء مبنى إداري.',
  agency: 'وزارة الإسكان',
  referenceNumber: '250139000123',
  scopeOfWork: 'أعمال إنشائية ومعمارية.',
  estimatedValueSar: 4800000,
  bidBondPercent: 1,
  performanceBondPercent: 5,
  paymentTermsDays: 60,
  requirements: [
    {
      category: 'CERTIFICATION',
      title: 'تصنيف درجة رابعة',
      description: null,
      mandatory: true,
      sourcePage: 4,
      sourceQuote: 'يشترط التصنيف درجة رابعة',
      confidence: 0.9,
    },
  ],
  requiredAttachments: [
    { name: 'السجل التجاري', description: null, mandatory: true, sourcePage: 3, confidence: 0.95 },
  ],
  deadlines: [
    { type: 'SUBMISSION', title: 'تسليم العروض', dueAt: '2026-07-01', sourcePage: 2, confidence: 0.97 },
  ],
  risks: [
    {
      severity: 'HIGH',
      category: 'PENALTY',
      title: 'غرامة تأخير مرتفعة',
      description: null,
      sourcePage: 9,
      sourceQuote: 'غرامة 1% أسبوعياً',
      confidence: 0.9,
    },
  ],
  gaps: [{ type: 'CLASSIFICATION_GAP', title: 'التصنيف الحالي أدنى', description: null, blocking: true, confidence: 0.8 }],
};

describe('extractionResultSchema', () => {
  it('accepts a well-formed extraction result', () => {
    const parsed = extractionResultSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  it('rejects confidence outside 0..1', () => {
    const bad = JSON.parse(JSON.stringify(valid));
    bad.requirements[0]!.confidence = 1.5;
    expect(extractionResultSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects an unknown requirement category', () => {
    const bad = JSON.parse(JSON.stringify(valid));
    (bad.requirements[0] as { category: string }).category = 'NONSENSE';
    expect(extractionResultSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects a missing required array', () => {
    const bad = JSON.parse(JSON.stringify(valid)) as Record<string, unknown>;
    delete bad.deadlines;
    expect(extractionResultSchema.safeParse(bad).success).toBe(false);
  });
});
