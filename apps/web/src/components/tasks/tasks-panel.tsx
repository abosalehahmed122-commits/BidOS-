'use client';

import { useFormState } from 'react-dom';
import { Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input, Label, Select } from '@/components/ui/input';
import { SubmitButton } from '@/components/auth/submit-button';
import { Feedback } from '@/components/settings/feedback';
import { createTaskAction, deleteTaskAction, updateTaskStatusAction } from '@/actions/tasks';

export interface TaskVM {
  id: string;
  title: string;
  description: string | null;
  status: string;
  assigneeName: string | null;
  due: string | null;
}

const STATUS_LABELS: Record<string, string> = {
  TODO: 'قيد الانتظار',
  IN_PROGRESS: 'قيد التنفيذ',
  BLOCKED: 'متوقفة',
  DONE: 'منجزة',
};

const STATUS_VARIANT: Record<string, 'slate' | 'gold' | 'red' | 'emerald'> = {
  TODO: 'slate',
  IN_PROGRESS: 'gold',
  BLOCKED: 'red',
  DONE: 'emerald',
};

export function TasksPanel({
  tenderId,
  tasks,
  members,
  canManage,
}: {
  tenderId: string;
  tasks: TaskVM[];
  members: { id: string; name: string }[];
  canManage: boolean;
}) {
  const [state, action] = useFormState(createTaskAction.bind(null, tenderId), {});

  return (
    <div className="space-y-4">
      {canManage && (
        <Card>
          <CardContent className="p-6">
            <h3 className="mb-4 font-semibold text-slate-100">مهمة جديدة</h3>
            <form action={action} className="space-y-4">
              <Feedback state={state} />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="title">العنوان</Label>
                  <Input id="title" name="title" required placeholder="مثال: تجهيز الضمان الابتدائي" />
                </div>
                <div>
                  <Label htmlFor="assigneeId">المسؤول</Label>
                  <Select id="assigneeId" name="assigneeId" defaultValue="">
                    <option value="">بدون إسناد</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dueAt">تاريخ الاستحقاق</Label>
                  <Input id="dueAt" name="dueAt" type="date" />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="description">الوصف (اختياري)</Label>
                  <Input id="description" name="description" placeholder="تفاصيل المهمة" />
                </div>
              </div>
              <SubmitButton>إضافة المهمة</SubmitButton>
            </form>
          </CardContent>
        </Card>
      )}

      {tasks.length === 0 ? (
        <Card>
          <CardContent className="px-6 py-10 text-center text-sm text-slate-500">لا مهام بعد.</CardContent>
        </Card>
      ) : (
        tasks.map((t) => <TaskItem key={t.id} task={t} tenderId={tenderId} canManage={canManage} />)
      )}
    </div>
  );
}

function TaskItem({ task, tenderId, canManage }: { task: TaskVM; tenderId: string; canManage: boolean }) {
  const [state, action] = useFormState(updateTaskStatusAction.bind(null, task.id, tenderId), {});
  return (
    <Card>
      <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
        <div className="min-w-0">
          <p className="font-medium text-slate-100">{task.title}</p>
          {task.description && <p className="text-sm text-slate-400">{task.description}</p>}
          <p className="mt-1 text-xs text-slate-500">
            {task.assigneeName ? `المسؤول: ${task.assigneeName}` : 'غير مُسند'}
            {task.due ? ` · يستحق ${task.due}` : ''}
          </p>
          {state.error && <p className="mt-1 text-xs text-red-300">{state.error}</p>}
        </div>
        <div className="flex items-center gap-2">
          {canManage ? (
            <form action={action} className="flex items-center gap-2">
              <Select name="status" defaultValue={task.status} className="h-9 w-32">
                {Object.entries(STATUS_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </Select>
              <Button type="submit" variant="outline" size="sm">
                حفظ
              </Button>
            </form>
          ) : (
            <Badge variant={STATUS_VARIANT[task.status] ?? 'slate'}>
              {STATUS_LABELS[task.status] ?? task.status}
            </Badge>
          )}
          {canManage && (
            <form action={deleteTaskAction.bind(null, task.id, tenderId)}>
              <Button type="submit" variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-300">
                <Trash2 className="h-4 w-4" />
              </Button>
            </form>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
