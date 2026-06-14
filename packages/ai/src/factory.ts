import type { AIProvider } from './types';
import { MockProvider } from './providers/mock';
import { AnthropicProvider } from './providers/anthropic';

/**
 * Resolve the AI provider from `AI_PROVIDER` (mock | anthropic). Defaults to the
 * offline mock so dev/test/build never require an API key.
 */
export function getProvider(name: string = process.env.AI_PROVIDER ?? 'mock'): AIProvider {
  switch (name) {
    case 'anthropic':
      return new AnthropicProvider();
    case 'mock':
    default:
      return new MockProvider();
  }
}
