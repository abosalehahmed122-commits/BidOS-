import { z } from 'zod';

export const passwordSchema = z
  .string()
  .min(8, 'كلمة المرور يجب ألا تقل عن 8 أحرف')
  .max(128)
  .regex(/[A-Za-z]/, 'يجب أن تحتوي كلمة المرور على حرف')
  .regex(/[0-9]/, 'يجب أن تحتوي كلمة المرور على رقم');

export const registerSchema = z.object({
  name: z.string().min(2, 'الاسم مطلوب').max(120),
  email: z.string().email('بريد إلكتروني غير صالح'),
  password: passwordSchema,
  workspaceName: z.string().min(2, 'اسم مساحة العمل مطلوب').max(120),
});

export const loginSchema = z.object({
  email: z.string().email('بريد إلكتروني غير صالح'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
