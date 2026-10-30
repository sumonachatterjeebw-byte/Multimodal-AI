import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye,
  FileText,
  Image as ImageIcon,
  Music,
  Video as VideoIcon,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  BarChart3,
  CheckCircle2,
  FolderOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

export const LandingPage: React.FC<{ onOpenUpload?: () => void }> = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const handleDemoLogin = async () => {
    try {
      await login('demo@omnisight.ai', 'password123');
      navigate('/dashboard');
    } catch {
      navigate('/auth/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-32 border-b border-slate-900">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-600/20 via-sky-500/20 to-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Next-Generation Multimodal Intelligence • Gemini 2.5 Flash</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
            Break Down Information Silos Across{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent">
              Every Media Modality
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Ingest, transcribe, cross-reference, and synthesize PDF contracts, high-resolution diagram images, audio interviews, and text logs within a unified AI intelligence workbench.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            {user ? (
              <Link
                to="/workspace"
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
              >
                <span>Enter Multimodal AI Studio</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <button
                  onClick={handleDemoLogin}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Launch Live Demo (1-Click)</span>
                </button>
                <Link
                  to="/auth/login"
                  className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-sm font-semibold transition-all hover:border-slate-600"
                >
                  Sign In to Enterprise Workspace
                </Link>
              </>
            )}
          </div>

          {/* Modalities Pill Badge Showcase */}
          <div className="mt-14 max-w-3xl mx-auto p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
            <div className="flex items-center justify-center gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800">
              <FileText className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-medium text-slate-300">PDF Documents</span>
            </div>
            <div className="flex items-center justify-center gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800">
              <ImageIcon className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-medium text-slate-300">Vision & Charts</span>
            </div>
            <div className="flex items-center justify-center gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800">
              <Music className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-medium text-slate-300">Audio Records</span>
            </div>
            <div className="flex items-center justify-center gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800">
              <VideoIcon className="w-4 h-4 text-pink-400" />
              <span className="text-xs font-medium text-slate-300">Video Clips</span>
            </div>
            <div className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800">
              <Cpu className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-medium text-slate-300">Raw Logs / Text</span>
            </div>
          </div>
        </div>
      </section>

      {/* Core Architectural Pillars */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Engineered for High-Throughput Cross-Modal Synthesis
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            Eliminate cognitive overhead by unifying structured metadata extraction, semantic search, and multi-file reasoning.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-5">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                Multi-File Context Aggregation
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Attach two, three, or more distinct media types simultaneously. OmniSight automatically streams multi-format payloads into Gemini for comparative reconciliation.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Full cross-modal verification</span>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mb-5">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                Structured Knowledge Extraction
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Deterministic extraction using Gemini structured responseSchema: executive summaries, entity classifications, key metrics, sentiment analysis, and confidence scores.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% schema validation with Zod</span>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                Cross-Modal Intelligence Analytics
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Real-time metrics visual dashboard summarizing media distribution, processed tokens, top entities, taxonomy classification, and query logs.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Exportable Markdown & JSON reports</span>
            </div>
          </div>
        </div>
      </section>

      {/* Target Domains */}
      <section className="py-16 bg-slate-900/30 border-y border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">
            Supported Enterprise Target Domains
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800">
              <h4 className="text-sm font-bold text-indigo-300">Finance & Legal</h4>
              <p className="text-[11px] text-slate-500 mt-1">Contracts, Audit Reports, Earnings Calls, Invoices</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800">
              <h4 className="text-sm font-bold text-sky-300">Healthcare & Life Sciences</h4>
              <p className="text-[11px] text-slate-500 mt-1">Clinical Notes, Lab Scans, Research Trials</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800">
              <h4 className="text-sm font-bold text-emerald-300">Engineering & Ops</h4>
              <p className="text-[11px] text-slate-500 mt-1">Circuit Diagrams, Topology Schemas, Incident Logs</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800">
              <h4 className="text-sm font-bold text-purple-300">Media & Research</h4>
              <p className="text-[11px] text-slate-500 mt-1">Video Streams, Podcasts, Visual Assets, Publications</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-slate-900 text-center text-xs text-slate-500">
        <p>OmniSight AI — Enterprise Multimodal Intelligence Platform • Powered by Google Gemini 2.5 Flash</p>
      </footer>
    </div>
  );
};
