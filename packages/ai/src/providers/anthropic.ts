import Anthropic from '@anthropic-ai/sdk';
import { extractionResultSchema, type ExtractionResult } from '@bid-os/core';
import type { AIProvider, AnalyzeTenderInput, AnalyzeTenderResult } from '../types';
import { toToolInputSchema } from '../json-schema';
import {
  EXTRACTION_SYSTEM_PROMPT,
  EXTRACTION_TOOL_DESCRIPTION,
  EXTRACTION_TOOL_NAME,
} from '../prompt';

/** Content block param type, derived to stay robust across SDK versions. */
type ContentParam = Exclude<Anthropic.MessageParam['content'], string>[number];

// Rough public pricing (cents per 1M tokens) for cost metering. Update as needed.
const PRICING: Record<string, { input: number; output: number }> = {
  default: { input: 300, output: 1500 },
  'claude-opus-4-8': { input: 1500, output: 7500 },
  'claude-sonnet-4-6': { input: 300, output: 1500 },
};

export interface AnthropicProviderOptions {
  apiKey?: string;
  model?: string;
  maxTokens?: number;
}

/**
 * Claude provider. Uses vision (page images) + a forced tool call whose
 * input_schema is generated from our Zod schema, so the model must return
 * exactly the shape we validate. Requires ANTHROPIC_API_KEY.
 */
export class AnthropicProvider implements AIProvider {
  readonly name = 'anthropic';
  private readonly client: Anthropic;
  private readonly model: string;
  private readonly maxTokens: number;

  constructor(options: AnthropicProviderOptions = {}) {
    const apiKey = options.apiKey ?? process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY is required for the anthropic provider');
    this.client = new Anthropic({ apiKey });
    this.model = options.model ?? process.env.AI_EXTRACTION_MODEL ?? 'claude-sonnet-4-6';
    this.maxTokens = options.maxTokens ?? 8192;
  }

  async analyzeTender(input: AnalyzeTenderInput): Promise<AnalyzeTenderResult> {
    const inputSchema = toToolInputSchema(extractionResultSchema);

    const content: ContentParam[] = [
      { type: 'text', text: `عنوان المنافسة: ${input.title}\nحلّل صفحات الكراسة التالية:` },
    ];

    for (const page of input.pages) {
      if (page.imageBase64) {
        content.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: page.mediaType ?? 'image/png',
            data: page.imageBase64,
          },
        });
      } else if (page.text) {
        content.push({ type: 'text', text: `--- صفحة ${page.pageNumber} ---\n${page.text}` });
      }
    }

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: this.maxTokens,
      system: EXTRACTION_SYSTEM_PROMPT,
      tools: [
        {
          name: EXTRACTION_TOOL_NAME,
          description: EXTRACTION_TOOL_DESCRIPTION,
          input_schema: inputSchema as Anthropic.Tool.InputSchema,
        },
      ],
      tool_choice: { type: 'tool', name: EXTRACTION_TOOL_NAME },
      messages: [{ role: 'user', content }],
    });

    const toolUse = response.content.find(
      (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use',
    );
    if (!toolUse) throw new Error('Model did not return a tool_use block');

    const result: ExtractionResult = extractionResultSchema.parse(toolUse.input);

    return {
      result,
      usage: {
        provider: this.name,
        model: this.model,
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        costCents: this.estimateCostCents(
          response.usage.input_tokens,
          response.usage.output_tokens,
        ),
      },
    };
  }

  private estimateCostCents(inputTokens: number, outputTokens: number): number {
    const rate = PRICING[this.model] ?? PRICING.default!;
    const cents = (inputTokens / 1_000_000) * rate.input + (outputTokens / 1_000_000) * rate.output;
    return Math.round(cents);
  }
}
