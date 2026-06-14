'use client';

import { useFormState } from 'react-dom';
import { inviteMemberAction } from '@/actions/settings';
import { Input, Label, Select } from '@/components/ui/input';
import { SubmitButton } from '@/components/auth/submit-button';
import { Feedback } from './feedback';

export function InviteMemberForm() {
  const [state, action] = useFormState(inviteMemberAction, {});
  return (
    <form action={action} className="space-y-4">
      <Feedback state={state} />
      <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
        <div>
          <Label htmlFor="email">البريد الإلكتروني</Label>
          <Input id="email" name="email" type="email" dir="ltr" required placeholder="member@company.sa" />
        </div>
        <div>
          <Label htmlFor="role">الدور</Label>
          <Select id="role" name="role" defaultValue="ANALYST" className="sm:w-36">
            <option value="ADMIN">مدير</option>
            <option value="ANALYST">محلل</option>
            <option value="VIEWER">مشاهد</option>
          </Select>
        </div>
        <SubmitButton>دعوة</SubmitButton>
      </div>
    </form>
  );
}
