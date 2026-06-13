'use client';

import React, { useMemo } from 'react';
import { Search, FilterX } from 'lucide-react';
import { DOMAINS_DATA, COMPANY_POOL } from '@/lib/admin/store';

interface FilterDropdownsProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedDomain: string;
  setSelectedDomain: (d: string) => void;
  selectedSubTopic: string;
  setSelectedSubTopic: (s: string) => void;
  selectedConcept: string;
  setSelectedConcept: (c: string) => void;
  selectedDifficulty: string;
  setSelectedDifficulty: (diff: string) => void;
  selectedCompany: string;
  setSelectedCompany: (comp: string) => void;
  selectedStatus: string;
  setSelectedStatus: (stat: string) => void;
  onResetFilters: () => void;
}

export default function FilterDropdowns({
  searchQuery,
  setSearchQuery,
  selectedDomain,
  setSelectedDomain,
  selectedSubTopic,
  setSelectedSubTopic,
  selectedConcept,
  setSelectedConcept,
  selectedDifficulty,
  setSelectedDifficulty,
  selectedCompany,
  setSelectedCompany,
  selectedStatus,
  setSelectedStatus,
  onResetFilters,
}: FilterDropdownsProps) {
  // Cascading logic: Get active sub-topics based on domain
  const activeSubTopics = useMemo(() => {
    if (selectedDomain === 'All') return [];
    const domain = DOMAINS_DATA.find((d) => d.id === selectedDomain);
    return domain ? domain.subTopics : [];
  }, [selectedDomain]);

  // Cascading logic: Get active concepts based on sub-topic
  const activeConcepts = useMemo(() => {
    if (selectedSubTopic === 'All') return [];
    const subTopic = activeSubTopics.find((s) => s.id === selectedSubTopic);
    return subTopic ? subTopic.concepts : [];
  }, [selectedSubTopic, activeSubTopics]);

  return (
    <div className="space-y-4">
      {/* 1. Search Bar */}
      <div className="relative w-full">
        <Search className="w-5 h-5 text-slate-400 absolute left-4.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search questions, concepts, IDs, or company tags..."
          className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-950 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 shadow-sm transition-all"
        />
      </div>

      {/* 2. Grid Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-wrap items-end gap-4.5">
        {/* Domain Selection */}
        <div className="flex-1 min-w-[170px] flex flex-col gap-1.5">
          <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Domain</span>
          <select
            value={selectedDomain}
            onChange={(e) => {
              setSelectedDomain(e.target.value);
              setSelectedSubTopic('All');
              setSelectedConcept('All');
            }}
            className="w-full text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-lg px-3 py-2.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors hover:bg-slate-100/50 dark:hover:bg-slate-900"
          >
            <option value="All" className="dark:bg-slate-950">All Domains</option>
            {DOMAINS_DATA.map((d) => (
              <option key={d.id} value={d.id} className="dark:bg-slate-950">{d.name}</option>
            ))}
          </select>
        </div>

        {/* Sub-Topic Selection */}
        <div className="flex-1 min-w-[170px] flex flex-col gap-1.5">
          <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Sub-Topic</span>
          <select
            value={selectedSubTopic}
            onChange={(e) => {
              setSelectedSubTopic(e.target.value);
              setSelectedConcept('All');
            }}
            disabled={selectedDomain === 'All'}
            className="w-full text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-lg px-3 py-2.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:enabled:bg-slate-100/50 dark:hover:enabled:bg-slate-900"
          >
            <option value="All" className="dark:bg-slate-950">All Sub-topics</option>
            {activeSubTopics.map((s) => (
              <option key={s.id} value={s.id} className="dark:bg-slate-950">{s.name}</option>
            ))}
          </select>
        </div>

        {/* Concept Selection */}
        <div className="flex-1 min-w-[170px] flex flex-col gap-1.5">
          <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Concept</span>
          <select
            value={selectedConcept}
            onChange={(e) => setSelectedConcept(e.target.value)}
            disabled={selectedSubTopic === 'All'}
            className="w-full text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-lg px-3 py-2.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:enabled:bg-slate-100/50 dark:hover:enabled:bg-slate-900"
          >
            <option value="All" className="dark:bg-slate-950">All Concepts</option>
            {activeConcepts.map((c) => (
              <option key={c.id} value={c.id} className="dark:bg-slate-950">{c.name}</option>
            ))}
          </select>
        </div>

        {/* Difficulty Selection */}
        <div className="flex-1 min-w-[140px] flex flex-col gap-1.5">
          <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Difficulty</span>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="w-full text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-lg px-3 py-2.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors hover:bg-slate-100/50 dark:hover:bg-slate-900"
          >
            <option value="All" className="dark:bg-slate-950">All Levels</option>
            <option value="EASY" className="dark:bg-slate-950">EASY</option>
            <option value="MEDIUM" className="dark:bg-slate-950">MEDIUM</option>
            <option value="HARD" className="dark:bg-slate-950">HARD</option>
          </select>
        </div>

        {/* Company Tags Selection */}
        <div className="flex-1 min-w-[140px] flex flex-col gap-1.5">
          <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Company Tag</span>
          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="w-full text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-lg px-3 py-2.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors hover:bg-slate-100/50 dark:hover:bg-slate-900"
          >
            <option value="All" className="dark:bg-slate-950">All Companies</option>
            {COMPANY_POOL.map((company) => (
              <option key={company} value={company} className="dark:bg-slate-950">{company}</option>
            ))}
          </select>
        </div>

        {/* Status Selection */}
        <div className="flex-1 min-w-[140px] flex flex-col gap-1.5">
          <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Status</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-lg px-3 py-2.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors hover:bg-slate-100/50 dark:hover:bg-slate-900"
          >
            <option value="All" className="dark:bg-slate-950">All Statuses</option>
            <option value="Published" className="dark:bg-slate-950">Published</option>
            <option value="Draft" className="dark:bg-slate-950">Draft</option>
            <option value="Review Pending" className="dark:bg-slate-950">Review Pending</option>
          </select>
        </div>

        {/* Action Button: Reset Filters */}
        <button
          onClick={onResetFilters}
          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 h-[38px] cursor-pointer shrink-0"
        >
          <FilterX className="w-3.5 h-3.5" />
          <span>Reset Filters</span>
        </button>
      </div>
    </div>
  );
}
