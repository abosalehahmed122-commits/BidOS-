'use client';

import { useFormState } from 'react-dom';
import { createTenderAction } from '@/actions/tenders';
import { Input, Label } from '@/components/ui/input';
import { SubmitButton } from '@/components/auth/submit-button';

export function NewTenderForm() {
  const [state, action] = useFormState(createTenderAction, {});
  return (
    <form action={action} className="max-w-2xl space-y-5">
      {state.error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{state.error}</p>
      )}
      <div>
        <Label htmlFor="title">عنوان المنافسة *</Label>
        <Input id="title" name="title" required placeholder="مثال: إنشاء مبنى إداري" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="referenceNumber">رقم المنافسة (اعتماد)</Label>
          <Input id="referenceNumber" name="referenceNumber" dir="ltr" placeholder="2501..." />
        </div>
        <div>
          <Label htmlFor="agency">الجهة</Label>
          <Input id="agency" name="agency" placeholder="مثال: وزارة الإسكان" />
        </div>
      </div>
      <div>
        <Label htmlFor="sourceUrl">رابط المنافسة في اعتماد</Label>
        <Input id="sourceUrl" name="sourceUrl" dir="ltr" placeholder="https://etimad.sa/..." />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="submissionDeadline">آخر موعد للتقديم</Label>
          <Input id="submissionDeadline" name="submissionDeadline" type="date" />
        </div>
        <div>
          <Label htmlFor="estimatedValueSar">القيمة التقديرية (ريال)</Label>
          <Input id="estimatedValueSar" name="estimatedValueSar" type="number" min="0" placeholder="4800000" />
        </div>
      </div>
      <div>
        <Label htmlFor="booklet">كراسة الشروط (PDF)</Label>
        <input
          id="booklet"
          name="booklet"
          type="file"
          accept="application/pdf"
          className="block w-full text-sm text-slate-400 file:ml-4 file:rounded-lg file:border-0 file:bg-gold-400 file:px-4 file:py-2 file:text-sm file:font-medium file:text-navy-950 hover:file:bg-gold-300"
        />
        <p className="mt-1.5 text-xs text-slate-500">
          يمكنك رفع الكراسة الآن وتحليلها لاحقاً. الافتراضي للتطوير: تخزين محلي + مزوّد تحليل تجريبي.
        </p>
      </div>
      <SubmitButton>إنشاء المناقصة</SubmitButton>
    </form>
  );
}
