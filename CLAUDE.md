# Bid OS — مشروع منصة المناقصات السعودية

> **هذا الملف هو الذاكرة الدائمة للمشروع.** يُحدَّث في نهاية كل مرحلة بما أُنجز وأي قرار جديد،
> حتى يُحفَظ السياق عبر الجلسات ولا تتناقض القرارات أو تتكرر الأسئلة. **لا يُحذف.**

## 1. الاسم والوصف

**Bid OS** — منصة SaaS لإدارة وتحليل المناقصات السعودية، لمكاتب وشركات المقاولات والاستشارات
والتوريد. تستقبل كراسة الشروط (PDF)، تستخرج متطلباتها ومخاطرها ومواعيدها بالذكاء الاصطناعي،
تقيّم فرصة الدخول (Bid/No-Bid Score)، وتولّد العرض الفني والمالي — بواجهة عربية RTL سينمائية.

## 2. القرارات المعمارية الثابتة (Fixed decisions)

| المجال | القرار |
|---|---|
| البنية | Monorepo (Turborepo + pnpm) |
| الواجهة | Next.js 14 (App Router) + TypeScript + Tailwind + shadcn-style UI + Framer Motion |
| RTL | `dir="rtl"`, `lang="ar"`, خط IBM Plex Sans Arabic |
| الخلفية | Next.js Server Actions / API Routes + طبقة Worker منفصلة (BullMQ) للمهام الطويلة |
| قاعدة البيانات | PostgreSQL + Prisma ORM |
| العزل (Multi-tenancy) | `workspaceId` على كل جدول + Prisma Client Extension يحقن العزل تلقائياً + Postgres RLS كطبقة دفاع ثانية |
| التخزين | S3-compatible (R2/S3/MinIO) خلف Storage port؛ بديل محلي LocalDiskStorage |
| المصادقة | جلسات آمنة (JWT في cookie httpOnly عبر `jose` + bcrypt) خلف `@bid-os/auth`، قابلة للتبديل بـ Auth.js |
| الذكاء الاصطناعي | طبقة مجرّدة (Provider-agnostic): `mock` افتراضياً، `anthropic` (Claude vision) إنتاجاً |
| توليد المستندات | docxtemplater (Word) ثم تحويل PDF عبر Gotenberg/LibreOffice (يبدأ بـ spike) |
| الطابور | BullMQ + Redis؛ بديل `inline` للتطوير بدون Redis |
| النشر | الواجهة على Vercel + **Worker على خدمة منفصلة** (Railway/VPS) — Vercel لا يكفي للمهام الطويلة |

### القرارات المعتمدة من العميل (مثبّتة)
- **اعتماد (Etimad):** لا يوجد API رسمي → **رفع يدوي للكراسة + رادار مواعيد**. لا scraping (خطر قانوني/ToS).
- **OCR/المستندات:** **رؤية Claude مباشرة** على صفحات الـ PDF (لا محرّك OCR منفصل في V1).
- **الفوترة (ZATCA):** **المرحلة الأولى فقط** — فواتير متوافقة (حقول + QR) دون ربط Clearance المباشر.
- **الدفع:** **مؤجَّل** — طبقة دفع مجرّدة جاهزة للتوصيل فقط، دون اختيار مزوّد الآن.
- **خصوصية (PDPL):** رؤية Claude تعالج الصفحات عبر Anthropic API (خارج المملكة). موثّق هنا؛
  الطبقة المجرّدة تسمح بالتحويل إلى OCR ذاتي الاستضافة لعميل مؤسسي عند الحاجة.

## 3. قواعد الكود (Code rules)

- **اللغة:** نصوص الواجهة بالعربية، أسماء المتغيرات/الدوال/الملفات بالإنجليزية. TypeScript صارم (`strict`).
- **التحقق:** Zod على كل مدخل (API/Server Action/AI output). لا ثقة بأي مدخل خارجي.
- **العزل:** كل استعلام على بيانات مستأجر يمر عبر `forWorkspace(workspaceId)` — لا استعلام Prisma خام على جداول المستأجر بدون عزل.
- **الأسرار:** لا أسرار في الكود — كلها عبر `.env` (انظر `.env.example`).
- **التدقيق:** `AuditLog` لكل عملية حساسة. `DecisionLog` و`AuditLog` للإضافة فقط (append-only).

