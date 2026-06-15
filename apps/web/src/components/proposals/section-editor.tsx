'use client';

import { useFormState } from 'react-dom';
import { updateSectionAction } from '@/actions/proposals';
import { SubmitButton } from '@/components/auth/submit-button';
import { Feedback } from '@/components/settings/feedback';

export function SectionEditor({
  sectionId,
  tenderId,
  title,
  contentMd,
  editable,
}: {
  sectionId: string;
  tenderId: string;
  title: string;
  contentMd: string;
  editable: boolean;
}) {
  const [state, action] = useFormState(updateSectionAction.bind(null, sectionId, tenderId), {});

  if (!editable) {
    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-slate-200">{title}</h4>
        <pre className="whitespace-pre-wrap rounded-lg border border-white/5 bg-white/[0.02] p-3 font-sans text-xs text-slate-400">
          {contentMd}
        </pre>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-2">
      <h4 className="text-sm font-medium text-slate-200">{title}</h4>
      <textarea
        name="contentMd"
        defaultValue={contentMd}
        rows={5}
        dir="rtl"
        className="w-full rounded-lg border border-white/10 bg-navy-950/40 p-3 text-sm leading-relaxed text-slate-200 focus:border-gold-400 focus:outline-none"
      />
      <div className="flex items-center justify-end gap-3">
        <Feedback state={state} />
        <SubmitButton variant="outline">حفظ القسم</SubmitButton>
      </div>
    </form>
  );
}
