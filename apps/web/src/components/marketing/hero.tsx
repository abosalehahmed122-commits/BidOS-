'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, FileSearch, Sparkles } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { ScoreRing } from '@/components/app/score-ring';
import { Badge } from '@/components/ui/badge';

const chips = ['تصنيف مقاولين درجة رابعة', 'قدرة مالية ٥ مليون ريال', 'محتوى محلي', 'غرامة تأخير ١٪'];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-hero-radial">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="gold" className="mb-5">
              <Sparkles className="h-3.5 w-3.5" /> مدعوم بالذكاء الاصطناعي
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="text-4xl font-bold leading-tight text-slate-50 sm:text-5xl lg:text-6xl"
          >
            حلّل المناقصات السعودية
            <br />
            <span className="text-gradient-gold">واتخذ قرار الدخول بثقة</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-6 max-w-xl text-lg text-slate-300"
          >
            ارفع كراسة الشروط، ودع Bid OS يستخرج المتطلبات والمخاطر والمواعيد، يقيّم فرصة الدخول
            (Bid/No-Bid)، ويولّد لك العرض الفني والمالي — كل ذلك بواجهة عربية بالكامل.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link href="/register" className={buttonVariants({ size: 'lg' })}>
              ابدأ مجاناً <ArrowLeft className="h-4 w-4" />
            </Link>
            <Link href="#how" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
              كيف يعمل؟
            </Link>
          </motion.div>
        </div>

        {/* Analysis preview card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <div className="glass-strong rounded-3xl p-6 shadow-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-300">
                <FileSearch className="h-5 w-5 text-gold-400" />
                <span className="text-sm">تحليل كراسة الشروط</span>
              </div>
              <Badge variant="emerald">اكتمل</Badge>
            </div>

            <div className="mt-6 flex items-center gap-6">
              <ScoreRing score={62} recommendation="REVIEW" />
              <div className="space-y-2">
                <p className="text-sm text-slate-400">التوصية</p>
                <p className="text-xl font-semibold text-gold-300">يحتاج مراجعة</p>
                <p className="text-xs text-slate-500">قرار مبني على ٦ عوامل مفسّرة</p>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              {chips.map((c, i) => (
                <motion.div
                  key={c}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + i * 0.12 }}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-4 py-2.5 text-sm"
                >
                  <span className="text-slate-200">{c}</span>
                  <span className="text-xs text-slate-500">صفحة {i + 2}</span>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gold-400/10 blur-3xl" />
        </motion.div>
      </div>
    </section>
  );
}
