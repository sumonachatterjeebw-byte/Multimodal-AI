import React, { useState } from 'react';
import { Layers, Check, X, Search, Filter, Sparkles, FileText, Download } from 'lucide-react';
import { MediaAsset, ModalityType } from '../types/index.ts';
import { getModalityIcon } from './AssetCard.tsx';

interface ContextSelectorProps {
  assets: MediaAsset[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onClearSelection: () => void;
  onSelectAll: () => void;
  onSynthesizeReport: () => void;
}

export const ContextSelector: React.FC<ContextSelectorProps> = ({
  assets,
  selectedIds,
  onToggleSelect,
  onClearSelection,
  onSelectAll,
  onSynthesizeReport,
}) => {
  const [filterModality, setFilterModality] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  const filtered = assets.filter((asset) => {
    const matchesMod = filterModality === 'all' || asset.modality === filterModality;
    const matchesSearch =
      asset.originalName.toLowerCase().includes(search.toLowerCase()) ||
      (asset.category && asset.category.toLowerCase().includes(search.toLowerCase()));
    return matchesMod && matchesSearch;
  });

  const modalities: Array<{ id: string; label: string }> = [
    { id: 'all', label: 'All Files' },
    { id: 'document', label: 'PDF/Docs' },
    { id: 'image', label: 'Images' },
    { id: 'audio', label: 'Audio' },
    { id: 'text', label: 'Text/Logs' },
  ];

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3 shadow-xl">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Layers className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Active Multi-File Context
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-600/30 text-indigo-300 font-semibold border border-indigo-500/30">
            {selectedIds.length} attached
          </span>
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <>
              <button
                onClick={onSynthesizeReport}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Synthesize Report</span>
              </button>
              <button
                onClick={onClearSelection}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              >
                Clear
              </button>
            </>
          )}
          {selectedIds.length < assets.length && (
            <button
              onClick={onSelectAll}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              Select All
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
          {modalities.map((m) => (
            <button
              key={m.id}
              onClick={() => setFilterModality(m.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap ${
                filterModality === m.id
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[160px]">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search context..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Horizontal Multi-File Pill Picker */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-thin">
        {filtered.length === 0 ? (
          <span className="text-xs text-slate-500 py-1 italic">No media assets match current filter.</span>
        ) : (
          filtered.map((asset) => {
            const isSelected = selectedIds.includes(asset.id);
            return (
              <button
                key={asset.id}
                onClick={() => onToggleSelect(asset.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 border transition-all ${
                  isSelected
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm shadow-indigo-500/20'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center ${
                    isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-transparent border border-slate-700'
                  }`}
                >
                  <Check className="w-3 h-3" />
                </div>
                {getModalityIcon(asset.modality, 'w-3.5 h-3.5')}
                <span className="max-w-[150px] truncate">{asset.originalName}</span>
                <span className="text-[10px] text-slate-500 uppercase">{asset.modality}</span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
