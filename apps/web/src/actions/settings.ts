'use server';

import { randomBytes } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma, type Prisma } from '@bid-os/db';
import { hashPassword, verifyPassword } from '@bid-os/auth';
import { can, passwordSchema, ROLES } from '@bid-os/core';
import { requireSession } from '@/lib/session';

export interface SettingsState {
  error?: string;
  success?: string;
}

async function ctx() {
  const { user, membership } = await requireSession();
  return { user, membership, ws: membership.workspaceId };
}

// ---------------------------------------------------------------- Account ----

const profileSchema = z.object({ name: z.string().min(2, 'الاسم مطلوب').max(120) });

export async function updateProfileAction(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const { user } = await ctx();
  const parsed = profileSchema.safeParse({ name: formData.get('name') });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'بيانات غير صحيحة' };

  await prisma.user.update({ where: { id: user.id }, data: { name: parsed.data.name } });
  revalidatePath('/settings/account');
  return { success: 'تم تحديث الملف الشخصي' };
}

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'كلمة المرور الحالية مطلوبة'),
  newPassword: passwordSchema,
});

export async function changePasswordAction(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const { user } = await ctx();
  const parsed = passwordChangeSchema.safeParse({
    currentPassword: formData.get('currentPassword'),
    newPassword: formData.get('newPassword'),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'بيانات غير صحيحة' };

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || !(await verifyPassword(parsed.data.currentPassword, dbUser.passwordHash))) {
    return { error: 'كلمة المرور الحالية غير صحيحة' };
  }
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(parsed.data.newPassword) },
  });
  return { success: 'تم تغيير كلمة المرور بنجاح' };
}

// -------------------------------------------------------------- Workspace ----

const workspaceSchema = z.object({
  name: z.string().min(2, 'الاسم مطلوب').max(120),
  vatNumber: z.string().max(20).optional().or(z.literal('').transform(() => undefined)),
  crNumber: z.string().max(20).optional().or(z.literal('').transform(() => undefined)),
  brandColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'لون غير صالح (مثال: #0B1F3A)')
    .optional()
    .or(z.literal('').transform(() => undefined)),
});

export async function updateWorkspaceAction(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const { membership, ws } = await ctx();
  if (!can(membership.role, 'workspace:update')) {
    return { error: 'لا تملك صلاحية تعديل مساحة العمل' };
  }
  const parsed = workspaceSchema.safeParse({
    name: formData.get('name'),
    vatNumber: formData.get('vatNumber'),
    crNumber: formData.get('crNumber'),
    brandColor: formData.get('brandColor'),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'بيانات غير صحيحة' };

  const data: Prisma.WorkspaceUpdateInput = {
    name: parsed.data.name,
    vatNumber: parsed.data.vatNumber ?? null,
    crNumber: parsed.data.crNumber ?? null,
  };
  if (parsed.data.brandColor) data.brandColor = parsed.data.brandColor;

  await prisma.workspace.update({ where: { id: ws }, data });
  revalidatePath('/settings/workspace');
  return { success: 'تم تحديث مساحة العمل' };
}

// ---------------------------------------------------------------- Members ----

const inviteSchema = z.object({
  email: z.string().email('بريد إلكتروني غير صالح'),
  role: z.enum(['ADMIN', 'ANALYST', 'VIEWER']),
});

export async function inviteMemberAction(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const { user: actor, membership, ws } = await ctx();
  if (!can(membership.role, 'member:invite')) {
    return { error: 'لا تملك صلاحية دعوة الأعضاء' };
  }
  const parsed = inviteSchema.safeParse({
    email: formData.get('email'),
    role: formData.get('role'),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'بيانات غير صحيحة' };
  const { email, role } = parsed.data;

  let user = await prisma.user.findUnique({ where: { email } });
  let tempPassword: string | undefined;
  if (!user) {
    // No email delivery wired yet → create the account with a temp password to share.
    tempPassword = `Bid1${randomBytes(3).toString('hex')}`;
    user = await prisma.user.create({
      data: {
        email,
        name: email.split('@')[0] || 'عضو',
        passwordHash: await hashPassword(tempPassword),
      },
    });
  }

  const existing = await prisma.membership.findUnique({
    where: { userId_workspaceId: { userId: user.id, workspaceId: ws } },
  });
  if (existing) return { error: 'هذا المستخدم عضو بالفعل في مساحة العمل' };

  await prisma.membership.create({ data: { userId: user.id, workspaceId: ws, role } });
  await prisma.auditLog.create({
    data: { workspaceId: ws, actorId: actor.id, action: 'member.invite', entity: 'Membership', entityId: user.id },
  });
  revalidatePath('/settings/members');
  return {
    success: tempPassword
      ? `تمت إضافة العضو. كلمة مرور مؤقتة (شاركها معه): ${tempPassword}`
      : 'تمت إضافة العضو بنجاح',
  };
}

export async function changeMemberRoleAction(
  membershipId: string,
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const { user, membership, ws } = await ctx();
  if (!can(membership.role, 'member:role')) {
    return { error: 'لا تملك صلاحية تغيير الأدوار' };
  }
  const parsed = z.enum(ROLES).safeParse(formData.get('role'));
  if (!parsed.success) return { error: 'دور غير صالح' };

  const target = await prisma.membership.findFirst({ where: { id: membershipId, workspaceId: ws } });
  if (!target) return { error: 'العضو غير موجود' };
  if (target.userId === user.id) return { error: 'لا يمكنك تغيير دورك بنفسك' };

  if (target.role === 'OWNER' && parsed.data !== 'OWNER') {
    const owners = await prisma.membership.count({ where: { workspaceId: ws, role: 'OWNER' } });
    if (owners <= 1) return { error: 'يجب أن يبقى مالك واحد على الأقل' };
  }

  await prisma.membership.update({ where: { id: membershipId }, data: { role: parsed.data } });
  revalidatePath('/settings/members');
  return { success: 'تم تحديث الدور' };
}

export async function removeMemberAction(
  membershipId: string,
  _prev: SettingsState,
  _formData: FormData,
): Promise<SettingsState> {
  const { user, membership, ws } = await ctx();
  if (!can(membership.role, 'member:remove')) {
    return { error: 'لا تملك صلاحية إزالة الأعضاء' };
  }
  const target = await prisma.membership.findFirst({ where: { id: membershipId, workspaceId: ws } });
  if (!target) return { error: 'العضو غير موجود' };
  if (target.userId === user.id) return { error: 'لا يمكنك إزالة نفسك' };
  if (target.role === 'OWNER') {
    const owners = await prisma.membership.count({ where: { workspaceId: ws, role: 'OWNER' } });
    if (owners <= 1) return { error: 'لا يمكن إزالة آخر مالك' };
  }

  await prisma.membership.delete({ where: { id: membershipId } });
  revalidatePath('/settings/members');
  return { success: 'تمت إزالة العضو' };
}
