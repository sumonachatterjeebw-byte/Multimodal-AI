import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Music,
  Video as VideoIcon,
  FileCode,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles
} from 'lucide-react';
import { apiAssets } from '../services/api.ts';
import { MediaAsset } from '../types/index.ts';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssetUploaded: (asset: MediaAsset) => void;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  onAssetUploaded,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successAsset, setSuccessAsset] = useState<MediaAsset | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileProcess = async (file: File) => {
    setError(null);
    setSuccessAsset(null);
    setUploading(true);

    try {
      const res = await apiAssets.upload(file);
      setSuccessAsset(res.asset);
      onAssetUploaded(res.asset);
    } catch (err: any) {
      setError(err.message || 'File upload and analysis failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileProcess(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Unified Multimodal Ingestion</h3>
              <p className="text-xs text-slate-400">
                Automatic OCR, speech-to-text, and Gemini 2.5 Flash structured extraction
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="mt-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {successAsset ? (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Asset Ingested & Analyzed Successfully!</span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-200">{successAsset.originalName}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {successAsset.modality}
                  </span>
                </div>
                {successAsset.summary && (
                  <p className="text-slate-400 text-[11px] line-clamp-2 leading-relaxed">
                    {successAsset.summary}
                  </p>
                )}
                {successAsset.insights?.tags && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {successAsset.insights.tags.slice(0, 4).map((tag, i) => (
                      <span key={i} className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => setSuccessAsset(null)}
                  className="px-3 py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                >
                  Upload Another File
                </button>
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 text-xs rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => !uploading && fileInputRef.current?.click()}
              className={`relative cursor-pointer border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all ${
                isDragging
                  ? 'border-indigo-400 bg-indigo-500/10 scale-[1.01]'
                  : 'border-slate-700/80 bg-slate-950/40 hover:border-slate-600 hover:bg-slate-900/60'
              } ${uploading ? 'pointer-events-none opacity-80' : ''}`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                accept=".txt,.md,.csv,.json,.pdf,.png,.jpg,.jpeg,.webp,.gif,.svg,.mp3,.wav,.ogg,.m4a,.mp4,.webm,.mov"
              />

              {uploading ? (
                <div className="flex flex-col items-center gap-3 py-4">
                  <div className="relative">
                    <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
                    <Sparkles className="w-4 h-4 text-sky-400 absolute -top-1 -right-1 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Synthesizing & Ingesting...</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Extracting OCR tokens, audio vectors, and structured insights
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3 shadow-inner">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-slate-200">
                    Click to browse or drop your files here
                  </p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm">
                    Accepts text logs, PDF audit reports, high-res diagrams, audio recordings, and video clips up to 25MB
                  </p>
                </>
              )}
            </div>
          )}

          {/* Supported Modalities Pill Bar */}
          <div className="grid grid-cols-5 gap-2 pt-1 text-center">
            <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-800 text-[11px] text-slate-400 flex flex-col items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>PDF / Doc</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-800 text-[11px] text-slate-400 flex flex-col items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>Images</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-800 text-[11px] text-slate-400 flex flex-col items-center gap-1">
              <Music className="w-3.5 h-3.5 text-amber-400" />
              <span>Audio</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-800 text-[11px] text-slate-400 flex flex-col items-center gap-1">
              <VideoIcon className="w-3.5 h-3.5 text-pink-400" />
              <span>Video</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-800 text-[11px] text-slate-400 flex flex-col items-center gap-1">
              <FileCode className="w-3.5 h-3.5 text-purple-400" />
              <span>Text / Logs</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
