import type { ReactNode } from 'react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-hero-radial px-6 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gold-400 font-bold text-navy-950">
            B
          </span>
          <span className="text-xl font-semibold text-slate-50">Bid OS</span>
        </Link>
        <div className="glass-strong rounded-2xl p-8 shadow-card">{children}</div>
      </div>
    </div>
  );
}
