'use client';

import { useFormState } from 'react-dom';
import { registerAction } from '@/actions/auth';
import { Input, Label } from '@/components/ui/input';
import { SubmitButton } from './submit-button';

export function RegisterForm() {
  const [state, action] = useFormState(registerAction, {});
  return (
    <form action={action} className="space-y-4">
      {state.error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{state.error}</p>
      )}
      <div>
        <Label htmlFor="name">الاسم</Label>
        <Input id="name" name="name" required placeholder="مثال: أحمد العتيبي" />
      </div>
      <div>
        <Label htmlFor="workspaceName">اسم الشركة / مساحة العمل</Label>
        <Input id="workspaceName" name="workspaceName" required placeholder="مثال: شركة الإنشاءات المتقدمة" />
      </div>
      <div>
        <Label htmlFor="email">البريد الإلكتروني</Label>
        <Input id="email" name="email" type="email" required dir="ltr" placeholder="you@company.sa" />
      </div>
      <div>
        <Label htmlFor="phone">رقم الجوال</Label>
        <Input id="phone" name="phone" type="tel" required dir="ltr" placeholder="05XXXXXXXX" />
      </div>
      <div>
        <Label htmlFor="password">كلمة المرور</Label>
        <Input id="password" name="password" type="password" required placeholder="٨ أحرف على الأقل مع رقم" />
      </div>
      <SubmitButton className="w-full">إنشاء الحساب</SubmitButton>
    </form>
  );
}
