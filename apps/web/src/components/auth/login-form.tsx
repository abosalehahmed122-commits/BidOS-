'use client';

import { useFormState } from 'react-dom';
import { loginAction } from '@/actions/auth';
import { Input, Label } from '@/components/ui/input';
import { SubmitButton } from './submit-button';

export function LoginForm() {
  const [state, action] = useFormState(loginAction, {});
  return (
    <form action={action} className="space-y-4">
      {state.error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{state.error}</p>
      )}
      <div>
        <Label htmlFor="email">البريد الإلكتروني</Label>
        <Input id="email" name="email" type="email" required dir="ltr" placeholder="you@company.sa" />
      </div>
      <div>
        <Label htmlFor="password">كلمة المرور</Label>
        <Input id="password" name="password" type="password" required />
      </div>
      <SubmitButton className="w-full">تسجيل الدخول</SubmitButton>
    </form>
  );
}
