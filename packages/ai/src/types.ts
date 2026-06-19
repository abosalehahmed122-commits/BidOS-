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
  /**
   * Whole-booklet PDF (base64). When present, providers that support native PDF
   * input send it directly — Claude reads scanned AND digital PDFs with
   * page-accurate citations, no separate OCR/render step. Takes precedence over
   * `pages` on the Anthropic provider.
   */
  pdfBase64?: string;
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
