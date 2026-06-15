'use client';

import { useFormState } from 'react-dom';
import { createDiscountAction } from '@/actions/discounts';
import { Input, Label, Select } from '@/components/ui/input';
import { SubmitButton } from '@/components/auth/submit-button';
import { Feedback } from './feedback';

export function DiscountForm() {
  const [state, action] = useFormState(createDiscountAction, {});
  return (
    <form action={action} className="space-y-4">
      <Feedback state={state} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <Label htmlFor="code">الكود</Label>
          <Input id="code" name="code" dir="ltr" required placeholder="WELCOME20" />
        </div>
        <div>
          <Label htmlFor="type">النوع</Label>
          <Select id="type" name="type" defaultValue="PERCENT">
            <option value="PERCENT">نسبة مئوية %</option>
            <option value="FIXED">مبلغ ثابت (ر.س)</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="value">القيمة</Label>
          <Input id="value" name="value" type="number" min={1} required placeholder="20" />
        </div>
        <div>
          <Label htmlFor="maxRedemptions">حد الاستخدام (اختياري)</Label>
          <Input id="maxRedemptions" name="maxRedemptions" type="number" min={1} placeholder="100" />
        </div>
        <div>
          <Label htmlFor="expiresAt">تاريخ الانتهاء (اختياري)</Label>
          <Input id="expiresAt" name="expiresAt" type="date" />
        </div>
      </div>
      <SubmitButton>إنشاء الكود</SubmitButton>
    </form>
  );
}
