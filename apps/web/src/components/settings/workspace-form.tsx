'use client';

import { useFormState } from 'react-dom';
import { updateWorkspaceAction } from '@/actions/settings';
import { Input, Label } from '@/components/ui/input';
import { SubmitButton } from '@/components/auth/submit-button';
import { Feedback } from './feedback';

export interface WorkspaceData {
  name: string;
  vatNumber: string | null;
  crNumber: string | null;
  brandColor: string;
}

export function WorkspaceForm({ workspace, canEdit }: { workspace: WorkspaceData; canEdit: boolean }) {
  const [state, action] = useFormState(updateWorkspaceAction, {});
  return (
    <form action={action} className="max-w-md space-y-4">
      <Feedback state={state} />
      {!canEdit && (
        <p className="rounded-lg bg-white/5 px-3 py-2 text-sm text-slate-400">
          العرض فقط — تحتاج صلاحية مدير لتعديل مساحة العمل.
        </p>
      )}
      <div>
        <Label htmlFor="name">اسم مساحة العمل</Label>
        <Input id="name" name="name" defaultValue={workspace.name} disabled={!canEdit} required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="vatNumber">الرقم الضريبي</Label>
          <Input id="vatNumber" name="vatNumber" dir="ltr" defaultValue={workspace.vatNumber ?? ''} disabled={!canEdit} />
        </div>
        <div>
          <Label htmlFor="crNumber">السجل التجاري</Label>
          <Input id="crNumber" name="crNumber" dir="ltr" defaultValue={workspace.crNumber ?? ''} disabled={!canEdit} />
        </div>
      </div>
      <div>
        <Label htmlFor="brandColor">لون الهوية</Label>
        <Input id="brandColor" name="brandColor" dir="ltr" defaultValue={workspace.brandColor} disabled={!canEdit} placeholder="#0B1F3A" />
      </div>
      {canEdit && <SubmitButton>حفظ التغييرات</SubmitButton>}
    </form>
  );
}
