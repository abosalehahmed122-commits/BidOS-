import { Download, FileText, Trash2 } from 'lucide-react';
import { forWorkspace } from '@bid-os/db';
import { can } from '@bid-os/core';
import { requireSession } from '@/lib/session';
import { PageHeader } from '@/components/app/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UploadDocForm } from '@/components/documents/upload-form';
import { deleteCompanyDocAction } from '@/actions/documents';
import { daysUntil, formatDate } from '@/lib/format';

const TYPE_LABELS: Record<string, string> = {
  COMMERCIAL_REGISTRATION: 'السجل التجاري',
  ZAKAT_CERTIFICATE: 'شهادة الزكاة',
  GOSI_CERTIFICATE: 'التأمينات الاجتماعية',
  CONTRACTOR_CLASSIFICATION: 'تصنيف المقاولين',
  VAT_CERTIFICATE: 'الشهادة الضريبية',
  CHAMBER_MEMBERSHIP: 'عضوية الغرفة',
  COMPANY_PROFILE: 'الملف التعريفي',
  CV: 'سيرة ذاتية',
  PREVIOUS_WORK: 'سابقة أعمال',
  BANK_GUARANTEE: 'ضمان بنكي',
  OTHER: 'أخرى',
};

function ExpiryBadge({ expiryDate }: { expiryDate: Date | null }) {
  if (!expiryDate) return <Badge variant="slate">بدون انتهاء</Badge>;
  const days = daysUntil(expiryDate);
  if (days < 0) return <Badge variant="red">منتهية</Badge>;
  if (days <= 30) return <Badge variant="amber">تنتهي خلال {days} يوم</Badge>;
  return <Badge variant="emerald">سارية</Badge>;
}

export default async function DocumentsPage() {
  const { membership } = await requireSession();
  const db = forWorkspace(membership.workspaceId);
  const docs = await db.companyDocument.findMany({ orderBy: { expiryDate: 'asc' } });
  const canManage = can(membership.role, 'companyDoc:manage');

  return (
    <div>
      <PageHeader title="مكتبة وثائق الشركة" description="وثائقك المتكررة مع تنبيه قبل انتهاء الصلاحية" />
      <div className="space-y-6 px-6 py-6 lg:px-10">
        {canManage && (
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 font-semibold text-slate-100">إضافة وثيقة</h2>
              <UploadDocForm />
            </CardContent>
          </Card>
        )}

        {docs.length === 0 ? (
          <Card className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <FileText className="h-12 w-12 text-slate-600" />
            <p className="text-slate-200">لا توجد وثائق محفوظة بعد</p>
            <p className="text-sm text-slate-400">احفظ السجل التجاري والزكاة والتصنيف لإدراجها تلقائياً في العروض.</p>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {docs.map((doc) => (
              <Card key={doc.id}>
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-start justify-between">
                    <FileText className="h-6 w-6 text-gold-400" />
                    <ExpiryBadge expiryDate={doc.expiryDate} />
                  </div>
                  <div>
                    <p className="font-medium text-slate-100">{doc.name}</p>
                    <p className="text-xs text-slate-500">{TYPE_LABELS[doc.type] ?? 'أخرى'}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    {doc.expiryDate ? (
                      <p className="text-xs text-slate-500">تنتهي في {formatDate(doc.expiryDate)}</p>
                    ) : (
                      <span />
                    )}
                    <div className="flex items-center gap-1">
                      <a
                        href={`/api/files/download?type=company&id=${doc.id}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/5 hover:text-gold-400"
                        title="تنزيل"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                      {canManage && (
                        <form action={deleteCompanyDocAction.bind(null, doc.id)}>
                          <Button type="submit" variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-300">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </form>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
