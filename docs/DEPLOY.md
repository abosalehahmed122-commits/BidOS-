# المتغيّرات الناقصة في Vercel — وكيف تجيب كل واحد

عندك مسبقًا (لا تلمسها): `DATABASE_URL` · `DIRECT_DATABASE_URL` · `ANTHROPIC_API_KEY` · `S3_ENDPOINT` · `S3_PUBLIC_URL` · `S3_ACCESS_KEY_ID` · `S3_SECRET_ACCESS_KEY` · `RESEND_API_KEY`

أضِف **هذه الـ 18 فقط**. لكل واحد: المصدر/القيمة.

---

## أولًا: قيم تكتبها كما هي (انسخ القيمة مباشرة)

| المتغيّر | القيمة التي تكتبها | لماذا |
|---|---|---|
| `NODE_ENV` | `production` | وضع الإنتاج |
| `SESSION_TTL_DAYS` | `30` | مدة بقاء الجلسة (أيام) |
| `AI_PROVIDER` | `anthropic` | لتشغيل Claude الحقيقي (عندك المفتاح أصلًا) |
| `AI_EXTRACTION_MODEL` | `claude-sonnet-4-6` | موديل الاستخراج (الأرخص) |
| `AI_REASONING_MODEL` | `claude-opus-4-8` | موديل التقييم |
| `STORAGE_DRIVER` | `s3` | **حرج** — بدونه يتجاهل R2 ويفشل الرفع |
| `S3_REGION` | `auto` | منطقة R2 |
| `QUEUE_DRIVER` | `inline` | تشغيل المهام داخل الطلب (بلا Redis حاليًا) |
| `EMAIL_DRIVER` | `resend` | لإرسال البريد عبر Resend (عندك المفتاح) |
| `SMS_DRIVER` | `console` | رمز OTP يظهر في Vercel → Logs (بلا مزوّد بعد) |
| `SMS_SENDER` | `BidOS` | اسم مرسل الرسائل |
| `PAYMENT_PROVIDER` | `none` | الدفع مؤجَّل |

---

## ثانيًا: قيم تجلبها أو تنشئها

### `AUTH_SECRET` — **حرج** (الجلسات/الدخول تنكسر بدونه)
- سر عشوائي 32+ حرفًا. ولّده على جهازك:
  ```powershell
  openssl rand -base64 32
  ```
- أو استخدم هذا المولّد جاهزًا:
  ```
  K4PE72B13qleXNvkW9IQtPUMTNZMyAbZ5aOZfwd0nko=
  ```

### `S3_BUCKET` — **حرج** (المحوّل يتوقف بدونه)
- **اسم الـ bucket الفعلي** الذي أنشأته في Cloudflare R2.
- إن لم تكن أنشأت bucket بعد: dash.cloudflare.com → **R2** → **Create bucket** → سمِّه (مثلًا `bid-os`) → اكتب نفس الاسم هنا.

### `APP_URL`
- رابط مشروعك على Vercel نفسه.
- **بعد أول نشر** ينسخ من أعلى صفحة المشروع، بصيغة `https://bid-os-xxxx.vercel.app`. (أو دومينك الخاص لاحقًا.)

### `EMAIL_FROM`
- عنوان المرسل في البريد. اكتب مثلًا:
  ```
  Bid OS <no-reply@yourdomain.sa>
  ```
- استبدل `yourdomain.sa` بنطاقك الموثّق في Resend (وإلا قد تُرفض الرسائل).

### `ZATCA_SELLER_NAME`
- اسم شركتك كما يظهر في الفاتورة الضريبية. مثال: `مؤسسة كذا للمقاولات`.

### `ZATCA_SELLER_VAT_NUMBER`
- الرقم الضريبي لشركتك (15 رقمًا من هيئة الزكاة والضريبة). إن لم يكن جاهزًا، ضع مؤقتًا: `300000000000003`.

---

## ملاحظات
- `REDIS_URL` و`UNIFONIC_APP_SID`: **لا تحتاجهما الآن** (فقط إذا غيّرت `QUEUE_DRIVER=redis` أو `SMS_DRIVER=unifonic`).
- بعد إضافة المتغيّرات: **Redeploy** في Vercel.
- المخطط تغيّر مؤخرًا (الجوال + OTP) → شغّل مرة واحدة من جهازك:
  ```powershell
  cd C:\Users\hp\bid-os
  $env:DATABASE_URL = "رابط_Supabase_pooler_5432"
  pnpm db:push
  pnpm db:seed
  ```
