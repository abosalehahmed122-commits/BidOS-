import { requireSession } from '@/lib/session';
import { PageHeader } from '@/components/app/page-header';
import { NewTenderForm } from '@/components/tenders/new-tender-form';

export const metadata = { title: 'مناقصة جديدة — Bid OS' };

export default async function NewTenderPage() {
  await requireSession();
  return (
    <div>
      <PageHeader title="مناقصة جديدة" description="أدخل بيانات المنافسة وارفع كراسة الشروط" />
      <div className="px-6 py-6 lg:px-10">
        <NewTenderForm />
      </div>
    </div>
  );
}
