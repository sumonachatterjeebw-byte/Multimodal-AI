export type ModalityType = 'text' | 'image' | 'audio' | 'video' | 'document';

export interface User {
  id: string;
  email: string;
  fullName: string;
  createdAt?: string;
}

export interface EntityInsight {
  name: string;
  category: string;
}

export interface MetricInsight {
  metric: string;
  value: string;
}

export interface AssetInsights {
  entities: EntityInsight[];
  keyMetrics: MetricInsight[];
  tags: string[];
  sentiment: 'Positive' | 'Neutral' | 'Negative' | 'Mixed';
  confidenceScore: number;
}

export interface MediaAsset {
  id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  modality: ModalityType;
  storagePath: string;
  extractedText?: string;
  summary?: string;
  category: string;
  createdAt: string;
  insights?: AssetInsights | null;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  sender: 'user' | 'assistant';
  content: string;
  attachedAssetIds: string[];
  createdAt: string;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  message_count?: number;
}

export interface AdvisoryConfig {
  depth: 'Quick Summary' | 'Detailed Synthesis' | 'Deep Technical Audit';
  persona: 'Executive Leader' | 'Domain Expert / Auditor' | 'General Public';
  tone: 'Strictly Analytical' | 'Action-Oriented' | 'Bullet-Point Structured';
}

export interface AnalyticsSummary {
  totalAssets: number;
  totalBytes: number;
  totalSessions: number;
  totalMessages: number;
  avgConfidence: number;
  estimatedTokensProcessed: number;
  modalityDistribution: Array<{
    modality: ModalityType;
    label: string;
    count: number;
    bytes: number;
    color: string;
  }>;
  categories: Array<{ category: string; count: number }>;
  sentimentDistribution: Array<{ sentiment: string; count: number }>;
  topEntities: Array<{ name: string; count: number; category: string }>;
  topTags: Array<{ tag: string; count: number }>;
}
