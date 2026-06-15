import { forWorkspace, prisma } from '@bid-os/db';
import { requireSession } from '@/lib/session';
import { buildProposalDocx } from '@/lib/docx';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { membership } = await requireSession();
  const db = forWorkspace(membership.workspaceId);

  const proposal = await db.proposal.findFirst({
    where: { id: params.id },
    include: { sections: { orderBy: { order: 'asc' } }, tender: true },
  });
  if (!proposal) return new Response('غير موجود', { status: 404 });

  const workspace = await prisma.workspace.findUnique({ where: { id: membership.workspaceId } });
  const buffer = await buildProposalDocx({
    workspaceName: workspace?.name ?? 'الشركة',
    tenderTitle: proposal.tender.title,
    sections: proposal.sections.map((s) => ({ title: s.title, contentMd: s.contentMd ?? '' })),
  });

  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="proposal-v${proposal.version}.docx"`,
    },
  });
}
