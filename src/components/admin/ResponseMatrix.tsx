'use client';

import React from 'react';
import { Sparkles, HelpCircle, Shuffle, Plus, Trash2 } from 'lucide-react';
import { ResponseOption } from '@/lib/admin/types';

interface ResponseMatrixProps {
  options: ResponseOption[];
  shuffleOptions: boolean;
  onChangeOptionText: (id: string, text: string) => void;
  onChangeOptionMetadata: (id: string, metadata: string) => void;
  onSetCorrectOption: (id: string) => void;
  onToggleShuffle: () => void;
  onAddOption?: () => void;
  onRemoveOption?: (id: string) => void;
}

export default function ResponseMatrix({
  options,
  shuffleOptions,
  onChangeOptionText,
  onChangeOptionMetadata,
  onSetCorrectOption,
  onToggleShuffle,
  onAddOption,
  onRemoveOption
}: ResponseMatrixProps) {
  return (
    <div className="bg-white dark:bg-slate-900 p-5 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm flex flex-col gap-4 h-full">
      {/* Response Matrix Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          Response Matrix
          <HelpCircle className="w-3.5 h-3.5 text-slate-300 dark:text-slate-550 hover:text-slate-400 cursor-help" />
        </label>

        {/* Header Actions */}
        <div className="flex items-center gap-4.5">
          {/* Add Option Button */}
          <button
            type="button"
            onClick={onAddOption}
            className="flex items-center gap-1 px-3 py-1 bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100/80 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg text-xs font-bold transition-all active:scale-97 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Option</span>
          </button>

          {/* Shuffle Switch */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Shuffle</span>
            <button
              type="button"
              onClick={onToggleShuffle}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none relative ${
                shuffleOptions ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ${
                  shuffleOptions ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Choices (A, B, C, D...) */}
      {options.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {options.map((option) => {
            const isCorrect = option.isCorrect;

            return (
              <div
                key={option.id}
                onClick={() => onSetCorrectOption(option.id)}
                className={`p-4 rounded-xl border transition-all duration-150 cursor-pointer relative group flex flex-col gap-2.5 ${
                  isCorrect
                    ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-400 dark:border-blue-600 shadow-sm shadow-blue-50 dark:shadow-none'
                    : 'bg-slate-50/30 dark:bg-slate-900/30 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Option Details Card Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* Custom Radio Button */}
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                        isCorrect
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 group-hover:border-slate-400 dark:group-hover:border-slate-600'
                      }`}
                    >
                      {isCorrect && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        isCorrect ? 'text-blue-700 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      Option {option.id} {isCorrect && '(Correct)'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveOption?.(option.id);
                      }}
                      className={`p-1 rounded transition-colors ${
                        isCorrect
                          ? 'hover:bg-blue-100/80 dark:hover:bg-blue-950/50 text-blue-400 hover:text-blue-700 dark:hover:text-blue-300'
                          : 'hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-600 dark:text-slate-550 dark:hover:text-rose-455'
                      }`}
                      title={`Remove Option ${option.id}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Text Input for the Choice */}
                <textarea
                  value={option.text}
                  onChange={(e) => onChangeOptionText(option.id, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  placeholder={`Enter content for Option ${option.id}...`}
                  rows={2}
                  className={`w-full px-3 py-1.5 bg-white dark:bg-slate-900 border rounded-lg text-sm transition-all focus:outline-none resize-none overflow-y-auto break-words leading-relaxed ${
                    isCorrect
                      ? 'border-blue-250 dark:border-blue-900/40 text-blue-900 dark:text-blue-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                      : 'border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 dark:bg-slate-950/20 border border-dashed border-slate-200 dark:border-slate-850 rounded-xl min-h-[180px]">
          <Sparkles className="w-6 h-6 text-slate-300 dark:text-slate-700 mb-2 animate-pulse" />
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">No Choices Added</span>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium max-w-[240px] mt-1 leading-relaxed">
            Click the <strong>Add Option</strong> button in the header to start building your multiple choice options matrix.
          </p>
        </div>
      )}
    </div>
  );
}
