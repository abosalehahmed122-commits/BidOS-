import { z } from 'zod';

export const createTenderSchema = z.object({
  title: z.string().min(3, 'عنوان المنافسة مطلوب').max(300),
  referenceNumber: z
    .string()
    .max(50)
    .optional()
    .or(z.literal('').transform(() => undefined)),
  agency: z.string().max(200).optional(),
  sourceUrl: z
    .string()
    .url('رابط غير صالح')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  submissionDeadline: z.coerce.date().optional(),
  estimatedValueSar: z.coerce.number().nonnegative().optional(),
});

export type CreateTenderInput = z.infer<typeof createTenderSchema>;

export const recordDecisionSchema = z.object({
  decision: z.enum(['BID', 'NO_BID', 'DEFER']),
  reason: z.string().min(5, 'يرجى توضيح سبب القرار').max(2000),
});

export type RecordDecisionInput = z.infer<typeof recordDecisionSchema>;
