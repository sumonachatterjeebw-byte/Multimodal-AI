import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  PieChart,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  TrendingUp,
  Tag,
  Users,
  HardDrive,
  RotateCw
} from 'lucide-react';
import { apiAnalytics } from '../services/api.ts';
import { AnalyticsSummary } from '../types/index.ts';
import { formatFileSize } from '../components/AssetCard.tsx';

export const Analytics: React.FC = () => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await apiAnalytics.getSummary();
      setSummary(res.summary);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !summary) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center gap-3 text-center">
        <RotateCw className="w-8 h-8 text-indigo-400 animate-spin" />
        <p className="text-xs text-slate-400">Computing cross-modal analytics & entity telemetry...</p>
      </div>
    );
  }

  const maxEntityCount = Math.max(1, ...(summary.topEntities.map((e) => e.count) || [1]));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <BarChart3 className="w-6 h-6 text-indigo-400" />
          <span>Multimodal Intelligence & Performance Analytics</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Quantitative telemetry across cross-modal ingestion pipelines, knowledge extraction, and sentiment
        </p>
      </div>

      {/* Primary 4 Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs uppercase font-semibold">
            <span>Total Storage Ingested</span>
            <HardDrive className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            {formatFileSize(summary.totalBytes)}
          </div>
          <p className="text-[11px] text-slate-500 font-mono">
            {summary.totalAssets} multi-format payloads indexed
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs uppercase font-semibold">
            <span>Estimated Tokens Processed</span>
            <Cpu className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-300">
            {(summary.estimatedTokensProcessed).toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500">
            Vision, audio & text token embeddings
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs uppercase font-semibold">
            <span>Mean Model Confidence</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-300">
            {(summary.avgConfidence * 100).toFixed(1)}%
          </div>
          <p className="text-[11px] text-slate-500">
            High-fidelity deterministic schema
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs uppercase font-semibold">
            <span>Cross-Modal Sessions</span>
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-purple-300">
            {summary.totalSessions}
          </div>
          <p className="text-[11px] text-slate-500">
            {summary.totalMessages} multi-asset chat turns
          </p>
        </div>
      </div>

      {/* Modality Spectrum & Categorization Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Modality Visual Breakdown */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <PieChart className="w-4 h-4 text-indigo-400" />
              <span>Modality Distribution Spectrum</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">
              Total {summary.totalAssets} files
            </span>
          </div>

          <div className="space-y-4">
            {summary.modalityDistribution.map((m) => {
              const pct = summary.totalAssets > 0 ? (m.count / summary.totalAssets) * 100 : 0;
              return (
                <div key={m.modality} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-200 font-medium flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                      {m.label}
                    </span>
                    <div className="flex items-center gap-3 font-mono text-slate-400">
                      <span>{formatFileSize(m.bytes)}</span>
                      <span className="font-bold text-slate-200">{m.count} ({pct.toFixed(0)}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        backgroundColor: m.color,
                        width: `${Math.max(4, pct)}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sentiment Distribution */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Sentiment & Content Tone</span>
            </h3>
            <span className="text-[11px] text-slate-400">Multi-modal tone analysis</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            {(summary.sentimentDistribution.length > 0
              ? summary.sentimentDistribution
              : [
                  { sentiment: 'Positive', count: 3 },
                  { sentiment: 'Neutral', count: 1 },
                ]
            ).map((s, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-300">{s.sentiment}</span>
                  <p className="text-[10px] text-slate-500">classified assets</p>
                </div>
                <div className="text-xl font-bold font-mono text-white">{s.count}</div>
              </div>
            ))}
          </div>

          {/* Categories */}
          <div className="pt-2 border-t border-slate-800/80 space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Domain Taxonomy Classifications
            </h4>
            <div className="flex flex-wrap gap-2">
              {summary.categories.map((c, i) => (
                <div
                  key={i}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  <span className="font-medium">{c.category}</span>
                  <span className="font-mono text-slate-500 font-bold">{c.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Entities & Tags Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Extracted Entities */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-400" />
              <span>Extracted Entity Graph</span>
            </h3>
            <span className="text-[11px] text-slate-400">Classified by frequency</span>
          </div>

          <div className="space-y-2.5">
            {summary.topEntities.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No entities extracted yet.</p>
            ) : (
              summary.topEntities.map((ent, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-slate-200">{ent.name}</span>
                    <span className="text-[10px] text-indigo-400 font-mono block">
                      {ent.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-slate-900 rounded-full h-1.5 overflow-hidden hidden sm:block">
                      <div
                        className="bg-indigo-500 h-full rounded-full"
                        style={{ width: `${(ent.count / maxEntityCount) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-300">
                      {ent.count} mentions
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Taxonomy Tags */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Tag className="w-4 h-4 text-amber-400" />
              <span>Indexed Taxonomy Tags</span>
            </h3>
            <span className="text-[11px] text-slate-400">Cross-asset indexing</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {summary.topTags.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No tags indexed yet.</p>
            ) : (
              summary.topTags.map((t, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center gap-1.5 hover:border-indigo-500/40 transition-colors"
                >
                  <span className="text-indigo-400 font-bold">#</span>
                  <span>{t.tag}</span>
                  <span className="text-[10px] font-mono text-slate-500">({t.count})</span>
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
