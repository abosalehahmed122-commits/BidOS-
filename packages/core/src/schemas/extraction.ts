import { z } from 'zod';
import {
  DEADLINE_TYPES,
  GAP_TYPES,
  REQUIREMENT_CATEGORIES,
  RISK_CATEGORIES,
  RISK_SEVERITIES,
} from '../constants';

/**
 * The STRICT contract the AI must return when analyzing a tender booklet.
 * Every extracted item is citation-bearing (sourcePage + sourceQuote) and
 * carries a confidence so the UI can flag low-confidence fields for review.
 * This schema is also converted to a JSON Schema for the model's tool call.
 */

const confidence = z.number().min(0).max(1);

export const extractedRequirementSchema = z.object({
  category: z.enum(REQUIREMENT_CATEGORIES),
  title: z.string().min(1),
  description: z.string().nullable(),
  mandatory: z.boolean(),
  sourcePage: z.number().int().positive().nullable(),
  sourceQuote: z.string().nullable(),
  confidence,
});

export const extractedAttachmentSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable(),
  mandatory: z.boolean(),
  sourcePage: z.number().int().positive().nullable(),
  confidence,
});

export const extractedDeadlineSchema = z.object({
  type: z.enum(DEADLINE_TYPES),
  title: z.string().min(1),
  /** ISO 8601 date string (the model returns the Hijri/Gregorian date it found). */
  dueAt: z.string().min(4),
  sourcePage: z.number().int().positive().nullable(),
  confidence,
});

export const extractedRiskSchema = z.object({
  severity: z.enum(RISK_SEVERITIES),
  category: z.enum(RISK_CATEGORIES),
  title: z.string().min(1),
  description: z.string().nullable(),
  sourcePage: z.number().int().positive().nullable(),
  sourceQuote: z.string().nullable(),
  confidence,
});

export const extractedGapSchema = z.object({
  type: z.enum(GAP_TYPES),
  title: z.string().min(1),
  description: z.string().nullable(),
  blocking: z.boolean(),
  confidence,
});

export const extractionResultSchema = z.object({
  summary: z.string(),
  agency: z.string().nullable(),
  referenceNumber: z.string().nullable(),
  scopeOfWork: z.string().nullable(),
  estimatedValueSar: z.number().nonnegative().nullable(),
  bidBondPercent: z.number().min(0).max(100).nullable(),
  performanceBondPercent: z.number().min(0).max(100).nullable(),
  paymentTermsDays: z.number().int().nonnegative().nullable(),
  requirements: z.array(extractedRequirementSchema),
  requiredAttachments: z.array(extractedAttachmentSchema),
  deadlines: z.array(extractedDeadlineSchema),
  risks: z.array(extractedRiskSchema),
  gaps: z.array(extractedGapSchema),
});

export type ExtractionResult = z.infer<typeof extractionResultSchema>;
export type ExtractedRequirement = z.infer<typeof extractedRequirementSchema>;
export type ExtractedAttachment = z.infer<typeof extractedAttachmentSchema>;
export type ExtractedDeadline = z.infer<typeof extractedDeadlineSchema>;
export type ExtractedRisk = z.infer<typeof extractedRiskSchema>;
export type ExtractedGap = z.infer<typeof extractedGapSchema>;
