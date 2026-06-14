import Link from 'next/link';
import { LoginForm } from '@/components/auth/login-form';

export const metadata = { title: 'تسجيل الدخول — Bid OS' };

export default function LoginPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-50">تسجيل الدخول</h1>
      <p className="mt-1 mb-6 text-sm text-slate-400">أهلاً بعودتك. أدخل بياناتك للمتابعة.</p>
      <LoginForm />
      <p className="mt-6 text-center text-sm text-slate-400">
        ليس لديك حساب؟{' '}
        <Link href="/register" className="text-gold-300 hover:text-gold-400">
          أنشئ حساباً
        </Link>
      </p>
    </div>
  );
}
