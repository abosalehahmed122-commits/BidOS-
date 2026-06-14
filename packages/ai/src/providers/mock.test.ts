import { describe, expect, it } from 'vitest';
import { extractionResultSchema } from '@bid-os/core';
import { MockProvider } from './mock';

describe('MockProvider', () => {
  it('returns a schema-valid extraction result', async () => {
    const provider = new MockProvider();
    const { result, usage } = await provider.analyzeTender({
      title: 'منافسة تجريبية',
      pages: [{ pageNumber: 1, text: 'نص' }],
    });
    expect(extractionResultSchema.safeParse(result).success).toBe(true);
    expect(result.requirements.length).toBeGreaterThan(0);
    expect(usage.provider).toBe('mock');
  });

  it('every extracted item carries a confidence in 0..1', async () => {
    const { result } = await new MockProvider().analyzeTender({ title: 't', pages: [] });
    for (const r of result.requirements) {
      expect(r.confidence).toBeGreaterThanOrEqual(0);
      expect(r.confidence).toBeLessThanOrEqual(1);
    }
  });
});
