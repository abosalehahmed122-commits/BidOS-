# دليل النشر ومتغيّرات البيئة — Bid OS

هذا الملف يشرح **كل متغيّر بيئة**: ما هو، من أين تجلبه، وقيمته. مقسّم إلى:
1. قيم جاهزة (اكتبها كما هي).
2. قيم تجلبها من حساباتك (مع خطوات الوصول).
3. الحدّ الأدنى ليعمل الموقع.
4. خطوات قاعدة البيانات.

> ملاحظة: `S3_PUBLIC_URL` **لا يستخدمه الكود** (الملفات خاصة عبر روابط موقّعة) — اتركه فارغًا.

---

## ⛔ فحص متغيّراتك الحالية (محدّث)

**الموجود (8):** `DATABASE_URL` · `DIRECT_DATABASE_URL` · `ANTHROPIC_API_KEY` · `S3_ENDPOINT` · `S3_PUBLIC_URL` · `S3_ACCESS_KEY_ID` · `S3_SECRET_ACCESS_KEY` · `RESEND_API_KEY`

**الناقص (18) — الصقه دفعة واحدة عبر Settings → Environment Variables → Import .env:**

```dotenv
NODE_ENV=production
APP_URL=https://YOUR-APP.vercel.app
AUTH_SECRET=K4PE72B13qleXNvkW9IQtPUMTNZMyAbZ5aOZfwd0nko=
SESSION_TTL_DAYS=30
AI_PROVIDER=anthropic
AI_EXTRACTION_MODEL=claude-sonnet-4-6
AI_REASONING_MODEL=claude-opus-4-8
STORAGE_DRIVER=s3
S3_REGION=auto
S3_BUCKET=bid-os
QUEUE_DRIVER=inline
EMAIL_DRIVER=resend
EMAIL_FROM=Bid OS <no-reply@yourdomain.sa>
SMS_DRIVER=console
SMS_SENDER=BidOS
PAYMENT_PROVIDER=none
ZATCA_SELLER_NAME=شركتك
ZATCA_SELLER_VAT_NUMBER=300000000000003
```

الحرجة من الناقص (بدونها لا يعمل): **`AUTH_SECRET`** (الجلسات)، **`STORAGE_DRIVER=s3`** و**`S3_BUCKET`** (الرفع)، **`AI_PROVIDER=anthropic`** (لاستخدام Claude الحقيقي).
- غيّر `S3_BUCKET` لاسم الـ bucket الفعلي في R2 إن لم يكن `bid-os`.
- املأ `APP_URL` برابط مشروعك بعد أول نشر.

---

## 1) قيم جاهزة — انسخها كما هي إلى Vercel

```dotenv
NODE_ENV=production
SESSION_TTL_DAYS=30

AI_PROVIDER=anthropic
AI_EXTRACTION_MODEL=claude-sonnet-4-6
AI_REASONING_MODEL=claude-opus-4-8

STORAGE_DRIVER=s3
S3_REGION=auto
S3_BUCKET=bid-os

QUEUE_DRIVER=inline

EMAIL_DRIVER=resend
EMAIL_FROM=Bid OS <no-reply@yourdomain.sa>

SMS_DRIVER=console
SMS_SENDER=BidOS

PAYMENT_PROVIDER=none

ZATCA_SELLER_NAME=شركتك
ZATCA_SELLER_VAT_NUMBER=300000000000003

AUTH_SECRET=K4PE72B13qleXNvkW9IQtPUMTNZMyAbZ5aOZfwd0nko=
```

- `AUTH_SECRET` أعلاه مولّد مسبقًا (أو ولّد غيره: `openssl rand -base64 32`).
- لو ليس لديك مفتاح Claude بعد: غيّر `AI_PROVIDER=mock` (تحليل وهمي بلا مفتاح).
- لو لا تريد بريدًا فعليًا: غيّر `EMAIL_DRIVER=console`.

---

## 2) قيم تجلبها من حساباتك

### أ) قاعدة البيانات — Supabase
- **`DATABASE_URL`** و **`DIRECT_DATABASE_URL`**
- المصدر: Supabase → مشروعك → **Connect** → **Session pooler**.
- الشكل (المنفذ 5432، المضيف فيه `pooler.supabase.com`):
  ```
  postgresql://postgres.PROJECTREF:PASSWORD@aws-1-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require
  ```
- ضع نفس القيمة في `DATABASE_URL` و`DIRECT_DATABASE_URL`.
- ⚠️ لا تستخدم الرابط المباشر `db.xxx.supabase.co` (يعمل IPv6 فقط).

### ب) الذكاء الاصطناعي — Anthropic
- **`ANTHROPIC_API_KEY`**
- المصدر: console.anthropic.com → **API Keys** → **Create Key**. يبدأ بـ `sk-ant-`.

### ج) التخزين — Cloudflare R2
- **`S3_ENDPOINT`** ، **`S3_ACCESS_KEY_ID`** ، **`S3_SECRET_ACCESS_KEY`**
- الخطوات:
  1. dash.cloudflare.com → **R2** → فعّله (مجاني حتى 10GB، قد يطلب بطاقة للتحقق).
  2. **Create bucket** → سمّه `bid-os` (نفس قيمة `S3_BUCKET`).
  3. **Manage R2 API Tokens** → **Create API Token** → صلاحية **Object Read & Write** → Create.
  4. انسخ: **Access Key ID** و **Secret Access Key** (السر يظهر **مرة واحدة**).
  5. من **R2 → Overview → S3 API**: انسخ الرابط `https://<ACCOUNT_ID>.r2.cloudflarestorage.com` → هذا `S3_ENDPOINT`.

### د) البريد — Resend (اختياري)
- **`RESEND_API_KEY`**
- المصدر: resend.com → **API Keys** → **Create**. يبدأ بـ `re_`.

### هـ) رابط الموقع — Vercel
- **`APP_URL`**
- المصدر: بعد أول نشر، انسخ رابط مشروعك من أعلى صفحة Vercel (مثل `https://bid-os-xxxx.vercel.app`). أو دومينك الخاص لاحقًا.

### و) SMS فعلي — Unifonic (اختياري، للإنتاج)
- **`UNIFONIC_APP_SID`** + غيّر `SMS_DRIVER=unifonic`
- حتى تفعّله، يبقى `SMS_DRIVER=console` ورمز OTP يظهر في **Vercel → Logs**.

---

## 3) الحدّ الأدنى ليعمل الموقع
هذه فقط ضرورية للإقلاع (الباقي له قيم افتراضية):

```
DATABASE_URL, DIRECT_DATABASE_URL   (Supabase)
AUTH_SECRET                          (جاهز أعلاه)
STORAGE_DRIVER=s3 + S3_ENDPOINT + S3_BUCKET + S3_ACCESS_KEY_ID + S3_SECRET_ACCESS_KEY   (R2)
```
(الذكاء اختياري — `AI_PROVIDER=mock` يعمل بلا مفتاح.)

---

## 4) قاعدة البيانات (مرة واحدة من جهازك)
بعد ضبط رابط Supabase:

```powershell
cd C:\Users\hp\bid-os
$env:DATABASE_URL = "رابط_Supabase_pooler_5432"
pnpm db:push    # ينشئ/يحدّث كل الجداول (بما فيها الجوال وOTP)
pnpm db:seed    # الباقات + الأسعار + حساب الدخول التجريبي
```

تسجيل الدخول التجريبي: `demo@bid-os.sa` / `Demo1234!`

---

## إعدادات Vercel المهمة
- **Root Directory = `apps/web`**
- بعد إضافة/تعديل المتغيّرات: اضغط **Redeploy**.
