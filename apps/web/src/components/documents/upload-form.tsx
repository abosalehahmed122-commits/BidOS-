'use client';

import { useFormState } from 'react-dom';
import { uploadCompanyDocAction } from '@/actions/documents';
import { Input, Label, Select } from '@/components/ui/input';
import { SubmitButton } from '@/components/auth/submit-button';
import { Feedback } from '@/components/settings/feedback';

const TYPES: { value: string; label: string }[] = [
  { value: 'COMMERCIAL_REGISTRATION', label: 'السجل التجاري' },
  { value: 'ZAKAT_CERTIFICATE', label: 'شهادة الزكاة' },
  { value: 'GOSI_CERTIFICATE', label: 'التأمينات الاجتماعية' },
  { value: 'CONTRACTOR_CLASSIFICATION', label: 'تصنيف المقاولين' },
  { value: 'VAT_CERTIFICATE', label: 'الشهادة الضريبية' },
  { value: 'CHAMBER_MEMBERSHIP', label: 'عضوية الغرفة' },
  { value: 'COMPANY_PROFILE', label: 'الملف التعريفي' },
  { value: 'CV', label: 'سيرة ذاتية' },
  { value: 'PREVIOUS_WORK', label: 'سابقة أعمال' },
  { value: 'BANK_GUARANTEE', label: 'ضمان بنكي' },
  { value: 'OTHER', label: 'أخرى' },
];

export function UploadDocForm() {
  const [state, action] = useFormState(uploadCompanyDocAction, {});
  return (
    <form action={action} className="space-y-4">
      <Feedback state={state} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">اسم الوثيقة</Label>
          <Input id="name" name="name" required placeholder="مثال: السجل التجاري 2026" />
        </div>
        <div>
          <Label htmlFor="type">النوع</Label>
          <Select id="type" name="type" defaultValue="COMMERCIAL_REGISTRATION">
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="issueDate">تاريخ الإصدار</Label>
          <Input id="issueDate" name="issueDate" type="date" />
        </div>
        <div>
          <Label htmlFor="expiryDate">تاريخ الانتهاء</Label>
          <Input id="expiryDate" name="expiryDate" type="date" />
        </div>
      </div>
      <div>
        <Label htmlFor="file">الملف</Label>
        <input
          id="file"
          name="file"
          type="file"
          required
          className="block w-full text-sm text-slate-400 file:ml-4 file:rounded-lg file:border-0 file:bg-gold-400 file:px-4 file:py-2 file:text-sm file:font-medium file:text-navy-950 hover:file:bg-gold-300"
        />
      </div>
      <SubmitButton>حفظ الوثيقة</SubmitButton>
    </form>
  );
}
