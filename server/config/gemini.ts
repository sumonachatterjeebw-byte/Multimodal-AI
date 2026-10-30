import { GoogleGenAI, Type } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';

if (!apiKey) {
  console.warn('⚠️ WARNING: GEMINI_API_KEY environment variable is not set yet. Mock/fallback processing will be available until configured in Secrets.');
}

export const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Primary model for high-throughput multimodal intelligence
export const GEMINI_MODEL = 'gemini-2.5-flash';

export const SYSTEM_INSTRUCTION = `You are OmniSight Core, an advanced Multimodal AI Intelligence System. Your objective is to perform rigorous cross-modal analysis across text, vision, audio transcripts, PDF documents, and structured media data. You must carefully synthesize facts, verify discrepancies across file types, extract key data points with high fidelity, and deliver clear, actionable responses formatted in clean Markdown.`;

export const EXTRACT_INSIGHTS_PROMPT = `
Analyze the attached media content carefully. Extract key structural insights into the exact JSON format specified by the schema.

Requirements:
1. Provide a concise 2-3 sentence executive summary.
2. Identify all relevant entities (People, Organizations, Quantities, Technical Terms).
3. Extract key metrics (Numerical data, percentages, currency amounts, dates).
4. Assign 3-5 relevant taxonomy tags.
5. Provide a sentiment classification (Positive, Neutral, Negative, or Mixed) and an overall confidence score between 0.00 and 1.00.
6. Determine the most accurate target domain category among:
   - "Finance & Legal"
   - "Healthcare & Life Sciences"
   - "Engineering & Operations"
   - "Media & Research"
   - "General"
`;

export const assetInsightsJsonSchema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING },
    category: {
      type: Type.STRING,
      enum: [
        'Finance & Legal',
        'Healthcare & Life Sciences',
        'Engineering & Operations',
        'Media & Research',
        'General'
      ]
    },
    extractedTextSnippet: {
      type: Type.STRING,
      description: 'Extracted raw OCR text, transcript, or essential content excerpt.'
    },
    entities: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          category: { type: Type.STRING }
        },
        required: ['name', 'category']
      }
    },
    keyMetrics: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          metric: { type: Type.STRING },
          value: { type: Type.STRING }
        },
        required: ['metric', 'value']
      }
    },
    tags: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    sentiment: {
      type: Type.STRING,
      enum: ['Positive', 'Neutral', 'Negative', 'Mixed']
    },
    confidenceScore: { type: Type.NUMBER }
  },
  required: ['summary', 'category', 'entities', 'keyMetrics', 'tags', 'sentiment', 'confidenceScore']
};
