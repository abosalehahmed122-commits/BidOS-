'use client';

import { useFormState } from 'react-dom';
import { changePasswordAction } from '@/actions/settings';
import { Input, Label } from '@/components/ui/input';
import { SubmitButton } from '@/components/auth/submit-button';
import { Feedback } from './feedback';

export function PasswordForm() {
  const [state, action] = useFormState(changePasswordAction, {});
  return (
    <form action={action} className="max-w-md space-y-4">
      <Feedback state={state} />
      <div>
        <Label htmlFor="currentPassword">كلمة المرور الحالية</Label>
        <Input id="currentPassword" name="currentPassword" type="password" required />
      </div>
      <div>
        <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
        <Input id="newPassword" name="newPassword" type="password" required placeholder="٨ أحرف على الأقل مع رقم" />
      </div>
      <SubmitButton>تغيير كلمة المرور</SubmitButton>
    </form>
  );
}
