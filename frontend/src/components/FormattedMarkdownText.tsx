import React from 'react';

interface FormattedMarkdownTextProps {
  content: string;
  className?: string;
}

export const FormattedMarkdownText: React.FC<FormattedMarkdownTextProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Clean raw LaTeX bracket wrappers e.g. \[formula\] -> formula, \div -> ÷, \times -> ×
  const cleanContent = content
    .replace(/\\\[\s*/g, '')
    .replace(/\s*\\\]/g, '')
    .replace(/\\\((.*?)\\\)/g, '$1')
    .replace(/\\div/g, '÷')
    .replace(/\\times/g, '×')
    .replace(/\\frac\{(.*?)\}\{(.*?)\}/g, '($1 / $2)');

  // Helper to parse inline **bold** and currency amounts cleanly
  const renderFormattedInlineText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|₹[\d,.]+(?:\s*(?:Cr|Lakhs|L))?|\$[\d,.]+(?:\s*(?:k|M|B))?)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-blue-300">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (/^(?:₹|\$)[\d,.]+(?:\s*(?:Cr|Lakhs|L|k|M|B))?$/.test(part)) {
        return (
          <span key={i} className="font-mono font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded text-[11px] mx-0.5">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  // Helper to parse and render Markdown Tables
  const renderMarkdownTable = (tableLines: string[], keyPrefix: number) => {
    if (tableLines.length < 2) return null;

    // Filter out separator line e.g. |---|---|
    const headerRow = tableLines[0];
    const dataRows = tableLines.slice(1).filter(l => !l.replace(/\s+/g, '').includes('|---|') && !l.replace(/\s+/g, '').includes('|:-'));

    const parseCells = (rowStr: string) => {
      return rowStr
        .trim()
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map(c => c.trim());
    };

    const headers = parseCells(headerRow);

    return (
      <div key={`table-${keyPrefix}`} className="my-4 overflow-x-auto rounded-xl border border-slate-700/80 bg-slate-950/80 shadow-lg">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-900 border-b border-slate-800 text-blue-400 font-bold uppercase tracking-wider text-[11px]">
              {headers.map((h, hIdx) => (
                <th key={hIdx} className="px-4 py-2.5 font-semibold">
                  {renderFormattedInlineText(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {dataRows.map((rStr, rIdx) => {
              const cells = parseCells(rStr);
              return (
                <tr key={rIdx} className="hover:bg-slate-900/50 transition-colors">
                  {cells.map((cell, cIdx) => (
                    <td key={cIdx} className="px-4 py-2.5 text-slate-300">
                      {renderFormattedInlineText(cell)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const rawLines = cleanContent.split('\n');
  const elements: React.ReactNode[] = [];
  let tableBuffer: string[] = [];

  for (let lIdx = 0; lIdx < rawLines.length; lIdx++) {
    const line = rawLines[lIdx];
    const trimmed = line.trim();

    // Table line detector
    if (trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.length > 2) {
      tableBuffer.push(trimmed);
      continue;
    } else if (tableBuffer.length > 0) {
      elements.push(renderMarkdownTable(tableBuffer, lIdx));
      tableBuffer = [];
    }

    if (!trimmed) {
      elements.push(<div key={`blank-${lIdx}`} className="h-1" />);
      continue;
    }

    // Numbered List Line e.g. "1. Step description"
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      elements.push(
        <div key={`num-${lIdx}`} className="flex items-start gap-2.5 p-2.5 bg-slate-900/70 border border-slate-800 rounded-xl my-1 shadow-sm">
          <span className="flex items-center justify-center h-5 w-5 rounded-md bg-blue-600/20 text-blue-400 text-[11px] font-bold font-mono shrink-0 mt-0.5 border border-blue-500/30">
            {numMatch[1]}
          </span>
          <div className="text-xs text-slate-200 flex-1">
            {renderFormattedInlineText(numMatch[2])}
          </div>
        </div>
      );
      continue;
    }

    // Bullet list line e.g. "- item" or "* item" or "• item"
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
      const bulletText = trimmed.replace(/^[-*•]\s+/, '');
      elements.push(
        <div key={`bullet-${lIdx}`} className="flex items-start gap-2 pl-2 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0 mt-1.5"></span>
          <div className="text-xs text-slate-200 flex-1">
            {renderFormattedInlineText(bulletText)}
          </div>
        </div>
      );
      continue;
    }

    // Blockquote line e.g. "> Quote text"
    if (trimmed.startsWith('> ')) {
      const quoteText = trimmed.replace(/^>\s*/, '');
      elements.push(
        <div key={`quote-${lIdx}`} className="p-3 my-2 bg-blue-950/30 border-l-4 border-blue-500 rounded-r-xl text-xs text-blue-200 font-medium italic">
          {renderFormattedInlineText(quoteText)}
        </div>
      );
      continue;
    }

    // Heading e.g. "# Title" or "### Title" or "**Title:**"
    if (trimmed.startsWith('#') || (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length < 60)) {
      const headingText = trimmed.replace(/^#+\s*/, '').replace(/^\*\*/, '').replace(/\*\*$/, '');
      elements.push(
        <div key={`heading-${lIdx}`} className="font-bold text-slate-100 text-xs text-blue-300 pt-3 pb-1 border-b border-slate-800 flex items-center gap-1.5">
          <span>{headingText}</span>
        </div>
      );
      continue;
    }

    // Regular text paragraph
    elements.push(
      <p key={`p-${lIdx}`} className="text-xs text-slate-200 leading-relaxed font-normal">
        {renderFormattedInlineText(trimmed)}
      </p>
    );
  }

  // Flush remaining table buffer if present at end of content
  if (tableBuffer.length > 0) {
    elements.push(renderMarkdownTable(tableBuffer, rawLines.length));
  }

  return (
    <div className={`space-y-2 text-xs leading-relaxed text-slate-200 font-normal ${className}`}>
      {elements}
    </div>
  );
};
