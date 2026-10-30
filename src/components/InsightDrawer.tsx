import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Download,
  Copy,
  Check,
  Tag,
  BarChart2,
  Users,
  ShieldCheck,
  FileText,
  RotateCw,
  ExternalLink
} from 'lucide-react';
import { MediaAsset } from '../types/index.ts';
import { getModalityIcon, getModalityBadge, formatFileSize } from './AssetCard.tsx';
import { apiAi } from '../services/api.ts';

interface InsightDrawerProps {
  asset: MediaAsset | null;
  isOpen: boolean;
  onClose: () => void;
  onAssetUpdated?: (updated: MediaAsset) => void;
}

export const InsightDrawer: React.FC<InsightDrawerProps> = ({
  asset,
  isOpen,
  onClose,
  onAssetUpdated,
}) => {
  const [copied, setCopied] = useState(false);
  const [reanalyzing, setReanalyzing] = useState(false);

  if (!isOpen || !asset) return null;

  const handleCopyText = () => {
    if (asset.extractedText) {
      navigator.clipboard.writeText(asset.extractedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(asset, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${asset.originalName.replace(/\.[^/.]+$/, '')}_insights.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleReanalyze = async () => {
    setReanalyzing(true);
    try {
      const res = await apiAi.analyzeAsset(asset.id);
      if (onAssetUpdated) {
        onAssetUpdated({
          ...asset,
          summary: res.insight.summary,
          category: res.insight.category,
          extractedText: res.insight.extractedTextSnippet || asset.extractedText,
          insights: res.insight
        });
      }
    } catch (err) {
      console.error('Re-analysis error:', err);
    } finally {
      setReanalyzing(false);
    }
  };

  const insights = asset.insights;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Extracted Intelligence</h3>
              <p className="text-[11px] text-slate-400">Structured multimodal synthesis</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleExportJson}
              title="Export Insights JSON"
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Asset Info Card */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                {getModalityIcon(asset.modality, 'w-5 h-5')}
                <h4 className="text-xs font-bold text-white break-all">{asset.originalName}</h4>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider shrink-0 ${getModalityBadge(asset.modality)}`}>
                {asset.modality}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
              <div>
                <span className="text-slate-500">Domain Taxonomy:</span>{' '}
                <span className="text-slate-300 font-medium">{asset.category || 'General'}</span>
              </div>
              <div>
                <span className="text-slate-500">Size:</span>{' '}
                <span className="text-slate-300 font-medium">{formatFileSize(asset.fileSize)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800/80">
              <button
                onClick={handleReanalyze}
                disabled={reanalyzing}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-colors"
              >
                <RotateCw className={`w-3 h-3 ${reanalyzing ? 'animate-spin text-indigo-400' : ''}`} />
                <span>{reanalyzing ? 'Re-analyzing...' : 'Re-run Gemini'}</span>
              </button>
              {asset.storagePath && (
                <a
                  href={asset.storagePath}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-[11px] font-medium transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Open Raw File</span>
                </a>
              )}
            </div>
          </div>

          {/* Executive Summary */}
          <div>
            <h5 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>Executive Summary</span>
            </h5>
            <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              {asset.summary || 'Summary is being processed.'}
            </div>
          </div>

          {/* Key Metrics Table */}
          {insights?.keyMetrics && insights.keyMetrics.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Extracted Key Metrics</span>
              </h5>
              <div className="rounded-xl border border-slate-800 bg-slate-950/50 overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-800/60 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="px-3 py-2 font-medium">Metric Dimension</th>
                      <th className="px-3 py-2 font-medium">Observed Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {insights.keyMetrics.map((km, i) => (
                      <tr key={i} className="hover:bg-slate-800/30">
                        <td className="px-3 py-2 text-slate-300">{km.metric}</td>
                        <td className="px-3 py-2 font-mono font-medium text-emerald-300">{km.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Extracted Entities */}
          {insights?.entities && insights.entities.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-sky-400" />
                <span>Extracted Entities</span>
              </h5>
              <div className="grid grid-cols-2 gap-2">
                {insights.entities.map((ent, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800 flex flex-col justify-between">
                    <span className="text-xs font-semibold text-slate-200 truncate">{ent.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono mt-0.5">{ent.category}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sentiment & Confidence Gauge */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
              <span className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Confidence Score</span>
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold text-white">
                  {((insights?.confidenceScore ?? 0.95) * 100).toFixed(0)}%
                </span>
                <span className="text-[10px] text-slate-500">model certainty</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
              <span className="text-[11px] text-slate-400 mb-1 block">Sentiment</span>
              <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                insights?.sentiment === 'Positive'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : insights?.sentiment === 'Negative'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}>
                {insights?.sentiment || 'Neutral'}
              </span>
            </div>
          </div>

          {/* Taxonomy Tags */}
          {insights?.tags && insights.tags.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-400" />
                <span>Taxonomy Tags</span>
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {insights.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Extracted Raw OCR / Transcript Snippet */}
          {asset.extractedText && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  Raw Content / OCR / Transcript
                </h5>
                <button
                  onClick={handleCopyText}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy Text'}</span>
                </button>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 max-h-48 overflow-y-auto font-mono text-[11px] text-slate-300 leading-relaxed whitespace-pre-wrap">
                {asset.extractedText}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
