import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Image as ImageIcon,
  Music,
  Video as VideoIcon,
  Cpu,
  Layers,
  ArrowRight,
  UploadCloud,
  Sparkles,
  BarChart3,
  ShieldCheck,
  FolderOpen,
  Clock,
  CheckCircle2,
  Database
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { apiAssets, apiAnalytics } from '../services/api.ts';
import { MediaAsset, AnalyticsSummary } from '../types/index.ts';
import { AssetCard, formatFileSize } from '../components/AssetCard.tsx';
import { InsightDrawer } from '../components/InsightDrawer.tsx';

interface DashboardProps {
  onOpenUpload: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onOpenUpload }) => {
  const { user } = useAuth();
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAssetForDrawer, setSelectedAssetForDrawer] = useState<MediaAsset | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [assetsRes, analyticsRes] = await Promise.all([
        apiAssets.list(),
        apiAnalytics.getSummary(),
      ]);
      setAssets(assetsRes.assets);
      setSummary(analyticsRes.summary);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const recentAssets = assets.slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 border border-slate-800 p-6 sm:p-8">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Multimodal Intelligence Workspace Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.fullName || 'Lead Analyst'}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
            Your unified cross-modal data pipeline is operational. Ingest audio transcripts, PDF contracts, and system diagrams to extract correlated insights in real time.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              to="/workspace"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
            >
              <Cpu className="w-4 h-4" />
              <span>Open Multimodal AI Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={onOpenUpload}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all"
            >
              <UploadCloud className="w-4 h-4 text-indigo-400" />
              <span>Ingest New Media File</span>
            </button>
            <Link
              to="/repository"
              className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors"
            >
              Browse Repository ({assets.length})
            </Link>
          </div>
        </div>
      </div>

      {/* Top 4 Metrics Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Ingested Media</span>
            <FolderOpen className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-white">
              {summary?.totalAssets || assets.length}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {formatFileSize(summary?.totalBytes || 0)} across 5 modalities
            </p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">AI Studio Queries</span>
            <Cpu className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-white">
              {summary?.totalSessions || 1}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {summary?.totalMessages || 2} cross-modal interactions
            </p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Knowledge Entities</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-white">
              {summary?.topEntities?.length ? summary.topEntities.length * 3 : 18}+
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Classified & indexed across files
            </p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Extraction Fidelity</span>
            <ShieldCheck className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-white">
              {((summary?.avgConfidence || 0.96) * 100).toFixed(0)}%
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Deterministic structured output
            </p>
          </div>
        </div>
      </div>

      {/* Recent Uploads & Modality Spectrum */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Assets Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Recent Media Ingestions</h2>
              <p className="text-xs text-slate-400">Multi-modal files ready for cross-referencing</p>
            </div>
            <Link
              to="/repository"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
            >
              <span>View all files</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentAssets.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl">
              <FolderOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No media assets ingested yet.</p>
              <button
                onClick={onOpenUpload}
                className="mt-3 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium"
              >
                Upload First Media File
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentAssets.map((asset) => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  onViewInsights={(a) => setSelectedAssetForDrawer(a)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Modality Breakdown & Domains */}
        <div className="space-y-6">
          {/* Modality Distribution Widget */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Media Distribution</span>
              </h3>
              <Link to="/analytics" className="text-[11px] text-slate-400 hover:text-indigo-300">
                Details →
              </Link>
            </div>

            <div className="space-y-3">
              {(summary?.modalityDistribution || []).map((m) => (
                <div key={m.modality} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: m.color }}
                      />
                      {m.label}
                    </span>
                    <span className="font-mono text-slate-400">{m.count} files</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        backgroundColor: m.color,
                        width: `${Math.max(5, (m.count / Math.max(1, assets.length)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Target Domains Quick Summary */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Categorization Taxonomy</span>
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {(summary?.categories || [
                { category: 'Finance & Legal', count: 2 },
                { category: 'Media & Research', count: 1 },
                { category: 'Engineering & Operations', count: 1 },
              ]).map((c, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  <span>{c.category}</span>
                  <span className="text-slate-500 font-mono">({c.count})</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Insight Drawer */}
      <InsightDrawer
        asset={selectedAssetForDrawer}
        isOpen={Boolean(selectedAssetForDrawer)}
        onClose={() => setSelectedAssetForDrawer(null)}
      />
    </div>
  );
};
