import { User, MediaAsset, ChatMessage, ChatSession, AnalyticsSummary, AdvisoryConfig } from '../types/index.ts';

const TOKEN_KEY = 'omnisight_auth_token';

export const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setStoredToken = (token: string | null) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If not FormData, default to application/json
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

// Authentication API
export const apiAuth = {
  login: (email: string, password: string) =>
    request<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (fullName: string, email: string, password: string) =>
    request<{ user: User; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ fullName, email, password }),
    }),

  getMe: () =>
    request<{ user: User }>('/api/auth/me'),
};

// Media Assets API
export const apiAssets = {
  list: (params?: { search?: string; modality?: string; category?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.modality && params.modality !== 'all') query.set('modality', params.modality);
    if (params?.category && params.category !== 'all') query.set('category', params.category);
    return request<{ assets: MediaAsset[] }>(`/api/assets?${query.toString()}`);
  },

  getById: (id: string) =>
    request<{ asset: MediaAsset }>(`/api/assets/${id}`),

  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request<{ asset: MediaAsset; message: string }>('/api/assets/upload', {
      method: 'POST',
      body: formData,
    });
  },

  delete: (id: string) =>
    request<{ message: string; assetId: string }>(`/api/assets/${id}`, {
      method: 'DELETE',
    }),
};

// AI Engine API
export const apiAi = {
  analyzeAsset: (assetId: string) =>
    request<{ insight: any; message: string }>('/api/ai/analyze-asset', {
      method: 'POST',
      body: JSON.stringify({ assetId }),
    }),

  chat: (params: {
    message: string;
    assetIds: string[];
    sessionId?: string;
    depth?: AdvisoryConfig['depth'];
    persona?: AdvisoryConfig['persona'];
    tone?: AdvisoryConfig['tone'];
  }) =>
    request<{
      sessionId: string;
      userMessage: ChatMessage;
      assistantMessage: ChatMessage;
    }>('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  synthesizeReport: (params: {
    assetIds: string[];
    depth?: AdvisoryConfig['depth'];
    persona?: AdvisoryConfig['persona'];
    tone?: AdvisoryConfig['tone'];
  }) =>
    request<{ reportMarkdown: string; assetCount: number }>('/api/ai/synthesize-report', {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  getSessions: () =>
    request<{ sessions: ChatSession[] }>('/api/ai/sessions'),

  getSessionMessages: (sessionId: string) =>
    request<{ messages: ChatMessage[] }>(`/api/ai/sessions/${sessionId}/messages`),
};

// Analytics API
export const apiAnalytics = {
  getSummary: () =>
    request<{ summary: AnalyticsSummary }>('/api/analytics/summary'),
};
