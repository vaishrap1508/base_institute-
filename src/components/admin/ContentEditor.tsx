'use client';

import React from 'react';
import { Bold, Italic, Code, SquareSlash, Sparkles, Film, HelpCircle, Save, CheckCircle } from 'lucide-react';

interface ContentEditorProps {
  questionStem: string;
  hintText: string;
  videoUrl: string;
  onChangeQuestionStem: (text: string) => void;
  onChangeHintText: (text: string) => void;
  onChangeVideoUrl: (url: string) => void;

  // Actions
  onSaveDraft: () => void;
  onPublish: () => void;

  // Validation
  isValid: boolean;
  validationErrors: string[];
}

export default function ContentEditor({
  questionStem,
  hintText,
  videoUrl,
  onChangeQuestionStem,
  onChangeHintText,
  onChangeVideoUrl,
  onSaveDraft,
  onPublish,
  isValid,
  validationErrors
}: ContentEditorProps) {
  // Simple editor actions helper
  const insertText = (syntaxBefore: string, syntaxAfter: string = '') => {
    onChangeQuestionStem(questionStem + syntaxBefore + 'text' + syntaxAfter);
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm flex flex-col h-full overflow-hidden">
      {/* Editor Header & Toolbar */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <SquareSlash className="w-4 h-4 text-blue-600 animate-pulse" />
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Content Editor</span>
        </div>

        {/* Toolbar formatting buttons */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 p-0.5 rounded-lg">
          <button
            type="button"
            onClick={() => insertText('**', '**')}
            title="Bold"
            className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition-colors"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertText('*', '*')}
            title="Italic"
            className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition-colors"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertText('`', '`')}
            title="Inline Code"
            className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition-colors"
          >
            <Code className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertText('$', '$')}
            title="LaTeX Math"
            className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition-colors text-xs font-semibold leading-none w-5.5 h-5.5 flex items-center justify-center"
          >
            $$
          </button>


        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 p-5 overflow-y-auto space-y-5">
        {/* Question Stem Text Area */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            Question Stem (Markdown / LaTeX)
            <HelpCircle className="w-3 h-3 text-slate-300 hover:text-slate-400 cursor-help" />
          </label>
          <textarea
            value={questionStem}
            onChange={(e) => onChangeQuestionStem(e.target.value)}
            placeholder="Type your question prompt, mathematical equations in $...$ or $$...$$, and step-by-step markdown solutions here..."
            className="w-full h-56 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none leading-relaxed transition-all placeholder:font-sans placeholder:text-slate-400"
            spellCheck="false"
          />
        </div>

        {/* Hint Text input */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Student Hint (Markdown Support)
          </label>
          <input
            type="text"
            value={hintText}
            onChange={(e) => onChangeHintText(e.target.value)}
            placeholder="Enter a helpful tip or prompt suggestion (e.g. Express new price in terms of x)"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Video solution reference input */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            Video Solution Reference (YouTube URL)
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 flex items-center justify-center w-5 h-5 rounded bg-rose-50 border border-rose-200">
              <Film className="w-3 h-3 text-rose-600" />
            </div>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => onChangeVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono"
            />
          </div>
        </div>

        {/* Validation Errors Panel */}
        {!isValid && validationErrors.length > 0 && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex flex-col gap-1.5 animate-fadeIn">
            <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">
              Validation Warnings
            </span>
            <ul className="list-disc pl-4 space-y-0.5">
              {validationErrors.map((err, index) => (
                <li key={index} className="text-xs text-rose-600 font-semibold tracking-tight">
                  {err}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Editor Footer / Action Buttons */}
      <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
        <button
          type="button"
          onClick={onSaveDraft}
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-sm transition-all"
        >
          <Save className="w-3.5 h-3.5 text-slate-400" />
          <span>Save Draft</span>
        </button>

        <button
          type="button"
          onClick={onPublish}
          className={`flex items-center gap-2 px-5 py-2.5 text-white rounded-lg text-xs font-bold shadow-md transition-all duration-200 ${
            isValid
              ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/10 cursor-pointer active:scale-98'
              : 'bg-slate-400 opacity-60 cursor-not-allowed shadow-none'
          }`}
        >
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Publish Question</span>
        </button>
      </div>
    </div>
  );
}
