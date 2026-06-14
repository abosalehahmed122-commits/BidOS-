import Link from 'next/link';
import {
  Bell,
  Building2,
  CheckCircle2,
  FileText,
  Gauge,
  ListChecks,
  ScrollText,
  ShieldAlert,
  Upload,
  Users,
} from 'lucide-react';
import { Hero } from '@/components/marketing/hero';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const features = [
  { icon: FileText, title: 'استخراج ذكي', desc: 'المتطلبات الفنية والمالية، الشهادات، الضمانات، نطاق العمل — مع اقتباس المصدر من الكراسة.' },
  { icon: Gauge, title: 'تقييم فرصة الدخول', desc: 'درجة Bid/No-Bid من ١٠٠ مبنية على مطابقة النشاط والتصنيف والقدرة المالية وهامش الربح.' },
  { icon: ShieldAlert, title: 'كشف النواقص والمخاطر', desc: 'غرامات مرتفعة، شروط دفع سيئة، تعارضات داخل الكراسة، ونواقص قد تمنع التأهل.' },
  { icon: Bell, title: 'رادار المواعيد', desc: 'آخر موعد للاستفسارات، فتح المظاريف، والتسليم — بعدّ تنازلي وتنبيهات تصاعدية.' },
  { icon: Building2, title: 'مكتبة وثائق الشركة', desc: 'السجل التجاري، الزكاة، التصنيف، السير الذاتية — مع تنبيه قبل انتهاء الصلاحية.' },
  { icon: ScrollText, title: 'توليد العروض', desc: 'مستندات Word/PDF عربية احترافية بقوالب قابلة للتخصيص: المنهجية، الجدول، جدول الكميات.' },
];

const steps = [
  { icon: Upload, title: 'ارفع الكراسة', desc: 'PDF حتى الممسوحة ضوئياً — يقرؤها النظام مباشرةً برؤية Claude.' },
  { icon: ListChecks, title: 'يحلّلها الذكاء الاصطناعي', desc: 'استخراج منظّم بمخطط صارم مع درجة ثقة لكل عنصر.' },
  { icon: Gauge, title: 'قيّم القرار', desc: 'درجة فرصة الدخول مع تبرير مكتوب لكل عامل.' },
  { icon: FileText, title: 'ولّد العرض', desc: 'عرض فني ومالي جاهز بهوية شركتك.' },
];

const plans = [
  { code: 'trial', name: 'تجريبي', price: '٠', period: 'مجاناً', features: ['تحليل كراستين شهرياً', 'تقييم فرصة الدخول', 'عضوان'], highlight: false },
  { code: 'basic', name: 'أساسي', price: '٤٩٩', period: 'شهرياً', features: ['١٠ مناقصات شهرياً', 'مكتبة وثائق الشركة', 'توليد العروض', '٥ أعضاء'], highlight: false },
  { code: 'pro', name: 'احترافي', price: '١٬٤٩٩', period: 'شهرياً', features: ['٤٠ مناقصة شهرياً', 'فرق العمل والمهام', 'رادار المواعيد', 'تحليلات متقدمة', '١٥ عضواً'], highlight: true },
  { code: 'enterprise', name: 'مؤسسات', price: 'حسب الطلب', period: '', features: ['حدود مخصصة', 'OCR ذاتي الاستضافة', 'دعم مخصص', 'أعضاء بلا حد'], highlight: false },
];

const faqs = [
  { q: 'هل يدعم النظام الكراسات الممسوحة ضوئياً؟', a: 'نعم. تُقرأ صفحات الكراسة مباشرةً برؤية Claude دون الحاجة لمحرك OCR منفصل، مع دقة عالية للعربية.' },
  { q: 'كيف نُدخل مناقصات منصة اعتماد؟', a: 'برفع كراسة الشروط يدوياً ولصق رقم/رابط المنافسة، ويتتبّع النظام المواعيد الحرجة. لا نقوم بأي سحب آلي حفاظاً على الالتزام النظامي.' },
  { q: 'هل القرار يحلّ محل الخبير؟', a: 'لا — Bid OS أداة مساندة للقرار. كل استخراج مرفق بمصدره ودرجة ثقته لتراجعه قبل الاعتماد.' },
  { q: 'هل بياناتنا معزولة؟', a: 'نعم، عزل صارم متعدد المستأجرين على مستوى مساحة العمل، مع طبقة حماية إضافية في قاعدة البيانات.' },
];

