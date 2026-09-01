import React from 'react';

interface FormattedMarkdownTextProps {
  content: string;
  className?: string;
}

export const FormattedMarkdownText: React.FC<FormattedMarkdownTextProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Split into lines or double line breaks
  const rawLines = content.split('\n');

  // Helper to parse inline **bold** and currency amounts cleanly
  const renderFormattedInlineText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|₹[\d,.]+(?:\s*(?:Cr|Lakhs|L))?)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-blue-300">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (/^₹[\d,.]+(?:\s*(?:Cr|Lakhs|L))?$/.test(part)) {
        return (
          <span key={i} className="font-mono font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded text-[11px] mx-0.5">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  // Detect numbered steps in a single dense paragraph e.g. "1. **Step** ... 2. **Step** ..."
  const stepPattern = /(?:^|\s)(\d+)\.\s+(\*\*.*?\*\*|.*?)(?=(?:\s+\d+\.\s+|$))/g;
  const isNumberedDenseList = /\d+\.\s+\*\*/.test(content) && !content.includes('\n1.');

  if (isNumberedDenseList) {
    const steps: { num: string; text: string }[] = [];
    let match;
    const regex = /(\d+)\.\s+([\s\S]*?)(?=(?:\s+\d+\.\s+|$))/g;
    while ((match = regex.exec(content)) !== null) {
      steps.push({ num: match[1], text: match[2].trim() });
    }

    if (steps.length > 0) {
      return (
        <div className={`space-y-2.5 my-2 ${className}`}>
          {steps.map((st, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 bg-[#1C2541]/90 border border-slate-700/60 rounded-xl shadow-sm hover:border-blue-500/30 transition-all">
              <span className="flex items-center justify-center h-6 w-6 rounded-lg bg-blue-600/30 text-blue-400 border border-blue-500/40 text-xs font-bold font-mono shrink-0 mt-0.5">
                {st.num}
              </span>
              <div className="text-xs text-slate-200 leading-relaxed font-normal flex-1">
                {renderFormattedInlineText(st.text)}
              </div>
            </div>
          ))}
        </div>
      );
    }
  }

  // Standard line-by-line parser
  return (
    <div className={`space-y-2 text-xs leading-relaxed text-slate-200 font-normal ${className}`}>
      {rawLines.map((line, lIdx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={lIdx} className="h-1" />;

        // Numbered List Line e.g. "1. Step description"
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          return (
            <div key={lIdx} className="flex items-start gap-2.5 p-2.5 bg-[#1C2541]/70 border border-slate-800 rounded-xl my-1">
              <span className="flex items-center justify-center h-5 w-5 rounded-md bg-blue-600/20 text-blue-400 text-[11px] font-bold font-mono shrink-0 mt-0.5">
                {numMatch[1]}
              </span>
              <div className="text-xs text-slate-200 flex-1">
                {renderFormattedInlineText(numMatch[2])}
              </div>
            </div>
          );
        }

        // Bullet list line e.g. "- item" or "* item" or "• item"
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
          const bulletText = trimmed.replace(/^[-*•]\s+/, '');
          return (
            <div key={lIdx} className="flex items-start gap-2 pl-2 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0 mt-1.5"></span>
              <div className="text-xs text-slate-200 flex-1">
                {renderFormattedInlineText(bulletText)}
              </div>
            </div>
          );
        }

        // Heading e.g. "### Title" or "**Title:**"
        if (trimmed.startsWith('#') || (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length < 50)) {
          const headingText = trimmed.replace(/^#+\s*/, '').replace(/^\*\*/, '').replace(/\*\*$/, '');
          return (
            <div key={lIdx} className="font-bold text-slate-100 text-xs text-blue-300 pt-2 pb-1 border-b border-slate-800 flex items-center gap-1.5">
              <span>{headingText}</span>
            </div>
          );
        }

        // Regular text paragraph
        return (
          <p key={lIdx} className="text-xs text-slate-200 leading-relaxed font-normal">
            {renderFormattedInlineText(trimmed)}
          </p>
        );
      })}
    </div>
  );
};
