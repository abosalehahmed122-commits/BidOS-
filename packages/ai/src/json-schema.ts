import { zodToJsonSchema } from 'zod-to-json-schema';
import type { ZodType } from 'zod';

/**
 * Converts a Zod schema into a self-contained JSON Schema (refs inlined) for use
 * as an Anthropic tool `input_schema`, guaranteeing the model returns exactly
 * the shape we validate against.
 */
export function toToolInputSchema(schema: ZodType): Record<string, unknown> {
  return zodToJsonSchema(schema, {
    $refStrategy: 'none',
    target: 'jsonSchema7',
  }) as Record<string, unknown>;
}
