'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { forWorkspace, prisma } from '@bid-os/db';
import { can } from '@bid-os/core';
import { requireSession } from '@/lib/session';
import { buildDefaultSections } from '@/lib/proposal-template';

export interface ProposalState {
  error?: string;
  success?: string;
}

export async function generateProposalAction(tenderId: string): Promise<void> {
  const { user, membership } = await requireSession();
  if (!can(membership.role, 'proposal:create')) throw new Error('forbidden');
  const ws = membership.workspaceId;
  const db = forWorkspace(ws);

  const tender = await db.tender.findFirst({
    where: { id: tenderId },
    include: { requirements: true, bidScore: true, deadlines: { orderBy: { dueAt: 'asc' } } },
  });
  if (!tender) throw new Error('not found');

  const workspace = await prisma.workspace.findUnique({ where: { id: ws } });
  const sections = buildDefaultSections(tender, workspace?.name ?? 'الشركة');
  const count = await db.proposal.count({ where: { tenderId } });

  await db.proposal.create({
    data: {
      workspaceId: ws,
      tenderId,
      title: `عرض فني ومالي — ${tender.title}`,
      version: count + 1,
      createdById: user.id,
      sections: {
        create: sections.map((s, i) => ({
          workspaceId: ws,
          type: s.type,
          title: s.title,
          order: i,
          contentMd: s.content,
        })),
      },
    },
  });
  await db.auditLog.create({
    data: { workspaceId: ws, actorId: user.id, action: 'proposal.generate', entity: 'Tender', entityId: tenderId },
  });
  revalidatePath(`/tenders/${tenderId}`);
}

const sectionSchema = z.object({ contentMd: z.string().max(20_000) });

export async function updateSectionAction(
  sectionId: string,
  tenderId: string,
  _prev: ProposalState,
  formData: FormData,
): Promise<ProposalState> {
  const { membership } = await requireSession();
  if (!can(membership.role, 'proposal:update')) return { error: 'لا تملك صلاحية التعديل' };
  const parsed = sectionSchema.safeParse({ contentMd: formData.get('contentMd') });
  if (!parsed.success) return { error: 'محتوى غير صالح' };

  const db = forWorkspace(membership.workspaceId);
  const res = await db.proposalSection.updateMany({
    where: { id: sectionId },
    data: { contentMd: parsed.data.contentMd },
  });
  if (res.count === 0) return { error: 'القسم غير موجود' };
  revalidatePath(`/tenders/${tenderId}`);
  return { success: 'تم حفظ القسم' };
}

export async function deleteProposalAction(proposalId: string, tenderId: string): Promise<void> {
  const { membership } = await requireSession();
  if (!can(membership.role, 'proposal:delete')) throw new Error('forbidden');
  const db = forWorkspace(membership.workspaceId);
  await db.proposal.deleteMany({ where: { id: proposalId } });
  revalidatePath(`/tenders/${tenderId}`);
}
