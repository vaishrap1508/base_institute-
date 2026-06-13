'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, Search, ChevronDown, Check } from 'lucide-react';
import { Difficulty } from '@/lib/admin/types';
import { COMPANY_POOL } from '@/lib/admin/store';

interface MetaSelectorsProps {
  difficulty: Difficulty;
  onChangeDifficulty: (diff: Difficulty) => void;
  selectedTags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
}

export default function MetaSelectors({
  difficulty,
  onChangeDifficulty,
  selectedTags,
  onAddTag,
  onRemoveTag
}: MetaSelectorsProps) {
  const [inputValue, setInputValue] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter recommendations from pool
  const filteredSuggestions = COMPANY_POOL.filter(
    (company) =>
      company.toLowerCase().includes(inputValue.toLowerCase()) &&
      !selectedTags.includes(company)
  );

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddTagInternal = (tag: string) => {
    if (tag.trim() && !selectedTags.includes(tag.trim())) {
      onAddTag(tag.trim());
    }
    setInputValue('');
    setIsDropdownOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        handleAddTagInternal(inputValue.trim());
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 bg-white dark:bg-slate-900 p-5 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm h-full">
      {/* Difficulty Level Selector */}
      <div className="flex flex-col gap-2.5">
        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Difficulty Level
        </label>
        <div className="grid grid-cols-3 gap-2">
          {/* Easy Button */}
          <button
            type="button"
            onClick={() => onChangeDifficulty('EASY')}
            className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all duration-150 ${
              difficulty === 'EASY'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-bold shadow-sm shadow-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-400 dark:shadow-none'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            EASY
          </button>

          {/* Medium Button */}
          <button
            type="button"
            onClick={() => onChangeDifficulty('MEDIUM')}
            className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all duration-150 ${
              difficulty === 'MEDIUM'
                ? 'bg-amber-50 border-amber-300 text-amber-700 font-bold shadow-sm shadow-amber-100 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-400 dark:shadow-none'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            MEDIUM
          </button>

          {/* Hard Button */}
          <button
            type="button"
            onClick={() => onChangeDifficulty('HARD')}
            className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all duration-150 ${
              difficulty === 'HARD'
                ? 'bg-rose-50 border-rose-300 text-rose-700 font-bold shadow-sm shadow-rose-100 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-400 dark:shadow-none'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            HARD
          </button>
        </div>
      </div>

      {/* Company Tag Autocomplete System */}
      <div className="flex flex-col gap-2.5 relative" ref={dropdownRef}>
        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Company Tags
        </label>

        {/* Input Field with Dropdown Toggle */}
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Add companies (e.g. TCS, Amazon)"
            className="w-full px-3.5 py-2 pr-9 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
          <ChevronDown
            className="w-4 h-4 text-slate-400 absolute right-3 cursor-pointer"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          />
        </div>

        {/* Dynamic Autocomplete Dropdown List */}
        {isDropdownOpen && (inputValue.trim() || filteredSuggestions.length > 0) && (
          <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 py-1">
            {filteredSuggestions.map((company) => (
              <button
                type="button"
                key={company}
                onClick={() => handleAddTagInternal(company)}
                className="w-full flex items-center justify-between px-3.5 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-left font-medium"
              >
                <span>{company}</span>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-950 px-1.5 py-0.5 rounded font-mono">
                  Database
                </span>
              </button>
            ))}

            {inputValue.trim() && !COMPANY_POOL.includes(inputValue.trim()) && (
              <button
                type="button"
                onClick={() => handleAddTagInternal(inputValue)}
                className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-left font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add custom tag "{inputValue}"</span>
              </button>
            )}

            {filteredSuggestions.length === 0 && !inputValue.trim() && (
              <div className="px-3.5 py-2 text-xs text-slate-400 dark:text-slate-500 text-center font-medium">
                No suggestions remaining
              </div>
            )}
          </div>
        )}

        {/* Selected Tags list */}
        <div className="flex flex-wrap gap-1.5 mt-1 min-h-[32px]">
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 px-2.5 py-1 bg-slate-100/90 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-200/80 dark:hover:bg-slate-700 border border-slate-200/50 dark:border-slate-700/50 rounded-full text-xs font-semibold tracking-tight transition-colors duration-100 cursor-default"
            >
              {tag}
              <button
                type="button"
                onClick={() => onRemoveTag(tag)}
                className="hover:bg-slate-300/80 dark:hover:bg-slate-700/80 p-0.5 rounded-full text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {selectedTags.length === 0 && (
            <span className="text-xs text-slate-400 dark:text-slate-500 italic flex items-center">
              No target tags selected. Added questions will target general exams.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
