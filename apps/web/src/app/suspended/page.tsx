import { requireSession } from '@/lib/session';
import { logoutAction } from '@/actions/auth';

export const metadata = { title: 'مساحة العمل موقوفة — Bid OS' };

export default async function SuspendedPage() {
  await requireSession();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-bold text-slate-50">مساحة العمل موقوفة</h1>
      <p className="max-w-md text-sm text-slate-400">
        تم تعليق مساحة العمل مؤقتاً. يرجى التواصل مع الدعم لإعادة التفعيل.
      </p>
      <form action={logoutAction}>
        <button
          type="submit"
          className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-200 transition-colors hover:bg-white/5"
        >
          تسجيل الخروج
        </button>
      </form>
    </div>
  );
}
