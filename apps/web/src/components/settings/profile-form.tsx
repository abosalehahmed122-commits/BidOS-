'use client';

import { useFormState } from 'react-dom';
import { updateProfileAction } from '@/actions/settings';
import { Input, Label } from '@/components/ui/input';
import { SubmitButton } from '@/components/auth/submit-button';
import { Feedback } from './feedback';

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const [state, action] = useFormState(updateProfileAction, {});
  return (
    <form action={action} className="max-w-md space-y-4">
      <Feedback state={state} />
      <div>
        <Label>البريد الإلكتروني</Label>
        <Input defaultValue={email} disabled dir="ltr" />
      </div>
      <div>
        <Label htmlFor="name">الاسم</Label>
        <Input id="name" name="name" defaultValue={name} required />
      </div>
      <SubmitButton>حفظ التغييرات</SubmitButton>
    </form>
  );
}
