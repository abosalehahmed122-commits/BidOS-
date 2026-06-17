'use client';

import { useFormState } from 'react-dom';
import { resendPhoneOtpAction, verifyPhoneOtpAction } from '@/actions/auth';
import { Input, Label } from '@/components/ui/input';
import { SubmitButton } from './submit-button';

export function VerifyOtpForm() {
  const [state, action] = useFormState(verifyPhoneOtpAction, {});
  const [resendState, resendAction] = useFormState(resendPhoneOtpAction, {});

  return (
    <div className="space-y-4">
      <form action={action} className="space-y-4">
        {state.error && (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{state.error}</p>
        )}
        {resendState.success && (
          <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
            {resendState.success}
          </p>
        )}
        <div>
          <Label htmlFor="code">رمز التحقق</Label>
          <Input
            id="code"
            name="code"
            inputMode="numeric"
            maxLength={6}
            required
            dir="ltr"
            className="text-center text-lg tracking-[0.5em]"
            placeholder="------"
          />
        </div>
        <SubmitButton className="w-full">تأكيد</SubmitButton>
      </form>

      <form action={resendAction}>
        <button type="submit" className="w-full text-center text-sm text-slate-400 hover:text-slate-200">
          إعادة إرسال الرمز
        </button>
      </form>
    </div>
  );
}
