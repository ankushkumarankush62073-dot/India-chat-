import React, { useState } from 'react';
import { Copy, Check, Terminal, ExternalLink } from 'lucide-react';

interface CodeBlockProps {
  language: string;
  code: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-slate-700/60 bg-slate-950/90 shadow-lg">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-orange-400" />
          <span className="uppercase font-semibold tracking-wider text-slate-300">
            {language || 'text'}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-xs font-sans cursor-pointer"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm text-slate-200 font-mono leading-relaxed selection:bg-orange-500/30">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  if (!content) return null;

  // Split by code blocks ```lang ... ```
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  let keyIndex = 0;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const textBefore = content.substring(lastIndex, match.index);
    if (textBefore) {
      parts.push(
        <FormattedText key={`text-${keyIndex++}`} text={textBefore} />
      );
    }

    const language = match[1] || 'plaintext';
    const code = match[2];
    parts.push(
      <CodeBlock key={`code-${keyIndex++}`} language={language} code={code} />
    );

    lastIndex = match.index + match[0].length;
  }

  const remaining = content.substring(lastIndex);
  if (remaining) {
    parts.push(<FormattedText key={`text-${keyIndex++}`} text={remaining} />);
  }

  return <div className="space-y-2 leading-relaxed text-sm sm:text-base break-words">{parts}</div>;
};

// Formatter for headings, lists, bold, math, quotes, and links
const FormattedText: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');
  const renderedLines: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Empty line
    if (!line.trim()) {
      renderedLines.push(<div key={`br-${i}`} className="h-2" />);
      continue;
    }

    // Headings
    if (line.startsWith('### ')) {
      renderedLines.push(
        <h3 key={`h3-${i}`} className="text-base sm:text-lg font-bold text-slate-100 dark:text-white mt-4 mb-2 flex items-center gap-2">
          {renderInlineFormatting(line.substring(4))}
        </h3>
      );
      continue;
    }
    if (line.startsWith('## ')) {
      renderedLines.push(
        <h2 key={`h2-${i}`} className="text-lg sm:text-xl font-bold text-slate-100 dark:text-white mt-5 mb-2.5 pb-1 border-b border-slate-700/50">
          {renderInlineFormatting(line.substring(3))}
        </h2>
      );
      continue;
    }
    if (line.startsWith('# ')) {
      renderedLines.push(
        <h1 key={`h1-${i}`} className="text-xl sm:text-2xl font-extrabold text-slate-100 dark:text-white mt-6 mb-3">
          {renderInlineFormatting(line.substring(2))}
        </h1>
      );
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      renderedLines.push(
        <blockquote key={`quote-${i}`} className="my-2 pl-4 py-1.5 border-l-2 border-orange-500/80 bg-slate-800/40 rounded-r-lg text-slate-300 italic text-sm">
          {renderInlineFormatting(line.substring(2))}
        </blockquote>
      );
      continue;
    }

    // Bullet list
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const bulletText = line.trim().replace(/^[-*]\s+/, '');
      renderedLines.push(
        <div key={`li-${i}`} className="flex items-start gap-2.5 ml-2 my-1">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 shrink-0" />
          <span className="text-slate-200">{renderInlineFormatting(bulletText)}</span>
        </div>
      );
      continue;
    }

    // Numbered list
    const numberedMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
    if (numberedMatch) {
      renderedLines.push(
        <div key={`num-${i}`} className="flex items-start gap-2.5 ml-2 my-1">
          <span className="font-mono text-xs font-semibold text-orange-400 mt-0.5 shrink-0 bg-orange-500/10 px-1.5 py-0.5 rounded">
            {numberedMatch[1]}.
          </span>
          <span className="text-slate-200">{renderInlineFormatting(numberedMatch[2])}</span>
        </div>
      );
      continue;
    }

    // Standard paragraph line
    renderedLines.push(
      <p key={`p-${i}`} className="my-1 text-slate-200 leading-relaxed">
        {renderInlineFormatting(line)}
      </p>
    );
  }

  return <div>{renderedLines}</div>;
};

// Inline parser for bold, inline code, math formulas, and links
function renderInlineFormatting(str: string): React.ReactNode[] {
  // Regex for inline code `...`, bold **...**, math $...$, links [title](url)
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\$[^\$]+\$|\[([^\]]+)\]\(([^)]+)\))/g;
  const nodes: React.ReactNode[] = [];
  let lastIdx = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(str)) !== null) {
    if (match.index > lastIdx) {
      nodes.push(str.substring(lastIdx, match.index));
    }

    const token = match[0];

    // Inline code `...`
    if (token.startsWith('`') && token.endsWith('`')) {
      nodes.push(
        <code
          key={`code-${key++}`}
          className="px-1.5 py-0.5 rounded bg-slate-800 text-orange-300 font-mono text-xs border border-slate-700"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    // Bold **...**
    else if (token.startsWith('**') && token.endsWith('**')) {
      nodes.push(
        <strong key={`bold-${key++}`} className="font-bold text-white">
          {token.slice(2, -2)}
        </strong>
      );
    }
    // Math $...$
    else if (token.startsWith('$') && token.endsWith('$')) {
      nodes.push(
        <span
          key={`math-${key++}`}
          className="px-1.5 py-0.5 font-mono text-xs bg-indigo-950/60 text-indigo-300 rounded border border-indigo-800/50"
        >
          {token.slice(1, -1)}
        </span>
      );
    }
    // Link [title](url)
    else if (token.startsWith('[')) {
      const linkMatch = token.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        nodes.push(
          <a
            key={`link-${key++}`}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-orange-400 hover:text-orange-300 underline underline-offset-2"
          >
            {linkMatch[1]}
            <ExternalLink className="w-3 h-3 inline" />
          </a>
        );
      }
    }

    lastIdx = match.index + token.length;
  }

  if (lastIdx < str.length) {
    nodes.push(str.substring(lastIdx));
  }

  return nodes.length > 0 ? nodes : [str];
}