export default function LandingPage() {
  return (
    <main>
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-navy-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gold-400 font-bold text-navy-950">B</span>
            <span className="text-lg font-semibold text-slate-50">Bid OS</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
            <Link href="#features" className="hover:text-slate-50">المزايا</Link>
            <Link href="#how" className="hover:text-slate-50">كيف يعمل</Link>
            <Link href="#pricing" className="hover:text-slate-50">الباقات</Link>
            <Link href="#faq" className="hover:text-slate-50">الأسئلة الشائعة</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>دخول</Link>
            <Link href="/register" className={buttonVariants({ size: 'sm' })}>ابدأ مجاناً</Link>
          </div>
        </div>
      </header>

      <Hero />

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-20">
        <SectionTitle eyebrow="المزايا" title="كل ما تحتاجه لإدارة المناقصات" />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title} className="animate-fade-up p-6">
              <f.icon className="h-8 w-8 text-gold-400" />
              <h3 className="mt-4 text-lg font-semibold text-slate-50">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-400">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-y border-white/5 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <SectionTitle eyebrow="آلية العمل" title="من الكراسة إلى العرض في ٤ خطوات" />
          <div className="mt-12 grid gap-5 md:grid-cols-4">
            {steps.map((s, i) => (
              <div key={s.title} className="relative">
                <div className="glass rounded-2xl p-6">
                  <span className="text-sm text-gold-400">الخطوة {i + 1}</span>
                  <s.icon className="mt-3 h-7 w-7 text-slate-200" />
                  <h3 className="mt-3 font-semibold text-slate-50">{s.title}</h3>
                  <p className="mt-1.5 text-sm text-slate-400">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-7xl px-6 py-20">
        <SectionTitle eyebrow="الباقات" title="باقات تناسب كل حجم" />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((p) => (
            <Card key={p.code} className={cn('flex flex-col p-6', p.highlight && 'ring-2 ring-gold-400/50')}>
              {p.highlight && <Badge variant="gold" className="mb-3 w-fit">الأكثر طلباً</Badge>}
              <h3 className="text-lg font-semibold text-slate-50">{p.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-slate-50">{p.price}</span>
                {p.period && <span className="text-sm text-slate-400">ريال / {p.period}</span>}
              </div>
              <ul className="mt-5 flex-1 space-y-2.5">
                {p.features.map((feat) => (
                  <li key={feat} className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" /> {feat}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className={cn(buttonVariants({ variant: p.highlight ? 'primary' : 'outline' }), 'mt-6')}
              >
                ابدأ الآن
              </Link>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-white/5 bg-white/[0.02]">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <SectionTitle eyebrow="الأسئلة الشائعة" title="إجابات سريعة" />
          <div className="mt-10 space-y-4">
            {faqs.map((f) => (
              <Card key={f.q}>
                <CardContent className="p-5 pt-5">
                  <h3 className="flex items-center gap-2 font-semibold text-slate-50">
                    <Users className="h-4 w-4 text-gold-400" /> {f.q}
                  </h3>
                  <p className="mt-2 text-sm text-slate-400">{f.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-slate-400 sm:flex-row">
          <p>© {new Date().getFullYear()} Bid OS — جميع الحقوق محفوظة.</p>
          <p className="text-slate-500">منصة إدارة وتحليل المناقصات السعودية</p>
        </div>
      </footer>
    </main>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="text-center">
      <p className="text-sm font-medium text-gold-400">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-bold text-slate-50 sm:text-4xl">{title}</h2>
    </div>
  );
}
