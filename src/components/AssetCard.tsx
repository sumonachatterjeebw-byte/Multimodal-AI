import React from 'react';
import {
  FileText,
  Image as ImageIcon,
  Music,
  Video as VideoIcon,
  FileCode,
  Sparkles,
  Trash2,
  ExternalLink,
  Plus,
  Check,
  Calendar,
  Layers
} from 'lucide-react';
import { MediaAsset, ModalityType } from '../types/index.ts';

interface AssetCardProps {
  asset: MediaAsset;
  isSelected?: boolean;
  onToggleSelect?: (assetId: string) => void;
  onViewInsights: (asset: MediaAsset) => void;
  onDelete?: (assetId: string) => void;
}

export const getModalityIcon = (modality: ModalityType, className = 'w-4 h-4') => {
  switch (modality) {
    case 'document':
      return <FileText className={`${className} text-blue-400`} />;
    case 'image':
      return <ImageIcon className={`${className} text-emerald-400`} />;
    case 'audio':
      return <Music className={`${className} text-amber-400`} />;
    case 'video':
      return <VideoIcon className={`${className} text-pink-400`} />;
    case 'text':
    default:
      return <FileCode className={`${className} text-purple-400`} />;
  }
};

export const getModalityBadge = (modality: ModalityType) => {
  switch (modality) {
    case 'document':
      return 'bg-blue-500/10 text-blue-300 border-blue-500/30';
    case 'image':
      return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
    case 'audio':
      return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
    case 'video':
      return 'bg-pink-500/10 text-pink-300 border-pink-500/30';
    case 'text':
    default:
      return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
  }
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const AssetCard: React.FC<AssetCardProps> = ({
  asset,
  isSelected,
  onToggleSelect,
  onViewInsights,
  onDelete,
}) => {
  const isImage = asset.modality === 'image';

  return (
    <div
      className={`group relative rounded-xl border transition-all duration-200 flex flex-col justify-between overflow-hidden bg-slate-900/70 hover:bg-slate-900 hover:shadow-xl hover:shadow-indigo-950/30 ${
        isSelected
          ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-950/20'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Top Banner / Preview */}
      <div className="relative h-28 bg-slate-950/70 border-b border-slate-800/80 flex items-center justify-center overflow-hidden">
        {isImage && asset.storagePath ? (
          <img
            src={asset.storagePath}
            alt={asset.originalName}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="flex flex-col items-center gap-2 p-4 text-center">
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 shadow-inner group-hover:scale-110 transition-transform">
              {getModalityIcon(asset.modality, 'w-6 h-6')}
            </div>
            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
              {asset.mimeType.split('/')[1] || asset.modality}
            </span>
          </div>
        )}

        {/* Modality Tag */}
        <div className="absolute top-2.5 left-2.5">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${getModalityBadge(
              asset.modality
            )}`}
          >
            {asset.modality}
          </span>
        </div>

        {/* Selection Checkbox / Toggle */}
        {onToggleSelect && (
          <button
            onClick={() => onToggleSelect(asset.id)}
            title={isSelected ? 'Remove from Context' : 'Add to Context'}
            className={`absolute top-2.5 right-2.5 w-6 h-6 rounded-md flex items-center justify-center transition-all ${
              isSelected
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/40'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500'
            }`}
          >
            {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h4
              className="text-xs font-semibold text-slate-100 line-clamp-1 hover:text-indigo-300 cursor-pointer transition-colors"
              onClick={() => onViewInsights(asset)}
              title={asset.originalName}
            >
              {asset.originalName}
            </h4>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-2.5">
            <span>{formatFileSize(asset.fileSize)}</span>
            <span>•</span>
            <span className="text-slate-300 font-medium">{asset.category || 'General'}</span>
          </div>

          {asset.summary && (
            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
              {asset.summary}
            </p>
          )}

          {/* Extracted Entities or Key Metrics Tag Pills */}
          {asset.insights && asset.insights.keyMetrics && asset.insights.keyMetrics.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {asset.insights.keyMetrics.slice(0, 2).map((km, i) => (
                <span
                  key={i}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800/80 border border-slate-700/60 text-slate-300"
                >
                  <strong className="text-indigo-300">{km.metric}:</strong> {km.value}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <button
            onClick={() => onViewInsights(asset)}
            className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Structured Insights</span>
          </button>

          <div className="flex items-center gap-1.5">
            {asset.storagePath && (
              <a
                href={asset.storagePath}
                target="_blank"
                rel="noreferrer"
                title="View original file"
                className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(asset.id)}
                title="Delete asset"
                className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
