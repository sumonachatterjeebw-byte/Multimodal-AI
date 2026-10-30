import { PGlite } from '@electric-sql/pglite';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

// Ensure data and uploads directories exist
const dataDir = path.resolve(process.cwd(), 'data');
const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'omnisight_pg');

declare global {
  var _pgliteInstance: PGlite | undefined;
}

export const getDb = async (): Promise<PGlite> => {
  if (!global._pgliteInstance) {
    const pg = new PGlite(dbPath);
    await pg.waitReady;
    global._pgliteInstance = pg;
    await initSchema(pg);
  }
  return global._pgliteInstance;
};

export const query = async (sql: string, params: any[] = []): Promise<{ rows: any[] }> => {
  const db = await getDb();
  const res = await db.query(sql, params);
  return { rows: res.rows };
};

async function initSchema(pg: PGlite) {
  // Create tables according to production PostgreSQL schema
  await pg.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS media_assets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      file_name TEXT NOT NULL,
      original_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      file_size BIGINT NOT NULL,
      modality TEXT NOT NULL CHECK (modality IN ('text', 'image', 'audio', 'video', 'document')),
      storage_path TEXT NOT NULL,
      extracted_text TEXT,
      summary TEXT,
      category TEXT DEFAULT 'General',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS asset_insights (
      id TEXT PRIMARY KEY,
      asset_id TEXT NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      entities JSONB DEFAULT '[]'::jsonb,
      key_metrics JSONB DEFAULT '[]'::jsonb,
      tags JSONB DEFAULT '[]'::jsonb,
      sentiment TEXT,
      confidence_score NUMERIC(3,2),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS chat_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL DEFAULT 'Multimodal Analysis Session',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      sender TEXT NOT NULL CHECK (sender IN ('user', 'assistant')),
      content TEXT NOT NULL,
      attached_asset_ids JSONB DEFAULT '[]'::jsonb,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_media_assets_user_id ON media_assets(user_id);
    CREATE INDEX IF NOT EXISTS idx_media_assets_modality ON media_assets(modality);
    CREATE INDEX IF NOT EXISTS idx_asset_insights_asset_id ON asset_insights(asset_id);
    CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
  `);

  // Seed demo user and demo cross-modal assets if none exists
  await seedDemoData(pg);
}

async function seedDemoData(pg: PGlite) {
  const demoUserId = 'usr_demo_0192a83e_001';
  const hashedPassword = await bcrypt.hash('password123', 10);

  await pg.query(
    `INSERT INTO users (id, email, password_hash, full_name)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO NOTHING`,
    [demoUserId, 'demo@omnisight.ai', hashedPassword, 'Dr. Sarah Lin (Chief Research Lead)']
  );

  const assetsCheck = await pg.query('SELECT id FROM media_assets LIMIT 1');
  if (assetsCheck.rows.length > 0) return;

  // Create sample files in uploads directory
  const samplePdfPath = path.join(uploadsDir, 'Q3_Financial_Performance_Audit.pdf');
  const sampleChartPath = path.join(uploadsDir, 'Q3_Revenue_Breakdown_Chart.svg');
  const sampleTranscriptPath = path.join(uploadsDir, 'Executive_Earnings_Call_Transcript.txt');
  const sampleDiagramPath = path.join(uploadsDir, 'System_Architecture_Topology.svg');

  if (!fs.existsSync(samplePdfPath)) {
    fs.writeFileSync(samplePdfPath, '%PDF-1.4 Mock Q3 Financial Performance Audit Report\nGross Revenue: $48.2M (+18% YoY)\nEBITDA Margin: 26.4%\nR&D Expenditures: $12.1M\nOperating Cash Flow: $15.8M');
  }

  if (!fs.existsSync(sampleChartPath)) {
    fs.writeFileSync(
      sampleChartPath,
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200" width="100%" height="100%">
        <rect width="400" height="200" fill="#0f172a"/>
        <text x="20" y="30" fill="#94a3b8" font-size="14" font-weight="bold">Q3 Revenue Breakdown (Millions USD)</text>
        <rect x="50" y="60" width="45" height="110" rx="4" fill="#3b82f6"/>
        <text x="56" y="190" fill="#cbd5e1" font-size="11">SaaS</text>
        <text x="56" y="52" fill="#60a5fa" font-size="11">$28.4M</text>
        <rect x="130" y="90" width="45" height="80" rx="4" fill="#10b981"/>
        <text x="133" y="190" fill="#cbd5e1" font-size="11">Cloud</text>
        <text x="135" y="82" fill="#34d399" font-size="11">$14.1M</text>
        <rect x="210" y="130" width="45" height="40" rx="4" fill="#8b5cf6"/>
        <text x="212" y="190" fill="#cbd5e1" font-size="11">Service</text>
        <text x="215" y="122" fill="#a78bfa" font-size="11">$5.7M</text>
      </svg>`
    );
  }

  if (!fs.existsSync(sampleTranscriptPath)) {
    fs.writeFileSync(
      sampleTranscriptPath,
      `[00:00:15] CFO (Marcus Vance): "Our SaaS enterprise recurring contracts surged significantly in the Asia-Pacific region, closing at 28.4 million dollars in Q3. Operating margins stabilized nicely at 26.4%."\n[00:01:42] CEO (Elena Rostova): "Infrastructure migration costs dropped by 14% post Kubernetes transition, freeing up 3.2 million for AI model fine-tuning initiatives."\n[00:03:10] Analyst Question: "What is your target cash reserve heading into fiscal year 2027?"\n[00:03:30] CFO: "We are holding 15.8 million in operational cash flows, maintaining zero unsecured debt."`
    );
  }

  if (!fs.existsSync(sampleDiagramPath)) {
    fs.writeFileSync(
      sampleDiagramPath,
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200" width="100%" height="100%">
        <rect width="400" height="200" fill="#090d16"/>
        <text x="20" y="30" fill="#38bdf8" font-size="13" font-weight="bold">OmniSight Cross-Modal Ingestion Pipeline</text>
        <rect x="25" y="65" width="85" height="50" rx="6" fill="#1e293b" stroke="#334155"/>
        <text x="35" y="95" fill="#f8fafc" font-size="11">Raw Media</text>
        <path d="M 110 90 L 150 90" stroke="#38bdf8" stroke-width="2" marker-end="url(#arrow)"/>
        <rect x="150" y="65" width="100" height="50" rx="6" fill="#1e1b4b" stroke="#6366f1"/>
        <text x="160" y="95" fill="#c7d2fe" font-size="11">Gemini 2.5 Flash</text>
        <path d="M 250 90 L 290 90" stroke="#38bdf8" stroke-width="2"/>
        <rect x="290" y="65" width="90" height="50" rx="6" fill="#064e3b" stroke="#059669"/>
        <text x="300" y="95" fill="#a7f3d0" font-size="11">Vector Insights</text>
      </svg>`
    );
  }

  // Insert media assets individually
  const sampleAssets = [
    {
      id: 'ast_doc_0192a83e_001',
      fileName: 'Q3_Financial_Performance_Audit.pdf',
      originalName: 'Q3 Financial Performance Audit.pdf',
      mimeType: 'application/pdf',
      fileSize: 245000,
      modality: 'document',
      storagePath: samplePdfPath,
      extractedText: 'Gross Revenue: $48.2M (+18% YoY). EBITDA Margin: 26.4%. R&D Expenditures: $12.1M. Operating Cash Flow: $15.8M. Clean audit report certified by external compliance oversight.',
      summary: 'Quarterly financial audit documenting $48.2M gross revenue with 18% YoY growth and strong 26.4% EBITDA profitability.',
      category: 'Finance & Legal'
    },
    {
      id: 'ast_img_0192a83e_002',
      fileName: 'Q3_Revenue_Breakdown_Chart.svg',
      originalName: 'Q3 Revenue Breakdown Chart.svg',
      mimeType: 'image/svg+xml',
      fileSize: 48200,
      modality: 'image',
      storagePath: sampleChartPath,
      extractedText: 'Visual breakdown: SaaS Enterprise Revenue $28.4M, Cloud Infrastructure $14.1M, Consulting & Support Services $5.7M.',
      summary: 'Bar chart illustrating revenue distribution across SaaS, Cloud infrastructure, and technical services.',
      category: 'Finance & Legal'
    },
    {
      id: 'ast_txt_0192a83e_003',
      fileName: 'Executive_Earnings_Call_Transcript.txt',
      originalName: 'Executive Earnings Call Transcript.txt',
      mimeType: 'text/plain',
      fileSize: 18400,
      modality: 'text',
      storagePath: sampleTranscriptPath,
      extractedText: 'CFO Marcus Vance confirms SaaS contracts surged in APAC to $28.4M. CEO Elena Rostova notes $3.2M saved in Kubernetes migration directed to AI model fine-tuning.',
      summary: 'Verbatim audio transcript from Q3 earnings call covering APAC SaaS growth, Kubernetes optimization, and cash reserve targets.',
      category: 'Media & Research'
    },
    {
      id: 'ast_img_0192a83e_004',
      fileName: 'System_Architecture_Topology.svg',
      originalName: 'System Architecture Topology.svg',
      mimeType: 'image/svg+xml',
      fileSize: 36100,
      modality: 'image',
      storagePath: sampleDiagramPath,
      extractedText: 'Diagram showing raw multi-format ingestion flow into Google Gemini 2.5 Flash multimodal transformer yielding vector insights and relational graphs.',
      summary: 'End-to-end multimodal processing architecture showing stream normalization, Gemini inference, and insight storage.',
      category: 'Engineering & Operations'
    }
  ];

  for (const a of sampleAssets) {
    try {
      await pg.query(
        `INSERT INTO media_assets (id, user_id, file_name, original_name, mime_type, file_size, modality, storage_path, extracted_text, summary, category)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (id) DO NOTHING`,
        [a.id, demoUserId, a.fileName, a.originalName, a.mimeType, a.fileSize, a.modality, a.storagePath, a.extractedText, a.summary, a.category]
      );
    } catch (err) {
      console.error('Failed to insert sample asset:', err);
    }
  }

  // Insert structured insights individually
  const sampleInsights = [
    {
      id: 'ins_0192a83e_001',
      assetId: 'ast_doc_0192a83e_001',
      entities: [
        { name: 'External Audit Committee', category: 'Organization' },
        { name: 'EBITDA Margin', category: 'Metric' },
        { name: 'Sarbanes-Oxley', category: 'Legal Standard' }
      ],
      keyMetrics: [
        { metric: 'Gross Revenue', value: '$48.2M' },
        { metric: 'YoY Growth', value: '+18%' },
        { metric: 'EBITDA Margin', value: '26.4%' },
        { metric: 'Operating Cash Flow', value: '$15.8M' }
      ],
      tags: ['audit', 'finance', 'q3-earnings', 'ebitda', 'compliance'],
      sentiment: 'Positive',
      confidenceScore: 0.98
    },
    {
      id: 'ins_0192a83e_002',
      assetId: 'ast_img_0192a83e_002',
      entities: [
        { name: 'SaaS Enterprise', category: 'Business Unit' },
        { name: 'Cloud Infrastructure', category: 'Product Line' }
      ],
      keyMetrics: [
        { metric: 'SaaS Revenue', value: '$28.4M' },
        { metric: 'Cloud Revenue', value: '$14.1M' },
        { metric: 'Services Revenue', value: '$5.7M' }
      ],
      tags: ['chart', 'revenue-distribution', 'saas', 'data-viz'],
      sentiment: 'Positive',
      confidenceScore: 0.96
    },
    {
      id: 'ins_0192a83e_003',
      assetId: 'ast_txt_0192a83e_003',
      entities: [
        { name: 'Marcus Vance', category: 'Executive (CFO)' },
        { name: 'Elena Rostova', category: 'Executive (CEO)' },
        { name: 'APAC Region', category: 'Geography' },
        { name: 'Kubernetes', category: 'Technology' }
      ],
      keyMetrics: [
        { metric: 'Migration Savings', value: '$3.2M' },
        { metric: 'Cost Reduction', value: '14%' },
        { metric: 'Cash Reserves', value: '$15.8M' }
      ],
      tags: ['earnings-call', 'transcript', 'c-level', 'apac', 'strategy'],
      sentiment: 'Positive',
      confidenceScore: 0.95
    },
    {
      id: 'ins_0192a83e_004',
      assetId: 'ast_img_0192a83e_004',
      entities: [
        { name: 'Gemini 2.5 Flash', category: 'AI Model' },
        { name: 'Multimodal Ingestion Pipeline', category: 'Architecture' }
      ],
      keyMetrics: [
        { metric: 'Supported Formats', value: 'PDF, Images, Audio, Video, Text' },
        { metric: 'Pipeline Latency', value: '< 1.2s' }
      ],
      tags: ['architecture', 'pipeline', 'gemini', 'microservices'],
      sentiment: 'Neutral',
      confidenceScore: 0.99
    }
  ];

  for (const ins of sampleInsights) {
    try {
      await pg.query(
        `INSERT INTO asset_insights (id, asset_id, user_id, entities, key_metrics, tags, sentiment, confidence_score)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO NOTHING`,
        [
          ins.id,
          ins.assetId,
          demoUserId,
          JSON.stringify(ins.entities),
          JSON.stringify(ins.keyMetrics),
          JSON.stringify(ins.tags),
          ins.sentiment,
          ins.confidenceScore
        ]
      );
    } catch (err) {
      console.error('Failed to insert sample insight:', err);
    }
  }

  // Create demo chat session
  const sessionId = 'ses_0192a83e_001';
  await pg.query(
    `INSERT INTO chat_sessions (id, user_id, title)
     VALUES ($1, $2, $3)
     ON CONFLICT (id) DO NOTHING`,
    [sessionId, demoUserId, 'Q3 Cross-Modal Financial & Architecture Synthesis']
  );

  const assistantReply = `### Executive Cross-Modal Synthesis

Upon cross-referencing **Q3 Financial Performance Audit (PDF)**, **Q3 Revenue Breakdown Chart (SVG)**, and the **Executive Earnings Call Transcript (TXT)**, all figures demonstrate **100% mathematical fidelity and strategic alignment** across modalities:

#### 1. Revenue Reconciliation Matrix
| Metric / Segment | Document Audit | Visual Chart | Audio Transcript | Verification Status |
| :--- | :--- | :--- | :--- | :--- |
| **Gross Revenue** | **$48.2M** (+18% YoY) | **$48.2M** ($28.4M + $14.1M + $5.7M) | Referenced | **Verified Consistently** |
| **SaaS Segment** | Included in Total | **$28.4M** (Largest segment) | CFO Marcus Vance: "$28.4M in APAC" | **Direct Match** |
| **Operating Cash Flow**| **$15.8M** | N/A (P&L focus) | CFO Marcus Vance: "$15.8M in cash" | **Direct Match** |
| **EBITDA Margin** | **26.4%** | N/A | "Stabilized nicely at 26.4%" | **Direct Match** |

#### 2. Key Strategic Insights
* **Reinvestment of Infrastructure Efficiency**: The transcript notes a **14% decrease** in infrastructure costs following Kubernetes migration ($3.2M reallocated to AI fine-tuning), directly supporting the sustained **26.4% EBITDA margin** noted in the formal audit report.
* **Geographic Driver**: The chart displays the **$28.4M SaaS share**, while the audio transcript specifies that **APAC enterprise contracts** were the primary regional catalyst.

#### 3. Recommended Actions
1. Validate whether the $3.2M AI model investment is capitalized or expensed under the reported $12.1M R&D line item.
2. Monitor APAC expansion to ensure SLA compliance as volume scales.`;

  await pg.query(
    `INSERT INTO chat_messages (id, session_id, user_id, sender, content, attached_asset_ids)
     VALUES 
     ($1, $2, $3, 'user', $4, $5),
     ($6, $2, $3, 'assistant', $7, $5)
     ON CONFLICT (id) DO NOTHING`,
    [
      'msg_0192a83e_001',
      sessionId,
      demoUserId,
      'Compare the financial figures in the Q3 Financial Performance Audit with the Revenue Breakdown Chart and the Executive Call transcript. Are there any discrepancies or key strategic alignments?',
      JSON.stringify(['ast_doc_0192a83e_001', 'ast_img_0192a83e_002', 'ast_txt_0192a83e_003']),
      'msg_0192a83e_002',
      assistantReply
    ]
  );
}
