import { Response } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { query } from '../config/db.js';
import { processAssetWithGemini } from './ai.controller.js';

function determineModality(mimeType: string, filename: string): 'text' | 'image' | 'audio' | 'video' | 'document' {
  const ext = path.extname(filename).toLowerCase();
  if (mimeType === 'application/pdf' || ext === '.pdf') {
    return 'document';
  }
  if (mimeType.startsWith('image/') || ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'].includes(ext)) {
    return 'image';
  }
  if (mimeType.startsWith('audio/') || ['.mp3', '.wav', '.ogg', '.m4a', '.aac'].includes(ext)) {
    return 'audio';
  }
  if (mimeType.startsWith('video/') || ['.mp4', '.webm', '.mov', '.mkv'].includes(ext)) {
    return 'video';
  }
  return 'text';
}

export const uploadAsset = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded or file rejected by validator.' });
    }

    const { originalname, filename, mimetype, size, path: storagePath } = req.file;
    const modality = determineModality(mimetype, originalname);
    const assetId = `ast_${crypto.randomUUID()}`;

    // Insert media asset
    await query(
      `INSERT INTO media_assets (id, user_id, file_name, original_name, mime_type, file_size, modality, storage_path, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
      [assetId, req.user!.id, filename, originalname, mimetype, size, modality, storagePath]
    );

    // Automatically invoke Gemini extraction
    let insight = null;
    try {
      insight = await processAssetWithGemini(assetId, req.user!.id);
    } catch (err: any) {
      console.warn('Auto-extraction non-fatal error during upload:', err.message);
    }

    // Fetch the complete saved asset
    const saved = await query(
      `SELECT a.id, a.file_name, a.original_name, a.mime_type, a.file_size, a.modality, a.storage_path, a.extracted_text, a.summary, a.category, a.created_at,
              i.entities, i.key_metrics, i.tags, i.sentiment, i.confidence_score
       FROM media_assets a
       LEFT JOIN asset_insights i ON i.asset_id = a.id
       WHERE a.id = $1`,
      [assetId]
    );

    const assetRow = saved.rows[0];
    return res.status(201).json({
      message: 'Asset uploaded and processed successfully',
      asset: {
        id: assetRow.id,
        fileName: assetRow.file_name,
        originalName: assetRow.original_name,
        mimeType: assetRow.mime_type,
        fileSize: Number(assetRow.file_size),
        modality: assetRow.modality,
        storagePath: `/uploads/${path.basename(assetRow.storage_path)}`,
        extractedText: assetRow.extracted_text,
        summary: assetRow.summary,
        category: assetRow.category,
        createdAt: assetRow.created_at,
        insights: assetRow.entities ? {
          entities: typeof assetRow.entities === 'string' ? JSON.parse(assetRow.entities) : assetRow.entities,
          keyMetrics: typeof assetRow.key_metrics === 'string' ? JSON.parse(assetRow.key_metrics) : assetRow.key_metrics,
          tags: typeof assetRow.tags === 'string' ? JSON.parse(assetRow.tags) : assetRow.tags,
          sentiment: assetRow.sentiment,
          confidenceScore: assetRow.confidence_score ? Number(assetRow.confidence_score) : 0.95
        } : insight
      }
    });
  } catch (error: any) {
    console.error('Asset upload failure:', error);
    return res.status(500).json({ error: 'Asset upload failed: ' + (error.message || 'Internal error') });
  }
};

export const listAssets = async (req: AuthRequest, res: Response) => {
  try {
    const { search, modality, category } = req.query;

    let sql = `
      SELECT a.id, a.file_name, a.original_name, a.mime_type, a.file_size, a.modality, a.storage_path, a.extracted_text, a.summary, a.category, a.created_at,
             i.entities, i.key_metrics, i.tags, i.sentiment, i.confidence_score
      FROM media_assets a
      LEFT JOIN asset_insights i ON i.asset_id = a.id
      WHERE a.user_id = $1
    `;
    const params: any[] = [req.user!.id];

    if (modality && modality !== 'all') {
      params.push(modality);
      sql += ` AND a.modality = $${params.length}`;
    }

    if (category && category !== 'all') {
      params.push(category);
      sql += ` AND a.category = $${params.length}`;
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      params.push(`%${search.trim().toLowerCase()}%`);
      sql += ` AND (LOWER(a.original_name) LIKE $${params.length} OR LOWER(COALESCE(a.summary, '')) LIKE $${params.length} OR LOWER(COALESCE(a.extracted_text, '')) LIKE $${params.length})`;
    }

    sql += ` ORDER BY a.created_at DESC`;

    const result = await query(sql, params);

    const assets = result.rows.map(row => ({
      id: row.id,
      fileName: row.file_name,
      originalName: row.original_name,
      mimeType: row.mime_type,
      fileSize: Number(row.file_size),
      modality: row.modality,
      storagePath: `/uploads/${path.basename(row.storage_path)}`,
      extractedText: row.extracted_text,
      summary: row.summary,
      category: row.category,
      createdAt: row.created_at,
      insights: row.entities ? {
        entities: typeof row.entities === 'string' ? JSON.parse(row.entities) : row.entities,
        keyMetrics: typeof row.key_metrics === 'string' ? JSON.parse(row.key_metrics) : row.key_metrics,
        tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags,
        sentiment: row.sentiment,
        confidenceScore: row.confidence_score ? Number(row.confidence_score) : 0.95
      } : null
    }));

    return res.json({ assets });
  } catch (error: any) {
    console.error('List assets failure:', error);
    return res.status(500).json({ error: 'Failed to list assets' });
  }
};

export const getAssetById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT a.id, a.file_name, a.original_name, a.mime_type, a.file_size, a.modality, a.storage_path, a.extracted_text, a.summary, a.category, a.created_at,
              i.entities, i.key_metrics, i.tags, i.sentiment, i.confidence_score
       FROM media_assets a
       LEFT JOIN asset_insights i ON i.asset_id = a.id
       WHERE a.id = $1 AND a.user_id = $2`,
      [id, req.user!.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Asset not found or access denied.' });
    }

    const row = result.rows[0];
    return res.json({
      asset: {
        id: row.id,
        fileName: row.file_name,
        originalName: row.original_name,
        mimeType: row.mime_type,
        fileSize: Number(row.file_size),
        modality: row.modality,
        storagePath: `/uploads/${path.basename(row.storage_path)}`,
        extractedText: row.extracted_text,
        summary: row.summary,
        category: row.category,
        createdAt: row.created_at,
        insights: row.entities ? {
          entities: typeof row.entities === 'string' ? JSON.parse(row.entities) : row.entities,
          keyMetrics: typeof row.key_metrics === 'string' ? JSON.parse(row.key_metrics) : row.key_metrics,
          tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags,
          sentiment: row.sentiment,
          confidenceScore: row.confidence_score ? Number(row.confidence_score) : 0.95
        } : null
      }
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to retrieve asset' });
  }
};

export const deleteAsset = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check ownership and find file
    const result = await query(
      'SELECT storage_path FROM media_assets WHERE id = $1 AND user_id = $2',
      [id, req.user!.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Asset not found or access denied.' });
    }

    const filePath = result.rows[0].storage_path;

    // Delete record (CASCADE removes insights automatically)
    await query('DELETE FROM media_assets WHERE id = $1 AND user_id = $2', [id, req.user!.id]);

    // Unlink physical file safely if exists
    try {
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (fsErr) {
      console.warn('Physical file cleanup notice:', fsErr);
    }

    return res.json({ message: 'Media asset deleted successfully', assetId: id });
  } catch (error: any) {
    console.error('Delete asset failure:', error);
    return res.status(500).json({ error: 'Failed to delete asset' });
  }
};
