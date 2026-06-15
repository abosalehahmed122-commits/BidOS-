'use client';

import { FileDown, Sparkles, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SubmitButton } from '@/components/auth/submit-button';
import { deleteProposalAction, generateProposalAction } from '@/actions/proposals';
import { SectionEditor } from './section-editor';

interface SectionVM {
  id: string;
  title: string;
  contentMd: string;
}
interface ProposalVM {
  id: string;
  title: string;
  version: number;
  status: string;
  sections: SectionVM[];
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'مسودة',
  IN_REVIEW: 'قيد المراجعة',
  FINAL: 'نهائي',
};

export function ProposalsPanel({
  tenderId,
  proposals,
  canCreate,
  canUpdate,
  canDelete,
}: {
  tenderId: string;
  proposals: ProposalVM[];
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-sm text-slate-400">
          يولّد النظام مسودة عرض فني ومالي من تحليل المناقصة ووثائق الشركة، قابلة للتحرير والتنزيل بصيغة Word.
        </p>
        {canCreate && (
          <form action={generateProposalAction.bind(null, tenderId)}>
            <SubmitButton>
              <Sparkles className="h-4 w-4" />
              توليد عرض
            </SubmitButton>
          </form>
        )}
      </div>

      {proposals.length === 0 && (
        <Card>
          <CardContent className="px-6 py-12 text-center text-sm text-slate-500">
            لا توجد عروض بعد. اضغط «توليد عرض» لإنشاء مسودة قابلة للتحرير.
          </CardContent>
        </Card>
      )}

      {proposals.map((p) => (
        <Card key={p.id}>
          <CardContent className="space-y-4 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-slate-100">{p.title}</h3>
                <Badge variant="slate">نسخة {p.version}</Badge>
                <Badge variant="gold">{STATUS_LABELS[p.status] ?? p.status}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`/api/proposals/${p.id}/docx`}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-slate-200 transition-colors hover:bg-white/5"
                >
                  <FileDown className="h-4 w-4" />
                  تنزيل Word
                </a>
                {canDelete && (
                  <form action={deleteProposalAction.bind(null, p.id, tenderId)}>
                    <Button type="submit" variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-300">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </form>
                )}
              </div>
            </div>
            <div className="space-y-5 border-t border-white/5 pt-4">
              {p.sections.map((s) => (
                <SectionEditor
                  key={s.id}
                  sectionId={s.id}
                  tenderId={tenderId}
                  title={s.title}
                  contentMd={s.contentMd}
                  editable={canUpdate}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
