'use client';

import { useFormState } from 'react-dom';
import { recordDecisionAction } from '@/actions/tenders';
import { Label, Select, Textarea } from '@/components/ui/input';
import { SubmitButton } from '@/components/auth/submit-button';

export function DecisionForm({ tenderId }: { tenderId: string }) {
  const [state, action] = useFormState(recordDecisionAction.bind(null, tenderId), {});
  return (
    <form action={action} className="space-y-4">
      {state.error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{state.error}</p>
      )}
      <div>
        <Label htmlFor="decision">القرار</Label>
        <Select id="decision" name="decision" defaultValue="DEFER">
          <option value="BID">الدخول في المنافسة</option>
          <option value="NO_BID">عدم الدخول</option>
          <option value="DEFER">تأجيل القرار</option>
        </Select>
      </div>
      <div>
        <Label htmlFor="reason">السبب</Label>
        <Textarea id="reason" name="reason" required placeholder="وضّح أسباب القرار…" />
      </div>
      <SubmitButton>تسجيل القرار</SubmitButton>
    </form>
  );
}
