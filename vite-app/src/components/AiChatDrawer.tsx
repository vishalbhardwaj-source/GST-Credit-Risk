import { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Bot,
  X,
  Send,
  Trash2,
  Settings2,
  Copy,
  Check,
  Key,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  RefreshCw,
  FileText,
  Palette,
} from 'lucide-react';
import { getApiBaseUrl } from '../config';
import type { ReconciledInvoice } from '../types';

export type AiProvider = 'gemini' | 'openai' | 'claude' | 'groq';
export type ChatThemeKey = 'cyan' | 'emerald' | 'indigo' | 'amber' | 'dynamic';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  provider?: AiProvider;
  model?: string;
}

interface AiChatDrawerProps {
  invoices: ReconciledInvoice[];
  kpis: {
    total: number;
    matched: number;
    unmatched: number;
    totalTaxAtRisk: number;
    safeCount: number;
    safeTax: number;
    watchCount: number;
    watchTax: number;
    chaseCount: number;
    chaseTax: number;
  };
  selectedInvoice: ReconciledInvoice | null;
}

interface ThemeConfig {
  name: string;
  primary: string;
  primaryHover: string;
  primaryText: string;
  glow: string;
  border: string;
  cardBg: string;
  surfaceBg: string;
  userBubble: string;
  accentBg: string;
  badgeBg: string;
  badgeText: string;
}

const THEME_PRESETS: Record<string, ThemeConfig> = {
  cyan: {
    name: 'Electric Cyan',
    primary: '#0EA5E9',
    primaryHover: '#38BDF8',
    primaryText: '#082F49',
    glow: 'rgba(14, 165, 233, 0.35)',
    border: 'rgba(14, 165, 233, 0.35)',
    cardBg: '#111A2E',
    surfaceBg: '#090E1A',
    userBubble: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
    accentBg: 'rgba(14, 165, 233, 0.12)',
    badgeBg: 'rgba(14, 165, 233, 0.18)',
    badgeText: '#7DD3FC',
  },
  emerald: {
    name: 'Mint Emerald',
    primary: '#10B981',
    primaryHover: '#34D399',
    primaryText: '#064E3B',
    glow: 'rgba(16, 185, 129, 0.35)',
    border: 'rgba(16, 185, 129, 0.35)',
    cardBg: '#0E1F1A',
    surfaceBg: '#07120F',
    userBubble: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    accentBg: 'rgba(16, 185, 129, 0.12)',
    badgeBg: 'rgba(16, 185, 129, 0.18)',
    badgeText: '#6EE7B7',
  },
  indigo: {
    name: 'Royal Indigo',
    primary: '#6366F1',
    primaryHover: '#818CF8',
    primaryText: '#1E1B4B',
    glow: 'rgba(99, 102, 241, 0.35)',
    border: 'rgba(99, 102, 241, 0.35)',
    cardBg: '#141733',
    surfaceBg: '#0A0C1D',
    userBubble: 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)',
    accentBg: 'rgba(99, 102, 241, 0.12)',
    badgeBg: 'rgba(99, 102, 241, 0.18)',
    badgeText: '#A5B4FC',
  },
  amber: {
    name: 'Claude Bronze',
    primary: '#F59E0B',
    primaryHover: '#FBBF24',
    primaryText: '#451A03',
    glow: 'rgba(245, 158, 11, 0.35)',
    border: 'rgba(245, 158, 11, 0.35)',
    cardBg: '#1F1710',
    surfaceBg: '#120D08',
    userBubble: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
    accentBg: 'rgba(245, 158, 11, 0.12)',
    badgeBg: 'rgba(245, 158, 11, 0.18)',
    badgeText: '#FDE68A',
  },
};

const PROVIDER_METADATA: Record<
  AiProvider,
  {
    name: string;
    badge: string;
    color: string;
    consoleUrl: string;
    themeKey: string;
    models: { id: string; name: string; tag: string }[];
  }
