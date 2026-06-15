'use client';

import { useFormState } from 'react-dom';
import { addCommentAction } from '@/actions/tasks';
import { Card, CardContent } from '@/components/ui/card';
import { SubmitButton } from '@/components/auth/submit-button';
import { Feedback } from '@/components/settings/feedback';

export interface CommentVM {
  id: string;
  body: string;
  authorName: string;
  createdAt: string;
}

export function CommentsPanel({
  tenderId,
  comments,
  canComment,
}: {
  tenderId: string;
  comments: CommentVM[];
  canComment: boolean;
}) {
  const [state, action] = useFormState(addCommentAction.bind(null, tenderId), {});

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <h3 className="font-semibold text-slate-100">النقاش</h3>

        {comments.length === 0 && <p className="text-sm text-slate-500">لا تعليقات بعد.</p>}
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-200">{c.authorName}</p>
                <span className="text-xs text-slate-500">{c.createdAt}</span>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-300">{c.body}</p>
            </div>
          ))}
        </div>

        {canComment && (
          <form action={action} className="space-y-2 border-t border-white/5 pt-4">
            <Feedback state={state} />
            <textarea
              name="body"
              required
              rows={3}
              dir="rtl"
              placeholder="اكتب تعليقاً…"
              className="w-full rounded-lg border border-white/10 bg-navy-950/40 p-3 text-sm text-slate-200 focus:border-gold-400 focus:outline-none"
            />
            <div className="flex justify-end">
              <SubmitButton variant="outline">إرسال</SubmitButton>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
