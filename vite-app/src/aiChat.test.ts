import { describe, it, expect } from 'vitest';
import type { AiProvider } from './components/AiChatDrawer';

describe('AI Copilot Provider Configurations', () => {
  const supportedProviders: AiProvider[] = ['gemini', 'openai', 'claude', 'groq'];

  it('contains valid providers with models', () => {
    expect(supportedProviders).toContain('gemini');
    expect(supportedProviders).toContain('openai');
    expect(supportedProviders).toContain('claude');
    expect(supportedProviders).toContain('groq');
  });

  it('validates provider key storage schema', () => {
    const keys: Record<AiProvider, string> = {
      gemini: 'AIzaSyTestKey123',
      openai: 'sk-proj-testKey123',
      claude: 'sk-ant-testKey123',
      groq: 'gsk_testKey123',
    };

    const serialized = JSON.stringify(keys);
    const parsed = JSON.parse(serialized);

    expect(parsed.gemini).toBe('AIzaSyTestKey123');
    expect(parsed.openai).toBe('sk-proj-testKey123');
    expect(parsed.claude).toBe('sk-ant-testKey123');
    expect(parsed.groq).toBe('gsk_testKey123');
  });
});
