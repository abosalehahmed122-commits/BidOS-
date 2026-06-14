import type { ExtractionResult } from '@bid-os/core';

/** One page of a tender booklet, as an image (for vision) and/or text. */
export interface DocumentPage {
  pageNumber: number;
  imageBase64?: string;
  mediaType?: 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif';
  text?: string;
}

export interface AnalyzeTenderInput {
  title: string;
  pages: DocumentPage[];
}

export interface AIUsage {
  provider: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  costCents: number;
}

export interface AnalyzeTenderResult {
  result: ExtractionResult;
  usage: AIUsage;
}

/**
 * Provider-agnostic AI port. Swap implementations (mock ⇄ Claude ⇄ self-hosted)
 * without touching the pipeline or the app.
 */
export interface AIProvider {
  readonly name: string;
  analyzeTender(input: AnalyzeTenderInput): Promise<AnalyzeTenderResult>;
}
