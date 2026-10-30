import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  SlidersHorizontal,
  Bot,
  User,
  Layers,
  Download,
  FileText,
  Loader2,
  Trash2,
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import { ChatMessage, MediaAsset, AdvisoryConfig } from '../types/index.ts';
import { MarkdownView } from './MarkdownView.tsx';
import { getModalityIcon } from './AssetCard.tsx';

interface ChatWindowProps {
  messages: ChatMessage[];
  assets: MediaAsset[];
  selectedAssetIds: string[];
  advisory: AdvisoryConfig;
  onUpdateAdvisory: (advisory: AdvisoryConfig) => void;
  onSendMessage: (message: string) => Promise<void>;
  loading: boolean;
  onExportChat: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  assets,
  selectedAssetIds,
  advisory,
  onUpdateAdvisory,
  onSendMessage,
  loading,
  onExportChat,
}) => {
  const [inputText, setInputText] = useState('');
  const [showConfig, setShowConfig] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;
    const msg = inputText.trim();
    setInputText('');
    onSendMessage(msg);
  };

  const selectedAssets = assets.filter((a) => selectedAssetIds.includes(a.id));

  const quickPrompts = [
    'Compare figures in the Q3 Financial Performance Audit with the Revenue Breakdown Chart and Call transcript.',
    'Cross-reference the System Architecture Topology with the extracted ingestion pipeline metrics.',
    'Identify all key entities, financial metrics, and operational risks across the selected assets.',
    'Reconcile reported EBITDA margins and operating cash flow across document and transcript.'
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Chat Header */}
      <div className="p-3.5 sm:p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Cross-Modal AI Workbench</h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-medium border border-emerald-500/20">
                Gemini 2.5 Flash
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {selectedAssets.length > 0
                ? `Context: ${selectedAssets.map((a) => a.originalName).join(', ')}`
                : 'No files attached — using global repository'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              showConfig
                ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Advisory Settings</span>
          </button>
          <button
            onClick={onExportChat}
            title="Export Conversation Markdown"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Advisory Configuration Dropdown Drawer */}
      {showConfig && (
        <div className="p-4 bg-slate-950/90 border-b border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in duration-150">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Analysis Depth
            </label>
            <select
              value={advisory.depth}
              onChange={(e) =>
                onUpdateAdvisory({ ...advisory, depth: e.target.value as AdvisoryConfig['depth'] })
              }
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="Quick Summary">Quick Summary</option>
              <option value="Detailed Synthesis">Detailed Synthesis</option>
              <option value="Deep Technical Audit">Deep Technical Audit</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Target Persona
            </label>
            <select
              value={advisory.persona}
              onChange={(e) =>
                onUpdateAdvisory({ ...advisory, persona: e.target.value as AdvisoryConfig['persona'] })
              }
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="Executive Leader">Executive Leader</option>
              <option value="Domain Expert / Auditor">Domain Expert / Auditor</option>
              <option value="General Public">General Public</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Tone & Output Style
            </label>
            <select
              value={advisory.tone}
              onChange={(e) =>
                onUpdateAdvisory({ ...advisory, tone: e.target.value as AdvisoryConfig['tone'] })
              }
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="Strictly Analytical">Strictly Analytical</option>
              <option value="Action-Oriented">Action-Oriented</option>
              <option value="Bullet-Point Structured">Bullet-Point Structured</option>
            </select>
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="max-w-md">
              <h4 className="text-base font-bold text-white">Cross-Modal Context Ready</h4>
              <p className="text-xs text-slate-400 mt-1">
                Select files from your repository or execute one of the recommended multimodal prompts below to test cross-referencing capabilities.
              </p>
            </div>

            {/* Quick Prompts */}
            <div className="w-full max-w-lg grid grid-cols-1 gap-2 pt-2 text-left">
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(qp)}
                  className="p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/40 text-xs text-slate-300 hover:text-white transition-all text-left flex items-start gap-2.5 group"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                  <span>{qp}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const attached = assets.filter((a) => msg.attachedAssetIds?.includes(a.id));

            return (
              <div
                key={msg.id}
                className={`flex gap-3 sm:gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white shrink-0 mt-1 shadow-md shadow-indigo-600/20">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 sm:p-5 shadow-lg ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-950/90 border border-slate-800 rounded-tl-none text-slate-100'
                  }`}
                >
                  {/* Attached Media Badges */}
                  {attached.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pb-2.5 mb-2.5 border-b border-indigo-400/20">
                      <span className="text-[10px] font-semibold text-indigo-200/80 flex items-center gap-1">
                        <Layers className="w-3 h-3" />
                        <span>Sources:</span>
                      </span>
                      {attached.map((a) => (
                        <span
                          key={a.id}
                          className={`text-[10px] px-2 py-0.5 rounded flex items-center gap-1 ${
                            isUser
                              ? 'bg-indigo-700/60 text-indigo-100'
                              : 'bg-slate-800 text-indigo-300 border border-slate-700'
                          }`}
                        >
                          {getModalityIcon(a.modality, 'w-3 h-3')}
                          <span className="max-w-[120px] truncate">{a.originalName}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Message Content */}
                  {isUser ? (
                    <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <MarkdownView content={msg.content} />
                  )}

                  <div className="text-[10px] opacity-60 text-right mt-2 font-mono">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {loading && (
          <div className="flex gap-3 sm:gap-4 justify-start">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white shrink-0 mt-1 shadow-md shadow-indigo-600/20">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="bg-slate-950/90 border border-slate-800 rounded-2xl rounded-tl-none p-4 text-slate-300 flex items-center gap-3">
              <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
              <span className="text-xs text-slate-400 font-mono">
                OmniSight Core is synthesizing cross-modal evidence across attached files...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-3 sm:p-4 bg-slate-900 border-t border-slate-800">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              selectedAssets.length > 0
                ? `Query across ${selectedAssets.length} selected media files...`
                : 'Ask a question or select files from top toolbar...'
            }
            disabled={loading}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-4 pr-12 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="absolute right-2 p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white disabled:text-slate-500 shadow-md transition-all active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
