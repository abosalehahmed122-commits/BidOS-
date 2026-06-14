export interface PdfPage {
  pageNumber: number;
  text: string;
}

/**
 * Extract per-page text from a PDF using unpdf (pure JS — no native deps, works
 * in Node/serverless). This feeds the AI provider real booklet content.
 *
 * NOTE: For full Claude *vision* (image) analysis of scanned booklets, page
 * images must be rendered (LibreOffice/Gotenberg or a canvas renderer) and
 * passed as `imageBase64`. Text extraction covers digital PDFs today.
 */
export async function extractPdfPages(bytes: Uint8Array | Buffer): Promise<PdfPage[]> {
  const { extractText, getDocumentProxy } = await import('unpdf');
  const data = bytes instanceof Uint8Array ? new Uint8Array(bytes) : new Uint8Array(bytes);
  const pdf = await getDocumentProxy(data);
  const { text } = await extractText(pdf, { mergePages: false });
  const pages = Array.isArray(text) ? text : [text];
  return pages
    .map((t, i) => ({ pageNumber: i + 1, text: (t ?? '').trim() }))
    .filter((p) => p.text.length > 0);
}
