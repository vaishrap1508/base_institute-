'use client';

import React from 'react';
import { Sparkles, HelpCircle, Shuffle } from 'lucide-react';
import { ResponseOption } from '@/lib/admin/types';

interface ResponseMatrixProps {
  options: ResponseOption[];
  shuffleOptions: boolean;
  onChangeOptionText: (id: string, text: string) => void;
  onChangeOptionMetadata: (id: string, metadata: string) => void;
  onSetCorrectOption: (id: string) => void;
  onToggleShuffle: () => void;
}

export default function ResponseMatrix({
  options,
  shuffleOptions,
  onChangeOptionText,
  onChangeOptionMetadata,
  onSetCorrectOption,
  onToggleShuffle
}: ResponseMatrixProps) {
  return (
    <div className="bg-white p-5 border border-slate-200/80 rounded-xl shadow-sm flex flex-col gap-4 h-full">
      {/* Response Matrix Header */}
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          Response Matrix
          <HelpCircle className="w-3.5 h-3.5 text-slate-300 hover:text-slate-400 cursor-help" />
        </label>

        {/* Shuffle Switch */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Shuffle Options</span>
          <button
            type="button"
            onClick={onToggleShuffle}
            className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none relative ${
              shuffleOptions ? 'bg-blue-600' : 'bg-slate-200'
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

      {/* Grid of Choices (A, B, C, D) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map((option) => {
          const isCorrect = option.isCorrect;

          return (
            <div
              key={option.id}
              onClick={() => onSetCorrectOption(option.id)}
              className={`p-4 rounded-xl border transition-all duration-150 cursor-pointer relative group flex flex-col gap-2.5 ${
                isCorrect
                  ? 'bg-blue-50/50 border-blue-400 shadow-sm shadow-blue-50'
                  : 'bg-slate-50/30 border-slate-200/80 hover:border-slate-300'
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
                        : 'border-slate-300 bg-white group-hover:border-slate-400'
                    }`}
                  >
                    {isCorrect && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      isCorrect ? 'text-blue-700' : 'text-slate-500'
                    }`}
                  >
                    Option {option.id} {isCorrect && '(Correct)'}
                  </span>
                </div>

                {/* Popularity/Metadata Weight */}
                <input
                  type="text"
                  value={option.metadata || ''}
                  onChange={(e) => {
                    e.stopPropagation(); // prevent setting correct option when editing metadata
                    onChangeOptionMetadata(option.id, e.target.value);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Weight (e.g. 25%)"
                  className={`w-24 text-right px-2 py-0.5 text-[10px] font-bold bg-transparent border-b border-transparent hover:border-slate-200 focus:border-blue-500 focus:outline-none transition-colors ${
                    isCorrect ? 'text-blue-700 placeholder:text-blue-300' : 'text-slate-500 placeholder:text-slate-300'
                  }`}
                />
              </div>

              {/* Text Input for the Choice */}
              <input
                type="text"
                value={option.text}
                onChange={(e) => onChangeOptionText(option.id, e.target.value)}
                onClick={(e) => e.stopPropagation()}
                placeholder={`Enter content for Option ${option.id}...`}
                className={`w-full px-3 py-1.5 bg-white border rounded-lg text-sm transition-all focus:outline-none ${
                  isCorrect
                    ? 'border-blue-200 text-blue-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                    : 'border-slate-200 text-slate-800 hover:border-slate-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                }`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
