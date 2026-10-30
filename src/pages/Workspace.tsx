import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Plus,
  MessageSquare,
  Sparkles,
  Layers,
  SlidersHorizontal,
  Download,
  X,
  FileText,
  Copy,
  Check,
  RotateCw,
  Loader2
} from 'lucide-react';
import { apiAssets, apiAi } from '../services/api.ts';
import { MediaAsset, ChatMessage, ChatSession, AdvisoryConfig } from '../types/index.ts';
import { ContextSelector } from '../components/ContextSelector.tsx';
import { ChatWindow } from '../components/ChatWindow.tsx';
import { InsightDrawer } from '../components/InsightDrawer.tsx';
import { MarkdownView } from '../components/MarkdownView.tsx';

export const Workspace: React.FC = () => {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingChat, setLoadingChat] = useState<boolean>(false);
  const [advisory, setAdvisory] = useState<AdvisoryConfig>({
    depth: 'Detailed Synthesis',
    persona: 'Domain Expert / Auditor',
    tone: 'Strictly Analytical',
  });

  // Report Modal States
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportMarkdown, setReportMarkdown] = useState<string>('');
  const [generatingReport, setGeneratingReport] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);

  // Insight Drawer State
  const [inspectAsset, setInspectAsset] = useState<MediaAsset | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [assetsRes, sessionsRes] = await Promise.all([
        apiAssets.list(),
        apiAi.getSessions(),
      ]);
      setAssets(assetsRes.assets);
      setSessions(sessionsRes.sessions);

      // Default select the first 2 or 3 assets for immediate cross-modal demo
      if (assetsRes.assets.length > 0) {
        setSelectedAssetIds(assetsRes.assets.slice(0, 3).map((a) => a.id));
      }

      // Load first session messages if available
      if (sessionsRes.sessions.length > 0) {
        const firstSession = sessionsRes.sessions[0];
        setActiveSessionId(firstSession.id);
        const msgRes = await apiAi.getSessionMessages(firstSession.id);
        setMessages(msgRes.messages);
      }
    } catch (err) {
      console.error('Failed to load workspace data:', err);
    }
  };

  const handleSelectSession = async (sessionId: string) => {
    setActiveSessionId(sessionId);
    try {
      const res = await apiAi.getSessionMessages(sessionId);
      setMessages(res.messages);
    } catch (err) {
      console.error('Failed to load session messages:', err);
    }
  };

  const handleNewSession = () => {
    setActiveSessionId(undefined);
    setMessages([]);
  };

  const handleToggleSelectAsset = (assetId: string) => {
    setSelectedAssetIds((prev) =>
      prev.includes(assetId) ? prev.filter((id) => id !== assetId) : [...prev, assetId]
    );
  };

  const handleSendMessage = async (userPrompt: string) => {
    if (!userPrompt.trim() || loadingChat) return;

    setLoadingChat(true);

    // Optimistically add user message
    const tempUserMsg: ChatMessage = {
      id: `temp_${Date.now()}`,
      sessionId: activeSessionId || 'pending',
      sender: 'user',
      content: userPrompt,
      attachedAssetIds: [...selectedAssetIds],
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await apiAi.chat({
        message: userPrompt,
        assetIds: selectedAssetIds,
        sessionId: activeSessionId,
        depth: advisory.depth,
        persona: advisory.persona,
        tone: advisory.tone,
      });

      setActiveSessionId(res.sessionId);
      setMessages((prev) => [...prev.slice(0, -1), res.userMessage, res.assistantMessage]);

      // Refresh session list
      const sessionsRes = await apiAi.getSessions();
      setSessions(sessionsRes.sessions);
    } catch (err: any) {
      console.error('Chat error:', err);
      // Append error message from assistant
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        sessionId: activeSessionId || 'error',
        sender: 'assistant',
        content: `⚠️ Synthesis Notice: ${err.message || 'Execution error during multimodal analysis'}.`,
        attachedAssetIds: [...selectedAssetIds],
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoadingChat(false);
    }
  };

  const handleGenerateReport = async () => {
    if (selectedAssetIds.length === 0) return;
    setShowReportModal(true);
    setGeneratingReport(true);
    setReportMarkdown('');

    try {
      const res = await apiAi.synthesizeReport({
        assetIds: selectedAssetIds,
        depth: advisory.depth,
        persona: advisory.persona,
        tone: advisory.tone,
      });
      setReportMarkdown(res.reportMarkdown);
    } catch (err: any) {
      setReportMarkdown(`⚠️ Report generation error: ${err.message}`);
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleCopyReport = () => {
    navigator.clipboard.writeText(reportMarkdown);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  const handleDownloadReport = () => {
    const blob = new Blob([reportMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OmniSight_CrossModal_Intelligence_Report_${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleExportChat = () => {
    const chatExport = `# OmniSight Cross-Modal AI Analysis Log
Generated: ${new Date().toLocaleString()}
Attached Assets: ${selectedAssetIds.length}

${messages
  .map(
    (m) => `### [${m.sender.toUpperCase()}] (${new Date(m.createdAt).toLocaleTimeString()}):
${m.content}
`
  )
  .join('\n---\n\n')}`;

    const blob = new Blob([chatExport], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OmniSight_Session_${activeSessionId || 'export'}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5 h-[calc(100vh-4.5rem)] flex flex-col">
      {/* Top Context Selector Toolbar */}
      <ContextSelector
        assets={assets}
        selectedIds={selectedAssetIds}
        onToggleSelect={handleToggleSelectAsset}
        onClearSelection={() => setSelectedAssetIds([])}
        onSelectAll={() => setSelectedAssetIds(assets.map((a) => a.id))}
        onSynthesizeReport={handleGenerateReport}
      />

      {/* Main Studio Body: Sessions Sidebar + Chat Window */}
      <div className="flex-1 min-h-0 flex gap-4">
        {/* Left Sessions Sidebar */}
        <div className="w-64 bg-slate-900/60 border border-slate-800 rounded-2xl p-3.5 hidden lg:flex flex-col justify-between shrink-0 shadow-xl">
          <div className="space-y-3 flex-1 flex flex-col min-h-0">
            <button
              onClick={handleNewSession}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-semibold transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>New Analysis Session</span>
            </button>

            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1 pt-2">
              Recent Sessions ({sessions.length})
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
              {sessions.map((s) => {
                const isActive = activeSessionId === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => handleSelectSession(s.id)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs transition-colors flex items-start gap-2.5 ${
                      isActive
                        ? 'bg-slate-800 text-white font-medium border border-slate-700'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                    <span className="line-clamp-2 leading-relaxed">{s.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Active Files Summary at bottom of sidebar */}
          <div className="pt-3 border-t border-slate-800 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>Attached to Prompt:</span>
              <span className="font-mono text-indigo-300 font-bold">{selectedAssetIds.length} files</span>
            </div>
            <div className="max-h-24 overflow-y-auto space-y-1">
              {assets
                .filter((a) => selectedAssetIds.includes(a.id))
                .map((a) => (
                  <div
                    key={a.id}
                    onClick={() => setInspectAsset(a)}
                    className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-300 hover:text-indigo-300 flex items-center justify-between cursor-pointer"
                  >
                    <span className="truncate pr-1">{a.originalName}</span>
                    <span className="text-[9px] uppercase font-mono text-slate-500">{a.modality}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Center Chat Window */}
        <ChatWindow
          messages={messages}
          assets={assets}
          selectedAssetIds={selectedAssetIds}
          advisory={advisory}
          onUpdateAdvisory={setAdvisory}
          onSendMessage={handleSendMessage}
          loading={loadingChat}
          onExportChat={handleExportChat}
        />
      </div>

      {/* Cross-Modal Report Synthesis Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Cross-Modal Synthesis Report</h3>
                  <p className="text-[11px] text-slate-400">
                    Synthesizing {selectedAssetIds.length} media modalities into formal markdown
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {reportMarkdown && !generatingReport && (
                  <>
                    <button
                      onClick={handleCopyReport}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                    >
                      {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedReport ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={handleDownloadReport}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download .md</span>
                    </button>
                  </>
                )}
                <button
                  onClick={() => setShowReportModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {generatingReport ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3 text-center">
                  <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
                  <p className="text-sm font-semibold text-white">Generating Multimodal Intelligence Report...</p>
                  <p className="text-xs text-slate-400 max-w-sm">
                    Reconciling numerical data, OCR text snippets, and audio timestamps across all selected assets
                  </p>
                </div>
              ) : (
                <MarkdownView content={reportMarkdown} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Detailed Asset Inspector Drawer */}
      <InsightDrawer
        asset={inspectAsset}
        isOpen={Boolean(inspectAsset)}
        onClose={() => setInspectAsset(null)}
      />
    </div>
  );
};
