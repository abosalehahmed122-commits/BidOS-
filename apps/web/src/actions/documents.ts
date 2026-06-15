'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { forWorkspace } from '@bid-os/db';
import { can } from '@bid-os/core';
import { requireSession } from '@/lib/session';
import { getStorage } from '@/lib/storage';

export interface DocState {
  error?: string;
  success?: string;
}

const COMPANY_DOC_TYPES = [
  'COMMERCIAL_REGISTRATION',
  'ZAKAT_CERTIFICATE',
  'GOSI_CERTIFICATE',
  'CONTRACTOR_CLASSIFICATION',
  'VAT_CERTIFICATE',
  'CHAMBER_MEMBERSHIP',
  'COMPANY_PROFILE',
  'CV',
  'PREVIOUS_WORK',
  'BANK_GUARANTEE',
  'OTHER',
] as const;

const uploadSchema = z.object({
  name: z.string().min(2, 'اسم الوثيقة مطلوب').max(160),
  type: z.enum(COMPANY_DOC_TYPES),
  issueDate: z.coerce.date().optional(),
  expiryDate: z.coerce.date().optional(),
});

export async function uploadCompanyDocAction(
  _prev: DocState,
  formData: FormData,
): Promise<DocState> {
  const { user, membership } = await requireSession();
  const ws = membership.workspaceId;
  if (!can(membership.role, 'companyDoc:manage')) {
    return { error: 'لا تملك صلاحية إدارة الوثائق' };
  }

  const parsed = uploadSchema.safeParse({
    name: formData.get('name'),
    type: formData.get('type'),
    issueDate: formData.get('issueDate') || undefined,
    expiryDate: formData.get('expiryDate') || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'بيانات غير صحيحة' };

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) return { error: 'يرجى اختيار ملف' };

  const buffer = Buffer.from(await file.arrayBuffer());
  const safe = file.name.replace(/[^\w.\-؀-ۿ]+/g, '_');
  const key = `workspaces/${ws}/company/${Date.now()}-${safe}`;
  await getStorage().put({ key, body: buffer, contentType: file.type });

  const db = forWorkspace(ws);
  await db.companyDocument.create({
    data: {
      workspaceId: ws,
      type: parsed.data.type,
      name: parsed.data.name,
      fileName: file.name,
      mimeType: file.type || 'application/octet-stream',
      sizeBytes: file.size,
      storageKey: key,
      issueDate: parsed.data.issueDate ?? null,
      expiryDate: parsed.data.expiryDate ?? null,
      uploadedById: user.id,
    },
  });

  revalidatePath('/documents');
  return { success: 'تم حفظ الوثيقة' };
}

export async function deleteCompanyDocAction(docId: string): Promise<void> {
  const { membership } = await requireSession();
  if (!can(membership.role, 'companyDoc:manage')) throw new Error('forbidden');
  const db = forWorkspace(membership.workspaceId);
  await db.companyDocument.deleteMany({ where: { id: docId } });
  revalidatePath('/documents');
}
