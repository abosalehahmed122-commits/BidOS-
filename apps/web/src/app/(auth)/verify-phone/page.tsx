import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/session';
import { prisma } from '@bid-os/db';
import { VerifyOtpForm } from '@/components/auth/verify-otp-form';

export const metadata = { title: 'تحقّق من الجوال — Bid OS' };

function maskPhone(phone: string): string {
  return phone.replace(/(\+966)(\d{2})\d{4}(\d{3})/, '$1$2****$3');
}

export default async function VerifyPhonePage() {
  const { user } = await requireSession();
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (dbUser?.phoneVerifiedAt) redirect('/dashboard');

  const devHint = (process.env.SMS_DRIVER ?? 'console') === 'console';

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-50">تحقّق من رقم جوالك</h1>
      <p className="mt-1 mb-6 text-sm text-slate-400">
        أرسلنا رمزاً مكوناً من ٦ أرقام إلى {dbUser?.phone ? maskPhone(dbUser.phone) : 'جوالك'}.
      </p>
      <VerifyOtpForm />
      {devHint && (
        <p className="mt-6 text-center text-xs text-slate-600">
          (وضع التطوير: الرمز يظهر في سجل الخادم — فعّل مزوّد SMS للإرسال الفعلي.)
        </p>
      )}
    </div>
  );
}