## 4. الأوامر (Commands)

```bash
pnpm install            # تثبيت الاعتمادات
pnpm db:generate        # توليد Prisma Client
pnpm db:validate        # التحقق من صحة المخطط
pnpm db:migrate         # تطبيق الهجرات (يتطلب قاعدة بيانات)
pnpm db:seed            # بيانات تجريبية عربية واقعية
pnpm dev                # تشغيل الواجهة محلياً
pnpm build              # بناء كامل (turbo)
pnpm typecheck          # فحص الأنواع
pnpm test               # اختبارات الوحدات (vitest)
pnpm lint               # ESLint
```

## 5. بنية المجلدات المعتمدة

```
bid-os/
├─ apps/
│  └─ web/              # Next.js (App Router) — الواجهة + Server Actions
├─ packages/
│  ├─ db/               # @bid-os/db   — Prisma schema + client + tenant extension + seed
│  ├─ core/             # @bid-os/core — Zod schemas, RBAC, Bid-Score, الثوابت
│  ├─ ai/               # @bid-os/ai   — طبقة AI مجرّدة (mock/anthropic) + pipeline
│  └─ auth/             # @bid-os/auth — كلمات المرور، الجلسات، الحُرّاس (guards)
├─ docker-compose.yml   # Postgres + Redis + MinIO للتطوير المحلي
├─ .env.example
└─ CLAUDE.md            # (هذا الملف)
```

## 6. حالة المراحل

| # | المرحلة | الحالة |
|---|---|---|
| 0 | تهيئة المونوريبو + الذاكرة الدائمة | ✅ مكتملة |
| 1 | التأسيس: DB Schema + عزل + مصادقة + RBAC + AuditLog | ✅ مكتملة |
| 2 | الهوية البصرية + صفحة الهبوط + لوحة التحكم | ✅ مكتملة |
| 3 | الرفع + التخزين + Pipeline الاستخراج (Claude vision / mock) | ✅ مكتملة (استخراج نص PDF حقيقي عبر unpdf + طبقة طابور؛ صور الرؤية للكراسات الممسوحة = خطّاف متبقٍّ) |
| 4 | التقييم + النواقص والمخاطر + سجل القرارات | ✅ مكتملة |
| 5 | مكتبة وثائق الشركة + التنبيهات | ✅ مكتملة (رفع/حذف الوثائق + تنبيهات حية + جرس غير المقروء) |
| 6 | توليد العرض الفني والمالي (Word/PDF) | ✅ مكتملة (توليد ٨ أقسام عربية + تصدير Word؛ PDF = مُحوِّل LibreOffice/Gotenberg متبقٍّ) |
| 7 | الفرق والمهام والتعليقات | ✅ مكتملة (الأعضاء + إعدادات مساحة العمل + الحساب + المهام والتعليقات لكل مناقصة) |
| 8 | الاشتراكات + حدود الاستخدام + الفوترة (الدفع مؤجَّل) | ✅ مكتملة (باقات + UsageMeter مُطبَّق + فواتير ZATCA مع QR؛ بوابة الدفع مؤجَّلة) |
| 9 | التحليلات + الأرشفة + الاختبارات + تجهيز النشر | ✅ مكتملة (صفحة تحليلات + ٣٩ اختبار وحدة + Dockerfile/vercel.json + output standalone) |

**التحقق الحالي:** `pnpm test` → ٢٧ اختبار ناجح · `pnpm typecheck` → ٦/٦ · `pnpm --filter web build` → ناجح · `prisma validate` → صحيح. الافتراضات: `AI_PROVIDER=mock` + `STORAGE_DRIVER=disk` (لا حاجة لأي خدمة سحابية).
حساب الدخول التجريبي بعد `pnpm db:seed`: `demo@bid-os.sa` / `Demo1234!`.

## 7. ملاحظات التحقق (Verification notes)

- لا يلزم Docker ولا أي خدمة سحابية للبناء أو الاختبار: التطوير الافتراضي يستخدم
  `STORAGE_DRIVER=disk` + `AI_PROVIDER=mock` + `QUEUE_DRIVER=inline`.
- البناء (`pnpm build`) و`prisma generate` لا يتطلبان قاعدة بيانات حيّة.
- الصفحات التي تقرأ من قاعدة البيانات معلّمة `dynamic` فلا تُنفَّذ وقت البناء.
