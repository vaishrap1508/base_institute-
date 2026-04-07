'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import { Save, Eye, FileText } from 'lucide-react';
// Note: In a real environment, we'd ensure katex CSS is loaded globally or here
// import 'katex/dist/katex.min.css';

export default function AdminContentCreator() {
  const [markdown, setMarkdown] = useState('# New Question\n\nSolve the quadratic equation for $x$:\n\n$$ x^2 + 5x + 6 = 0 $$ \n\n**Hint:** Factorize the equation first.');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-orange-500" />
          <h1 className="text-xl font-medium tracking-tight">Dynamic Content Creator</h1>
        </div>
        <div className="flex gap-4">
          <button className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Draft
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium rounded-md transition-colors shadow-lg shadow-orange-900/20">
            <Save className="w-4 h-4" />
            Publish content
          </button>
        </div>
      </header>

      {/* Main Split Pane */}
      <main className="flex-1 overflow-hidden flex">
        {/* Editor Pane (Left) */}
        <section className="w-1/2 flex flex-col border-r border-slate-800 bg-slate-900/30">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>Markdown / LaTeX Input</span>
          </div>
          <textarea
            className="flex-1 bg-transparent p-6 text-slate-200 outline-none resize-none font-mono text-sm leading-relaxed"
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="Type markdown and LaTeX here..."
            spellCheck="false"
          />
        </section>

        {/* Preview Pane (Right) */}
        <section className="w-1/2 flex flex-col bg-slate-950">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span className="flex items-center gap-2"><Eye className="w-4 h-4" /> Live Student Preview</span>
          </div>
          <div className="flex-1 p-6 overflow-y-auto prose prose-invert prose-orange max-w-none prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800">
            <ReactMarkdown rehypePlugins={[rehypeKatex]}>
              {markdown}
            </ReactMarkdown>
          </div>
        </section>
      </main>
    </div>
  );
}
