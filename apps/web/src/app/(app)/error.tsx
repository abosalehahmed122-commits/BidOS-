'use client';

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h2 className="text-xl font-semibold text-slate-100">تعذّر إكمال العملية</h2>
      <p className="max-w-md text-sm text-slate-400">{error.message || 'حدث خطأ غير متوقع. حاول مرة أخرى.'}</p>
      <button
        onClick={reset}
        className="rounded-lg bg-gold-400 px-4 py-2 text-sm font-medium text-navy-950 transition-colors hover:bg-gold-300"
      >
        إعادة المحاولة
      </button>
    </div>
  );
}
