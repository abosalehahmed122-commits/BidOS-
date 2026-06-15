'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { forWorkspace } from '@bid-os/db';
import { can } from '@bid-os/core';
import { requireSession } from '@/lib/session';

export interface TaskState {
  error?: string;
  success?: string;
}

const taskSchema = z.object({
  title: z.string().min(2, 'عنوان المهمة مطلوب').max(200),
  description: z.string().max(2000).optional(),
  assigneeId: z.string().cuid().optional(),
  dueAt: z.coerce.date().optional(),
});

export async function createTaskAction(
  tenderId: string,
  _prev: TaskState,
  formData: FormData,
): Promise<TaskState> {
  const { user, membership } = await requireSession();
  if (!can(membership.role, 'task:manage')) return { error: 'لا تملك صلاحية إدارة المهام' };
  const ws = membership.workspaceId;

  const parsed = taskSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description') || undefined,
    assigneeId: formData.get('assigneeId') || undefined,
    dueAt: formData.get('dueAt') || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'بيانات غير صحيحة' };

  const db = forWorkspace(ws);
  const task = await db.task.create({
    data: {
      workspaceId: ws,
      tenderId,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      assigneeId: parsed.data.assigneeId ?? null,
      dueAt: parsed.data.dueAt ?? null,
      createdById: user.id,
    },
  });

  if (parsed.data.assigneeId && parsed.data.assigneeId !== user.id) {
    await db.notification.create({
      data: {
        workspaceId: ws,
        userId: parsed.data.assigneeId,
        type: 'TASK_ASSIGNED',
        title: 'تم إسناد مهمة إليك',
        body: task.title,
      },
    });
  }

  revalidatePath(`/tenders/${tenderId}`);
  return { success: 'تمت إضافة المهمة' };
}

const STATUSES = ['TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE'] as const;

export async function updateTaskStatusAction(
  taskId: string,
  tenderId: string,
  _prev: TaskState,
  formData: FormData,
): Promise<TaskState> {
  const { membership } = await requireSession();
  if (!can(membership.role, 'task:manage')) return { error: 'لا تملك صلاحية' };
  const parsed = z.enum(STATUSES).safeParse(formData.get('status'));
  if (!parsed.success) return { error: 'حالة غير صالحة' };

  const db = forWorkspace(membership.workspaceId);
  const res = await db.task.updateMany({ where: { id: taskId }, data: { status: parsed.data } });
  if (res.count === 0) return { error: 'المهمة غير موجودة' };
  revalidatePath(`/tenders/${tenderId}`);
  return { success: 'تم التحديث' };
}

export async function deleteTaskAction(taskId: string, tenderId: string): Promise<void> {
  const { membership } = await requireSession();
  if (!can(membership.role, 'task:manage')) throw new Error('forbidden');
  const db = forWorkspace(membership.workspaceId);
  await db.task.deleteMany({ where: { id: taskId } });
  revalidatePath(`/tenders/${tenderId}`);
}

const commentSchema = z.object({ body: z.string().min(1, 'التعليق فارغ').max(2000) });

export async function addCommentAction(
  tenderId: string,
  _prev: TaskState,
  formData: FormData,
): Promise<TaskState> {
  const { user, membership } = await requireSession();
  if (!can(membership.role, 'comment:create')) return { error: 'لا تملك صلاحية التعليق' };
  const parsed = commentSchema.safeParse({ body: formData.get('body') });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'تعليق غير صالح' };

  const db = forWorkspace(membership.workspaceId);
  await db.comment.create({
    data: { workspaceId: membership.workspaceId, tenderId, body: parsed.data.body, authorId: user.id },
  });
  revalidatePath(`/tenders/${tenderId}`);
  return { success: '' };
}
