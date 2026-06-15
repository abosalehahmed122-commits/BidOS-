import { AlignmentType, Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx';

export interface DocxInput {
  workspaceName: string;
  tenderTitle: string;
  sections: { title: string; contentMd: string }[];
}

function run(text: string, opts: { bold?: boolean; size?: number } = {}) {
  return new TextRun({ text, rightToLeft: true, bold: opts.bold, size: opts.size ?? 24, font: 'Arial' });
}

function para(text: string, opts: { bold?: boolean; size?: number } = {}) {
  return new Paragraph({
    bidirectional: true,
    alignment: AlignmentType.RIGHT,
    spacing: { after: 120 },
    children: [run(text, opts)],
  });
}

function heading(text: string) {
  return new Paragraph({
    bidirectional: true,
    alignment: AlignmentType.RIGHT,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 280, after: 140 },
    children: [run(text, { bold: true, size: 30 })],
  });
}

/**
 * Build an RTL Arabic .docx proposal. PDF output requires a DOCX→PDF converter
 * (LibreOffice/Gotenberg in Docker); this returns the editable Word source.
 */
export async function buildProposalDocx(input: DocxInput): Promise<Buffer> {
  const children: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      bidirectional: true,
      spacing: { before: 1200, after: 240 },
      children: [run(input.workspaceName, { bold: true, size: 44 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      bidirectional: true,
      spacing: { after: 1200 },
      children: [run(input.tenderTitle, { size: 28 })],
    }),
  ];

  for (const section of input.sections) {
    children.push(heading(section.title));
    for (const line of (section.contentMd ?? '').split('\n')) {
      children.push(para(line.length > 0 ? line : ' '));
    }
  }

  const doc = new Document({ sections: [{ children }] });
  return Packer.toBuffer(doc);
}
