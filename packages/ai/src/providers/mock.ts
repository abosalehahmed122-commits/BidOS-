import { extractionResultSchema, type ExtractionResult } from '@bid-os/core';
import type { AIProvider, AnalyzeTenderInput, AnalyzeTenderResult } from '../types';

/**
 * Deterministic, offline provider. Returns a plausible Arabic extraction so the
 * whole pipeline (and the UI) works with no API key — and tests stay stable.
 */
export class MockProvider implements AIProvider {
  readonly name = 'mock';

  async analyzeTender(input: AnalyzeTenderInput): Promise<AnalyzeTenderResult> {
    const pageCount = Math.max(1, input.pages.length);

    const result: ExtractionResult = {
      summary: `تحليل تجريبي لكراسة: ${input.title}. (مزوّد mock — لأغراض التطوير والاختبار)`,
      agency: 'جهة حكومية (تجريبي)',
      referenceNumber: null,
      scopeOfWork: 'نطاق عمل تجريبي يشمل التوريد والتركيب والتشغيل.',
      estimatedValueSar: 4_800_000,
      bidBondPercent: 1,
      performanceBondPercent: 5,
      paymentTermsDays: 60,
      requirements: [
        {
          category: 'CERTIFICATION',
          title: 'تصنيف مقاولين في المجال المطلوب',
          description: 'يشترط تصنيف ساري المفعول.',
          mandatory: true,
          sourcePage: 1,
          sourceQuote: 'يجب أن يكون المتقدم مصنفاً في المجال.',
          confidence: 0.9,
        },
        {
          category: 'FINANCIAL',
          title: 'قدرة مالية كافية',
          description: null,
          mandatory: true,
          sourcePage: Math.min(2, pageCount),
          sourceQuote: 'تقديم ما يثبت القدرة المالية.',
          confidence: 0.85,
        },
        {
          category: 'LOCAL_CONTENT',
          title: 'الالتزام بنسبة المحتوى المحلي',
          description: null,
          mandatory: true,
          sourcePage: Math.min(3, pageCount),
          sourceQuote: 'الالتزام بآلية المحتوى المحلي.',
          confidence: 0.78,
        },
      ],
      requiredAttachments: [
        { name: 'السجل التجاري', description: null, mandatory: true, sourcePage: 1, confidence: 0.95 },
        { name: 'شهادة الزكاة والدخل', description: null, mandatory: true, sourcePage: 1, confidence: 0.92 },
      ],
      deadlines: [
        { type: 'INQUIRIES', title: 'آخر موعد للاستفسارات', dueAt: isoInDays(4), sourcePage: 1, confidence: 0.9 },
        { type: 'SUBMISSION', title: 'تسليم العروض', dueAt: isoInDays(12), sourcePage: 1, confidence: 0.95 },
      ],
      risks: [
        {
          severity: 'HIGH',
          category: 'PENALTY',
          title: 'غرامة تأخير مرتفعة',
          description: 'نسبة الغرامة أعلى من المتوسط.',
          sourcePage: Math.min(4, pageCount),
          sourceQuote: 'غرامة 1% أسبوعياً بحد أقصى 10%.',
          confidence: 0.88,
        },
      ],
      gaps: [
        {
          type: 'CLASSIFICATION_GAP',
          title: 'احتمال نقص في درجة التصنيف',
          description: 'يلزم التحقق من درجة التصنيف المطلوبة.',
          blocking: false,
          confidence: 0.6,
        },
      ],
    };

    // The mock honors the same strict contract as real providers.
    const validated = extractionResultSchema.parse(result);

    return {
      result: validated,
      usage: {
        provider: this.name,
        model: 'mock-1',
        promptTokens: pageCount * 800,
        completionTokens: 600,
        costCents: 0,
      },
    };
  }
}

function isoInDays(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString();
}
