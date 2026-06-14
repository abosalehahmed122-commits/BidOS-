import Link from 'next/link';
import { RegisterForm } from '@/components/auth/register-form';

export const metadata = { title: 'إنشاء حساب — Bid OS' };

export default function RegisterPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-50">إنشاء حساب جديد</h1>
      <p className="mt-1 mb-6 text-sm text-slate-400">ابدأ بالباقة التجريبية المجانية خلال دقيقة.</p>
      <RegisterForm />
      <p className="mt-6 text-center text-sm text-slate-400">
        لديك حساب بالفعل؟{' '}
        <Link href="/login" className="text-gold-300 hover:text-gold-400">
          سجّل الدخول
        </Link>
      </p>
    </div>
  );
}
