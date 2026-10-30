import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { query } from '../config/db.js';

export const getSummary = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // 1. Total assets and total storage
    const totalsRes = await query(
      `SELECT COUNT(*)::int as total_assets, COALESCE(SUM(file_size), 0)::bigint as total_bytes
       FROM media_assets
       WHERE user_id = $1`,
      [userId]
    );
    const totalAssets = totalsRes.rows[0]?.total_assets || 0;
    const totalBytes = Number(totalsRes.rows[0]?.total_bytes || 0);

    // 2. Modality breakdown
    const modalityRes = await query(
      `SELECT modality, COUNT(*)::int as count, COALESCE(SUM(file_size), 0)::bigint as bytes
       FROM media_assets
       WHERE user_id = $1
       GROUP BY modality`,
      [userId]
    );

    const modalityDistribution = [
      { modality: 'document', label: 'PDF & Documents', count: 0, bytes: 0, color: '#3b82f6' },
      { modality: 'image', label: 'Images & Diagrams', count: 0, bytes: 0, color: '#10b981' },
      { modality: 'audio', label: 'Audio & Recordings', count: 0, bytes: 0, color: '#f59e0b' },
      { modality: 'video', label: 'Video Streams', count: 0, bytes: 0, color: '#ec4899' },
      { modality: 'text', label: 'Text & Transcripts', count: 0, bytes: 0, color: '#8b5cf6' },
    ];

    for (const row of modalityRes.rows) {
      const match = modalityDistribution.find(m => m.modality === row.modality);
      if (match) {
        match.count = row.count;
        match.bytes = Number(row.bytes);
      }
    }

    // 3. Category breakdown
    const categoryRes = await query(
      `SELECT COALESCE(category, 'General') as category, COUNT(*)::int as count
       FROM media_assets
       WHERE user_id = $1
       GROUP BY category`,
      [userId]
    );

    // 4. Sentiment and confidence
    const sentimentRes = await query(
      `SELECT sentiment, COUNT(*)::int as count
       FROM asset_insights
       WHERE user_id = $1 AND sentiment IS NOT NULL
       GROUP BY sentiment`,
      [userId]
    );

    const avgConfidenceRes = await query(
      `SELECT COALESCE(AVG(confidence_score), 0.95)::numeric(3,2) as avg_score
       FROM asset_insights
       WHERE user_id = $1`,
      [userId]
    );

    // 5. Aggregate entities and tags
    const insightsRes = await query(
      `SELECT entities, tags FROM asset_insights WHERE user_id = $1`,
      [userId]
    );

    const entityFrequency: Record<string, { count: number; category: string }> = {};
    const tagFrequency: Record<string, number> = {};

    for (const row of insightsRes.rows) {
      const entities = typeof row.entities === 'string' ? JSON.parse(row.entities || '[]') : (row.entities || []);
      const tags = typeof row.tags === 'string' ? JSON.parse(row.tags || '[]') : (row.tags || []);

      if (Array.isArray(entities)) {
        for (const ent of entities) {
          if (ent && ent.name) {
            const key = ent.name.trim();
            if (!entityFrequency[key]) {
              entityFrequency[key] = { count: 0, category: ent.category || 'General' };
            }
            entityFrequency[key].count += 1;
          }
        }
      }

      if (Array.isArray(tags)) {
        for (const tag of tags) {
          if (tag) {
            const t = tag.trim().toLowerCase();
            tagFrequency[t] = (tagFrequency[t] || 0) + 1;
          }
        }
      }
    }

    const topEntities = Object.entries(entityFrequency)
      .map(([name, data]) => ({ name, count: data.count, category: data.category }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const topTags = Object.entries(tagFrequency)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 6. Query Sessions count
    const chatStatsRes = await query(
      `SELECT COUNT(*)::int as total_sessions,
              (SELECT COUNT(*)::int FROM chat_messages WHERE user_id = $1) as total_messages
       FROM chat_sessions WHERE user_id = $1`,
      [userId]
    );

    return res.json({
      summary: {
        totalAssets,
        totalBytes,
        totalSessions: chatStatsRes.rows[0]?.total_sessions || 0,
        totalMessages: chatStatsRes.rows[0]?.total_messages || 0,
        avgConfidence: Number(avgConfidenceRes.rows[0]?.avg_score || 0.95),
        estimatedTokensProcessed: Math.max(12000, totalAssets * 4200),
        modalityDistribution,
        categories: categoryRes.rows,
        sentimentDistribution: sentimentRes.rows,
        topEntities,
        topTags,
      }
    });
  } catch (error: any) {
    console.error('Analytics summary failure:', error);
    return res.status(500).json({ error: 'Failed to compute analytics summary' });
  }
};
