import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-6xl font-bold text-gold-400">404</p>
      <h1 className="text-xl font-semibold text-slate-100">الصفحة غير موجودة</h1>
      <p className="text-sm text-slate-400">الرابط غير صحيح أو تم نقل الصفحة.</p>
      <Link
        href="/dashboard"
        className="mt-2 rounded-lg bg-gold-400 px-4 py-2 text-sm font-medium text-navy-950 transition-colors hover:bg-gold-300"
      >
        العودة للوحة التحكم
      </Link>
    </div>
  );
}
