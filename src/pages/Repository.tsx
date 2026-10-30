import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  UploadCloud,
  Layers,
  Sparkles,
  Trash2,
  ExternalLink,
  LayoutGrid,
  List,
  AlertCircle,
  FileText,
  RotateCw
} from 'lucide-react';
import { apiAssets } from '../services/api.ts';
import { MediaAsset } from '../types/index.ts';
import { AssetCard, getModalityIcon, getModalityBadge, formatFileSize } from '../components/AssetCard.tsx';
import { InsightDrawer } from '../components/InsightDrawer.tsx';
import { FileUploadModal } from '../components/FileUploadModal.tsx';

export const Repository: React.FC<{ onOpenUpload?: () => void }> = () => {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedModality, setSelectedModality] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedAssetForDrawer, setSelectedAssetForDrawer] = useState<MediaAsset | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAssets();
  }, [search, selectedModality, selectedCategory]);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const res = await apiAssets.list({
        search,
        modality: selectedModality,
        category: selectedCategory,
      });
      setAssets(res.assets);
    } catch (err) {
      console.error('Failed to fetch assets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (assetId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this media asset and its structured insights?')) {
      return;
    }

    try {
      setDeletingId(assetId);
      await apiAssets.delete(assetId);
      setAssets((prev) => prev.filter((a) => a.id !== assetId));
      if (selectedAssetForDrawer?.id === assetId) {
        setSelectedAssetForDrawer(null);
      }
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const modalities = [
    { id: 'all', label: 'All Modalities' },
    { id: 'document', label: 'Documents / PDF' },
    { id: 'image', label: 'Images & Charts' },
    { id: 'audio', label: 'Audio Records' },
    { id: 'video', label: 'Video Streams' },
    { id: 'text', label: 'Text & Transcripts' },
  ];

  const categories = [
    'all',
    'Finance & Legal',
    'Healthcare & Life Sciences',
    'Engineering & Operations',
    'Media & Research',
    'General',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <span>Asset Repository & Intelligence Index</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-slate-700 font-mono">
              {assets.length} files
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse, search, and manage multimodal data assets with extracted entity graphs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all active:scale-95"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload New Media</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search across file names, summaries, OCR excerpts, transcripts..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Domain Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 hidden sm:inline">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === 'all' ? 'All Domains' : c}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Modality Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin border-t border-slate-800/80 pt-3">
          {modalities.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedModality(m.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                selectedModality === m.id
                  ? 'bg-slate-800 text-white font-semibold border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-center">
          <RotateCw className="w-8 h-8 text-indigo-400 animate-spin" />
          <p className="text-xs text-slate-400">Loading media repository...</p>
        </div>
      ) : assets.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3">
          <Layers className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No media files match your criteria</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search terms or upload a new multimodal document, audio file, or diagram.
          </p>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
          >
            Upload Media File
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {assets.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              onViewInsights={(a) => setSelectedAssetForDrawer(a)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3 font-semibold">Asset Name</th>
                <th className="px-4 py-3 font-semibold">Modality</th>
                <th className="px-4 py-3 font-semibold">Domain</th>
                <th className="px-4 py-3 font-semibold">Size</th>
                <th className="px-4 py-3 font-semibold">Confidence</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {assets.map((asset) => (
                <tr key={asset.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-200">
                    <div className="flex items-center gap-2">
                      {getModalityIcon(asset.modality, 'w-4 h-4')}
                      <span
                        className="hover:text-indigo-300 cursor-pointer max-w-xs truncate"
                        onClick={() => setSelectedAssetForDrawer(asset)}
                      >
                        {asset.originalName}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${getModalityBadge(asset.modality)}`}>
                      {asset.modality}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{asset.category || 'General'}</td>
                  <td className="px-4 py-3 text-slate-400 font-mono">{formatFileSize(asset.fileSize)}</td>
                  <td className="px-4 py-3 text-emerald-400 font-mono">
                    {((asset.insights?.confidenceScore ?? 0.95) * 100).toFixed(0)}%
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedAssetForDrawer(asset)}
                        className="px-2.5 py-1 rounded-md bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-[11px] font-medium"
                      >
                        Insights
                      </button>
                      <button
                        onClick={() => handleDelete(asset.id)}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Insight Drawer */}
      <InsightDrawer
        asset={selectedAssetForDrawer}
        isOpen={Boolean(selectedAssetForDrawer)}
        onClose={() => setSelectedAssetForDrawer(null)}
        onAssetUpdated={(updated) => {
          setAssets((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
          setSelectedAssetForDrawer(updated);
        }}
      />

      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onAssetUploaded={(newAsset) => {
          setAssets((prev) => [newAsset, ...prev]);
        }}
      />
    </div>
  );
};
