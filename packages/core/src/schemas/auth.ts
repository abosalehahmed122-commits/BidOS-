import { z } from 'zod';

export const passwordSchema = z
  .string()
  .min(8, 'كلمة المرور يجب ألا تقل عن 8 أحرف')
  .max(128)
  .regex(/[A-Za-z]/, 'يجب أن تحتوي كلمة المرور على حرف')
  .regex(/[0-9]/, 'يجب أن تحتوي كلمة المرور على رقم');

/** Saudi mobile — accepts 05XXXXXXXX / 5XXXXXXXX / +9665XXXXXXXX, normalizes to +9665XXXXXXXX. */
export const saudiPhoneSchema = z
  .string()
  .trim()
  .refine((s) => /^(?:\+?966|0)?5\d{8}$/.test(s.replace(/[\s-]/g, '')), 'رقم جوال سعودي غير صالح')
  .transform((s) => `+966${s.replace(/\D/g, '').slice(-9)}`);

export const registerSchema = z.object({
  name: z.string().min(2, 'الاسم مطلوب').max(120),
  email: z.string().email('بريد إلكتروني غير صالح'),
  phone: saudiPhoneSchema,
  password: passwordSchema,
  workspaceName: z.string().min(2, 'اسم مساحة العمل مطلوب').max(120),
});

export const verifyOtpSchema = z.object({
  code: z.string().regex(/^\d{6}$/, 'رمز التحقق يجب أن يكون 6 أرقام'),
});

export const loginSchema = z.object({
  email: z.string().email('بريد إلكتروني غير صالح'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
