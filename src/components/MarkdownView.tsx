import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface MarkdownViewProps {
  content: string;
  className?: string;
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({ content, className = '' }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Split lines and group into markdown blocks (tables, code blocks, paragraphs, lists)
  const renderFormatted = () => {
    if (!content) return null;

    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Code Block
      if (line.trim().startsWith('```')) {
        const lang = line.trim().replace(/^```/, '');
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        const codeText = codeLines.join('\n');
        const codeIdx = i;
        elements.push(
          <div key={`code-${i}`} className="my-3 rounded-lg overflow-hidden border border-slate-800 bg-slate-900/90 shadow-sm text-xs">
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800/80 border-b border-slate-700/50 text-slate-400 font-mono">
              <span>{lang || 'code'}</span>
              <button
                onClick={() => handleCopy(codeText, codeIdx)}
                className="flex items-center gap-1 hover:text-slate-200 transition-colors text-[11px]"
              >
                {copiedIndex === codeIdx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedIndex === codeIdx ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="p-3 text-emerald-300 font-mono overflow-x-auto text-xs leading-relaxed">
              <code>{codeText}</code>
            </pre>
          </div>
        );
        i++;
        continue;
      }

      // Markdown Table Detection
      if (line.includes('|') && lines[i + 1] && lines[i + 1].includes('|') && lines[i + 1].includes('-')) {
        const tableLines: string[] = [];
        while (i < lines.length && lines[i].includes('|')) {
          tableLines.push(lines[i]);
          i++;
        }

        if (tableLines.length >= 2) {
          const parseRow = (rowStr: string) =>
            rowStr
              .split('|')
              .slice(1, -1)
              .map((c) => c.trim());

          const headerCells = parseRow(tableLines[0]);
          const bodyRows = tableLines.slice(2).map(parseRow);

          elements.push(
            <div key={`table-${i}`} className="my-4 overflow-x-auto rounded-lg border border-slate-800 bg-slate-900/40">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-800/60 border-b border-slate-700/60 text-slate-200 font-semibold">
                    {headerCells.map((h, hIdx) => (
                      <th key={hIdx} className="px-3.5 py-2.5">
                        {renderInline(h)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 text-slate-300">
                  {bodyRows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-800/30 transition-colors">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-3.5 py-2 font-normal">
                          {renderInline(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
          continue;
        }
      }

      // Headings
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={`h1-${i}`} className="text-xl font-bold text-white mt-4 mb-2 tracking-tight">
            {renderInline(line.replace('# ', ''))}
          </h1>
        );
        i++;
        continue;
      }
      if (line.startsWith('## ')) {
        elements.push(
          <h2 key={`h2-${i}`} className="text-lg font-bold text-indigo-300 mt-3.5 mb-1.5 tracking-tight">
            {renderInline(line.replace('## ', ''))}
          </h2>
        );
        i++;
        continue;
      }
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={`h3-${i}`} className="text-sm font-semibold text-sky-300 mt-3 mb-1 uppercase tracking-wider">
            {renderInline(line.replace('### ', ''))}
          </h3>
        );
        i++;
        continue;
      }

      // Blockquotes
      if (line.startsWith('> ')) {
        elements.push(
          <blockquote key={`bq-${i}`} className="my-2 pl-3.5 border-l-2 border-indigo-500 text-slate-300 italic text-xs bg-indigo-500/5 py-1 rounded-r">
            {renderInline(line.replace('> ', ''))}
          </blockquote>
        );
        i++;
        continue;
      }

      // Horizontal Rule
      if (line.trim() === '---' || line.trim() === '***') {
        elements.push(<hr key={`hr-${i}`} className="my-3 border-slate-800" />);
        i++;
        continue;
      }

      // Unordered list item
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        const itemText = line.trim().replace(/^[\*\-]\s+/, '');
        elements.push(
          <li key={`li-${i}`} className="ml-4 list-disc text-xs text-slate-300 my-0.5 leading-relaxed marker:text-indigo-400">
            {renderInline(itemText)}
          </li>
        );
        i++;
        continue;
      }

      // Numbered list item
      if (/^\d+\.\s/.test(line.trim())) {
        const itemText = line.trim().replace(/^\d+\.\s+/, '');
        elements.push(
          <li key={`oli-${i}`} className="ml-4 list-decimal text-xs text-slate-300 my-0.5 leading-relaxed marker:text-sky-400">
            {renderInline(itemText)}
          </li>
        );
        i++;
        continue;
      }

      // Standard Paragraph
      if (line.trim() !== '') {
        elements.push(
          <p key={`p-${i}`} className="text-xs text-slate-300 my-1.5 leading-relaxed">
            {renderInline(line)}
          </p>
        );
      }

      i++;
    }

    return elements;
  };

  const renderInline = (text: string): React.ReactNode => {
    // Process bold **text**, inline `code`, and links
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);

    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={idx} className="font-semibold text-slate-100">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={idx} className="px-1.5 py-0.5 bg-slate-800 text-indigo-300 rounded font-mono text-[11px]">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return <div className={`prose-invert space-y-1 ${className}`}>{renderFormatted()}</div>;
};