> = {
  gemini: {
    name: 'Google Gemini',
    badge: 'Gemini',
    color: '#0EA5E9',
    themeKey: 'cyan',
    consoleUrl: 'https://aistudio.google.com/app/apikey',
    models: [
      { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash', tag: 'Latest Recommended' },
      { id: 'gemini-3.8-pro', name: 'Gemini 3.8 Pro', tag: 'Deep Reasoning' },
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', tag: 'Fast Multimodal' },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', tag: 'High Speed Stable' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', tag: 'Long Context' },
    ],
  },
  openai: {
    name: 'OpenAI (ChatGPT)',
    badge: 'ChatGPT',
    color: '#10B981',
    themeKey: 'emerald',
    consoleUrl: 'https://platform.openai.com/api-keys',
    models: [
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', tag: 'Fast & Cost-Effective' },
      { id: 'gpt-4o', name: 'GPT-4o', tag: 'Flagship Intelligence' },
      { id: 'o3-mini', name: 'o3-mini', tag: 'Reasoning Model' },
      { id: 'o1', name: 'o1', tag: 'Complex Reasoning' },
    ],
  },
  claude: {
    name: 'Anthropic Claude',
    badge: 'Claude',
    color: '#F59E0B',
    themeKey: 'amber',
    consoleUrl: 'https://console.anthropic.com/settings/keys',
    models: [
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', tag: 'Top Nuance & Accuracy' },
      { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', tag: 'Ultra-Fast Reasoning' },
      { id: 'claude-3-7-sonnet', name: 'Claude 3.7 Sonnet', tag: 'Hybrid Reasoning' },
    ],
  },
  groq: {
    name: 'Groq (Open Llama)',
    badge: 'Groq',
    color: '#F97316',
    themeKey: 'amber',
    consoleUrl: 'https://console.groq.com/keys',
    models: [
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', tag: 'Blazing Fast Inference' },
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B', tag: 'Instant Speed' },
      { id: 'deepseek-r1-distill-llama-70b', name: 'DeepSeek R1 70B', tag: 'Reasoning' },
    ],
  },
};

const SUGGESTED_PROMPTS = [
  {
    title: '📊 Audit ITC at Risk',
    query: 'Summarize my current total ITC at risk, breakdown across action buckets, and identify the top vendors causing exposure.',
  },
  {
    title: '⚖️ Rule 37A Statutory Deadline',
    query: 'Explain the legal requirements of Rule 37A, the Nov 30 statutory cutoff, and the 18% p.a. interest liability for missing GSTR-3B filings.',
  },
  {
    title: '✉️ Draft Vendor Notice',
    query: 'Draft a formal supplier demand notice citing Rule 37A and Section 16(2)(aa) requesting immediate GSTR-1 & GSTR-3B compliance, warning of an Accounts Payable hold.',
  },
  {
    title: '🔍 3-Signal Decision Logic',
    query: 'How does this platform determine whether an invoice goes to Safe to Hold, Watch, or Chase Now using IRN, AP leverage, and filing patterns?',
  },
];

export function AiChatDrawer({ invoices, kpis, selectedInvoice }: AiChatDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // Active theme state (default is Electric Cyan for clean high contrast)
  const [themeMode, setThemeMode] = useState<ChatThemeKey>(() => {
    return (localStorage.getItem('gst_ai_theme_mode') as ChatThemeKey) || 'cyan';
  });

  // Provider & API Keys state
  const [provider, setProvider] = useState<AiProvider>(() => {
    return (localStorage.getItem('gst_ai_selected_provider') as AiProvider) || 'gemini';
  });
  const [model, setModel] = useState<string>(() => {
    const saved = localStorage.getItem('gst_ai_selected_model');
    if (!saved || saved === 'gemini-2.5-flash') {
      localStorage.setItem('gst_ai_selected_model', 'gemini-3.8-flash');
      return 'gemini-3.8-flash';
    }
    return saved;
  });
  const [apiKeys, setApiKeys] = useState<Record<AiProvider, string>>(() => {
    try {
      const saved = localStorage.getItem('gst_ai_user_keys');
      return saved ? JSON.parse(saved) : { gemini: '', openai: '', claude: '', groq: '' };
    } catch {
      return { gemini: '', openai: '', claude: '', groq: '' };
    }
  });

  const [serverKeys, setServerKeys] = useState<Record<string, boolean>>({});
  const [includeContext, setIncludeContext] = useState(true);

  // Chat message state
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Resolve current active visual theme
  const activeThemeConfig: ThemeConfig =
    themeMode === 'dynamic'
      ? THEME_PRESETS[PROVIDER_METADATA[provider].themeKey] || THEME_PRESETS.cyan
      : THEME_PRESETS[themeMode] || THEME_PRESETS.cyan;

  // Check server configuration for default keys on load
  useEffect(() => {
    const checkServerConfig = async () => {
      try {
        const res = await fetch(`${getApiBaseUrl()}/api/ai/config`);
        if (res.ok) {
          const data = await res.json();
          if (data.server_keys) {
            setServerKeys(data.server_keys);
          }
        }
      } catch {
        // Backend offline or running standalone
      }
    };
    checkServerConfig();
  }, []);

  const handleSelectTheme = (mode: ChatThemeKey) => {
    setThemeMode(mode);
    localStorage.setItem('gst_ai_theme_mode', mode);
  };

  const handleSelectProvider = (newProvider: AiProvider) => {
    setProvider(newProvider);
    localStorage.setItem('gst_ai_selected_provider', newProvider);
    const defaultModelForProvider = PROVIDER_METADATA[newProvider].models[0].id;
    setModel(defaultModelForProvider);
    localStorage.setItem('gst_ai_selected_model', defaultModelForProvider);
  };

  const handleModelChange = (newModel: string) => {
    setModel(newModel);
    localStorage.setItem('gst_ai_selected_model', newModel);
  };

  const handleApiKeyChange = (val: string) => {
    const updated = { ...apiKeys, [provider]: val.trim() };
    setApiKeys(updated);
    localStorage.setItem('gst_ai_user_keys', JSON.stringify(updated));
  };

  // Auto-scroll messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !showSettings) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, showSettings]);

  // Build live context summary from props
  const buildCurrentContext = () => {
    if (!includeContext) return undefined;

    const vendorRiskMap = new Map<string, { vendor_name: string; gstin: string; at_risk_amount: number; risk_level: string }>();
    invoices
      .filter((i) => !i.matchResult.matched)
      .forEach((inv) => {
        const existing = vendorRiskMap.get(inv.gstin) || {
          vendor_name: inv.vendorName,
          gstin: inv.gstin,
          at_risk_amount: 0,
          risk_level: inv.routingBucket === 'SAFE TO HOLD' ? 'HIGH' : 'MEDIUM',
        };
        existing.at_risk_amount += inv.taxAmount;
        vendorRiskMap.set(inv.gstin, existing);
      });

    const topRiskyVendors = Array.from(vendorRiskMap.values())
      .sort((a, b) => b.at_risk_amount - a.at_risk_amount)
      .slice(0, 5);

    return {
      total_invoices: invoices.length,
      total_itc: invoices.reduce((s, i) => s + i.taxAmount, 0),
      at_risk_itc: kpis.totalTaxAtRisk,
      days_to_cutoff: 35,
      bucket_breakdown: {
        bucket1: kpis.safeCount,
        bucket2: kpis.watchCount,
        bucket3: kpis.chaseCount,
      },
      top_risky_vendors: topRiskyVendors,
      selected_invoice: selectedInvoice
        ? {
            invoiceNumber: selectedInvoice.invoiceNumber,
            vendorName: selectedInvoice.vendorName,
            taxAmount: selectedInvoice.taxAmount,
            matched: selectedInvoice.matchResult.matched,
            irnPresent: selectedInvoice.irnRecord.irnPresent,
          }
        : null,
    };
  };

  const streamFromDirectProvider = async (
    userKey: string,
    history: { role: string; content: string }[],
    systemPrompt: string,
    onChunk: (text: string) => void
  ): Promise<void> => {
    if (provider === 'gemini') {
      const targetModel = model === 'gemini-2.5-flash' ? 'gemini-3.8-flash' : (model || 'gemini-3.8-flash');
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:streamGenerateContent?alt=sse&key=${userKey}`;
      const contents = history.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: { temperature: 0.2, maxOutputTokens: 1500 },
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `Gemini API HTTP ${res.status}`);
      }
      const reader = res.body?.getReader();
      if (!reader) throw new Error('Streaming not supported.');
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6).trim();
            if (jsonStr === '[DONE]') continue;
            try {
              const parsed = JSON.parse(jsonStr);
              const chunk = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
              if (chunk) onChunk(chunk);
            } catch {}
          }
        }
      }
      return;
    }

    if (provider === 'openai' || provider === 'groq') {
      const endpoint =
        provider === 'groq'
          ? 'https://api.groq.com/openai/v1/chat/completions'
          : 'https://api.openai.com/v1/chat/completions';
      const apiMessages = [{ role: 'system', content: systemPrompt }, ...history];
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: apiMessages,
          temperature: 0.2,
          stream: true,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `${provider.toUpperCase()} API HTTP ${res.status}`);
      }
      const reader = res.body?.getReader();
      if (!reader) throw new Error('Streaming not supported.');
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6).trim();
            if (jsonStr === '[DONE]') break;
            try {
              const parsed = JSON.parse(jsonStr);
              const chunk = parsed.choices?.[0]?.delta?.content;
              if (chunk) onChunk(chunk);
            } catch {}
          }
        }
      }
      return;
    }

    throw new Error(`Direct streaming for ${provider} requires backend proxy.`);
  };

  const handleSendMessage = async (userPrompt?: string) => {
    const text = (userPrompt || inputValue).trim();
    if (!text || isLoading) return;

    setErrorMessage(null);
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    const activeUserKey = apiKeys[provider]?.trim();
    const isServerKeyAvailable = !!serverKeys[provider];

    if (!activeUserKey && !isServerKeyAvailable) {
      setShowSettings(true);
      setIsLoading(false);
      setErrorMessage(
        `Please provide your ${PROVIDER_METADATA[provider].name} API key below to start querying.`
      );
      return;
    }

    // Immediately create placeholder assistant message for 0ms visual response
    const assistantId = `msg-${Date.now()}-reply`;
    setMessages((prev) => [
      ...prev,
      {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        provider,
        model,
      },
    ]);

    const onChunk = (chunkText: string) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + chunkText } : m))
      );
    };

    try {
      const context = buildCurrentContext();
      const payload = {
        provider,
        model,
        apiKey: activeUserKey || undefined,
        messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        context,
      };

      try {
        const res = await fetch(`${getApiBaseUrl()}/api/ai/chat/stream`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.detail || `Server error ${res.status}`);
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error('Stream reader unavailable');
        const decoder = new TextDecoder();
        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const jsonStr = line.slice(6).trim();
              if (jsonStr === '[DONE]') break;
              try {
                const parsed = JSON.parse(jsonStr);
                if (parsed.text) onChunk(parsed.text);
              } catch {}
            }
          }
        }
      } catch (backendError: any) {
        if (activeUserKey) {
          const simpleSystemPrompt =
            'You are an expert Indian GST Tax and Input Tax Credit (ITC) Advisor. Provide direct, concise, and structured answers.';
          await streamFromDirectProvider(
            activeUserKey,
            newMessages.map((m) => ({ role: m.role, content: m.content })),
            simpleSystemPrompt,
            onChunk
          );
        } else {
          throw backendError;
        }
      }
    } catch (err: any) {
      console.error('AI chat failed:', err);
      // Remove empty assistant placeholder if failed completely
      setMessages((prev) => prev.filter((m) => m.id !== assistantId || m.content.length > 0));
      setErrorMessage(err.message || 'Failed to communicate with AI provider. Please verify your API key.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([]);
    setErrorMessage(null);
  };

  const activeProviderMeta = PROVIDER_METADATA[provider];
  const hasConfiguredKey = !!apiKeys[provider] || !!serverKeys[provider];

  return (
    <>
      {/* ── Floating Action Button (FAB) ─────────────────────────────────── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 20px',
            borderRadius: '9999px',
            background: 'linear-gradient(135deg, #0F172A 0%, #030712 100%)',
            border: `1.5px solid ${activeThemeConfig.border}`,
            boxShadow: `0 10px 32px rgba(0, 0, 0, 0.6), 0 0 24px ${activeThemeConfig.glow}`,
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
            e.currentTarget.style.borderColor = activeThemeConfig.primaryHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.borderColor = activeThemeConfig.border;
          }}
          title="Open AI Tax Copilot"
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: activeThemeConfig.accentBg,
              border: `1px solid ${activeThemeConfig.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={16} color={activeThemeConfig.primary} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', lineHeight: 1.25 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>
                Ask AI Copilot
              </span>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  padding: '2px 7px',
                  borderRadius: '9999px',
                  background: activeThemeConfig.badgeBg,
                  color: activeThemeConfig.badgeText,
                  border: `1px solid ${activeThemeConfig.border}`,
                }}
              >
                {activeProviderMeta.badge}
              </span>
            </div>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
              Rule 37A &amp; ITC Lookup
            </span>
          </div>
        </button>
      )}

      {/* ── Floating Chat Drawer Window ─────────────────────────────────── */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: isExpanded ? '16px' : '24px',
            right: isExpanded ? '16px' : '24px',
            top: isExpanded ? '16px' : 'auto',
            width: isExpanded ? '640px' : '440px',
            maxWidth: 'calc(100vw - 32px)',
            height: isExpanded ? 'calc(100vh - 32px)' : '640px',
            maxHeight: 'calc(100vh - 48px)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '16px',
            background: activeThemeConfig.surfaceBg,
            border: `1px solid ${activeThemeConfig.border}`,
            boxShadow: `0 24px 60px rgba(0, 0, 0, 0.8), 0 0 35px ${activeThemeConfig.glow}`,
            overflow: 'hidden',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {/* ── Drawer Header ─────────────────────────────────────────────── */}
          <div
            style={{
              padding: '14px 18px',
              background: activeThemeConfig.cardBg,
              borderBottom: `1px solid ${activeThemeConfig.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  background: activeThemeConfig.accentBg,
                  border: `1px solid ${activeThemeConfig.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bot size={18} color={activeThemeConfig.primary} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                    GST Tax Copilot
                  </h3>
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      background: activeThemeConfig.badgeBg,
                      border: `1px solid ${activeThemeConfig.border}`,
                      color: activeThemeConfig.badgeText,
                      cursor: 'pointer',
                    }}
                    title="Change AI Provider, Color Theme & Settings"
                  >
                    <span>{activeProviderMeta.badge}</span>
                    <Settings2 size={12} color={activeThemeConfig.primary} />
                  </button>
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '1px' }}>
                  Rule 37A • GSTR-2B • Vendor Risk
                </div>
              </div>
            </div>

            {/* Window Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                onClick={handleClearHistory}
                disabled={messages.length === 0}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: messages.length === 0 ? 'rgba(255, 255, 255, 0.2)' : '#94a3b8',
                  padding: '6px',
                  borderRadius: '8px',
                  cursor: messages.length === 0 ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Clear Chat History"
              >
                <Trash2 size={16} />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  padding: '6px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  padding: '6px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Close Drawer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* ── Settings Accordion ────────────────────────────────────────── */}
          {showSettings && (
            <div
              style={{
                padding: '16px 18px',
                background: '#070C18',
                borderBottom: `1px solid ${activeThemeConfig.border}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                fontSize: '12px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Key size={14} color={activeThemeConfig.primary} /> AI Settings &amp; Customization
                </span>
                <button
                  onClick={() => setShowSettings(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: activeThemeConfig.primary,
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '11px',
                  }}
                >
                  Done
                </button>
              </div>

              {/* 🎨 Chatbot Color Theme Picker */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '6px' }}>
                  <Palette size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
                  Chatbot Color Theme:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                  {[
                    { key: 'cyan', label: 'Cyan', color: '#0EA5E9' },
                    { key: 'emerald', label: 'Mint', color: '#10B981' },
                    { key: 'indigo', label: 'Indigo', color: '#6366F1' },
                    { key: 'amber', label: 'Bronze', color: '#F59E0B' },
                    { key: 'dynamic', label: 'Auto (AI)', color: '#38BDF8' },
                  ].map((t) => {
                    const isSelected = themeMode === t.key;
                    return (
                      <button
                        key={t.key}
                        onClick={() => handleSelectTheme(t.key as ChatThemeKey)}
                        style={{
                          padding: '6px 4px',
                          borderRadius: '8px',
                          fontSize: '10px',
                          fontWeight: isSelected ? 700 : 500,
                          textAlign: 'center',
                          cursor: 'pointer',
                          background: isSelected ? t.color : 'rgba(255, 255, 255, 0.05)',
                          color: isSelected ? '#000000' : '#e2e8f0',
                          border: isSelected ? `1.5px solid ${t.color}` : '1px solid rgba(255, 255, 255, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                        }}
                      >
                        <span
                          style={{
                            width: '7px',
                            height: '7px',
                            borderRadius: '50%',
                            background: isSelected ? '#000000' : t.color,
                          }}
                        />
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Provider Tabs */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '6px' }}>
                  Select AI Provider:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                  {(Object.keys(PROVIDER_METADATA) as AiProvider[]).map((pKey) => {
                    const meta = PROVIDER_METADATA[pKey];
                    const isSelected = provider === pKey;
                    return (
                      <button
                        key={pKey}
                        onClick={() => handleSelectProvider(pKey)}
                        style={{
                          padding: '8px 4px',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: isSelected ? 700 : 500,
                          textAlign: 'center',
                          cursor: 'pointer',
                          background: isSelected ? activeThemeConfig.primary : 'rgba(255, 255, 255, 0.04)',
                          color: isSelected ? activeThemeConfig.primaryText : '#e2e8f0',
                          border: isSelected
                            ? `1px solid ${activeThemeConfig.primary}`
                            : '1px solid rgba(255, 255, 255, 0.12)',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {meta.badge}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Model Select */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>
                  Model:
                </label>
                <select
                  value={activeProviderMeta.models.some((m) => m.id === model) ? model : 'custom'}
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      handleModelChange('');
                    } else {
                      handleModelChange(e.target.value);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: '#111827',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontSize: '12px',
                    outline: 'none',
                    marginBottom: !activeProviderMeta.models.some((m) => m.id === model) ? '6px' : '0',
                  }}
                >
                  {activeProviderMeta.models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} — {m.tag}
                    </option>
                  ))}
                  <option value="custom">Custom Model ID (Manual entry)...</option>
                </select>

                {!activeProviderMeta.models.some((m) => m.id === model) && (
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => handleModelChange(e.target.value)}
                    placeholder="Enter model ID (e.g. gemini-3.8-flash, o3-mini)..."
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      background: '#111827',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: '#ffffff',
                      fontSize: '12px',
                      outline: 'none',
                      marginTop: '4px',
                    }}
                  />
                )}
              </div>

              {/* API Key Input */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    API Key for {activeProviderMeta.name}
                    {serverKeys[provider] && (
                      <span style={{ fontSize: '10px', color: '#34d399', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <ShieldCheck size={12} /> (Server Ready)
                      </span>
                    )}
                  </label>
                  <a
                    href={activeProviderMeta.consoleUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: '11px', color: activeThemeConfig.primary, display: 'flex', alignItems: 'center', gap: '3px' }}
                  >
                    Get Key <ExternalLink size={11} />
                  </a>
                </div>

                <div style={{ position: 'relative' }}>
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKeys[provider]}
                    onChange={(e) => handleApiKeyChange(e.target.value)}
                    placeholder={
                      serverKeys[provider]
                        ? 'Using server default key (enter custom key to override)'
                        : `Enter your ${activeProviderMeta.badge} API Key...`
                    }
                    style={{
                      width: '100%',
                      padding: '8px 32px 8px 10px',
                      borderRadius: '8px',
                      background: '#111827',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      fontSize: '12px',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      padding: '2px',
                      display: 'flex',
                    }}
                  >
                    {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
                  Saved securely in your browser's local storage. Never logged externally.
                </div>
              </div>

              {/* Data Context Toggle */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  paddingTop: '8px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <input
                  type="checkbox"
                  id="includeContext"
                  checked={includeContext}
                  onChange={(e) => setIncludeContext(e.target.checked)}
                  style={{ cursor: 'pointer', accentColor: activeThemeConfig.primary }}
                />
                <label htmlFor="includeContext" style={{ fontSize: '11px', color: '#cbd5e1', cursor: 'pointer' }}>
                  Inject current session context (₹{kpis.totalTaxAtRisk.toLocaleString('en-IN')} ITC at risk, top vendors, inspected invoice)
                </label>
              </div>
            </div>
          )}

          {/* ── Active Invoice Focus Banner ────────────────────────────────── */}
          {selectedInvoice && (
            <div
              style={{
                padding: '8px 16px',
                background: activeThemeConfig.accentBg,
                borderBottom: `1px solid ${activeThemeConfig.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '11px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                <FileText size={14} color={activeThemeConfig.primary} style={{ flexShrink: 0 }} />
                <span style={{ color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Active Focus: <strong style={{ color: '#ffffff' }}>{selectedInvoice.invoiceNumber}</strong> ({selectedInvoice.vendorName})
                </span>
              </div>
              <button
                onClick={() =>
                  handleSendMessage(
                    `Analyze invoice ${selectedInvoice.invoiceNumber} from supplier ${selectedInvoice.vendorName}. Tax amount is ₹${selectedInvoice.taxAmount.toLocaleString('en-IN')}. Matched in GSTR-2B: ${selectedInvoice.matchResult.matched}. IRN: ${selectedInvoice.irnRecord.irnPresent ? 'Present' : 'Absent'}. What actions should the CFO/Tax team take?`
                  )
                }
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: activeThemeConfig.primary,
                  fontSize: '11px',
                  fontWeight: 600,
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  flexShrink: 0,
                  marginLeft: '8px',
                }}
              >
                Analyze this invoice
              </button>
            </div>
          )}

          {/* ── Error Banner ──────────────────────────────────────────────── */}
          {errorMessage && (
            <div
              style={{
                padding: '10px 16px',
                background: 'rgba(239, 68, 68, 0.15)',
                borderBottom: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1 }}>{errorMessage}</div>
              <button
                onClick={() => setErrorMessage(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fca5a5',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                ✕
              </button>
            </div>
          )}

          {/* ── Chat Messages Body ────────────────────────────────────────── */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            {messages.length === 0 ? (
              <div
                style={{
                  margin: 'auto 0',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  padding: '12px 6px',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '16px',
                    background: activeThemeConfig.accentBg,
                    border: `1px solid ${activeThemeConfig.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '12px',
                    boxShadow: `0 8px 24px ${activeThemeConfig.glow}`,
                  }}
                >
                  <Sparkles size={24} color={activeThemeConfig.primary} />
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', margin: '0 0 6px 0' }}>
                  How can I assist your GST compliance today?
                </h4>
                <p style={{ fontSize: '12px', color: '#94a3b8', maxWidth: '340px', margin: '0 0 20px 0', lineHeight: 1.5 }}>
                  Audit at-risk ITC, explain Rule 37A statutory reversal dates, or draft supplier demand notices.
                </p>

                {/* Suggested Prompts Grid */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                  {SUGGESTED_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(prompt.query)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.09)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = activeThemeConfig.accentBg;
                        e.currentTarget.style.borderColor = activeThemeConfig.border;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.09)';
                      }}
                    >
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#f1f5f9', marginBottom: '3px' }}>
                        {prompt.title}
                      </div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: '#94a3b8',
                          lineHeight: 1.4,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {prompt.query}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    width: '100%',
                  }}
                >
                  <div
                    style={{
                      maxWidth: msg.role === 'user' ? '85%' : '92%',
                      borderRadius: msg.role === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                      padding: msg.role === 'user' ? '10px 14px' : '12px 16px',
                      fontSize: '12px',
                      lineHeight: 1.55,
                      background:
                        msg.role === 'user'
                          ? activeThemeConfig.userBubble
                          : activeThemeConfig.cardBg,
                      color: '#ffffff',
                      border: msg.role === 'user' ? 'none' : `1px solid rgba(255, 255, 255, 0.12)`,
                      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    {/* Assistant Message Header */}
                    {msg.role === 'assistant' && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingBottom: '8px',
                          marginBottom: '8px',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                          fontSize: '11px',
                          color: '#94a3b8',
                        }}
                      >
                        <span style={{ fontWeight: 700, color: activeThemeConfig.primary, display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Bot size={13} color={activeThemeConfig.primary} />
                          {msg.provider ? PROVIDER_METADATA[msg.provider]?.badge : 'Copilot'}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '10px' }}>{msg.timestamp}</span>
                          <button
                            onClick={() => handleCopy(msg.id, msg.content)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#94a3b8',
                              cursor: 'pointer',
                              padding: '2px',
                              display: 'flex',
                            }}
                            title="Copy response"
                          >
                            {copiedId === msg.id ? <Check size={13} color="#34d399" /> : <Copy size={13} />}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Message Body Content */}
                    <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#f8fafc' }}>
                      {msg.content ? (
                        <>
                          {msg.content}
                          {isLoading && msg.id === messages[messages.length - 1]?.id && (
                            <span
                              style={{
                                display: 'inline-block',
                                width: '6px',
                                height: '13px',
                                background: activeThemeConfig.primary,
                                marginLeft: '4px',
                                verticalAlign: '-1px',
                              }}
                              className="animate-pulse"
                            />
                          )}
                        </>
                      ) : (
                        <span style={{ color: activeThemeConfig.primary, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <RefreshCw size={12} className="animate-spin" /> Thinking...
                        </span>
                      )}
                    </div>

                    {msg.role === 'user' && (
                      <div style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.75)', textAlign: 'right', marginTop: '4px' }}>
                        {msg.timestamp}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* ── Footer Input Area ─────────────────────────────────────────── */}
          <div
            style={{
              padding: '12px 16px',
              background: activeThemeConfig.cardBg,
              borderTop: `1px solid ${activeThemeConfig.border}`,
            }}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}
            >
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={`Ask ${activeProviderMeta.badge} about GST risk, Rule 37A, vendors...`}
                rows={1}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: '10px',
                  background: '#090E1A',
                  border: `1px solid rgba(255, 255, 255, 0.15)`,
                  color: '#ffffff',
                  fontSize: '12px',
                  lineHeight: 1.4,
                  resize: 'none',
                  outline: 'none',
                  minHeight: '40px',
                  maxHeight: '110px',
                  fontFamily: 'inherit',
                }}
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: activeThemeConfig.primary,
                  color: activeThemeConfig.primaryText,
                  border: 'none',
                  cursor: isLoading || !inputValue.trim() ? 'not-allowed' : 'pointer',
                  opacity: isLoading || !inputValue.trim() ? 0.4 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontWeight: 700,
                  transition: 'all 0.15s ease',
                }}
                title="Send Message (Enter)"
              >
                <Send size={16} />
              </button>
            </form>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '8px',
                fontSize: '10px',
                color: '#94a3b8',
                padding: '0 2px',
              }}
            >
              <span>
                Provider: <strong style={{ color: '#ffffff' }}>{activeProviderMeta.name}</strong>
              </span>
              <button
                type="button"
                onClick={() => setShowSettings(!showSettings)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: activeThemeConfig.primary,
                  cursor: 'pointer',
                  fontSize: '10px',
                  textDecoration: 'underline',
                }}
              >
                {hasConfiguredKey ? 'Change theme / settings' : 'Configure API Key'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
