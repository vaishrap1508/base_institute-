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
          className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 shadow-sm transition-all"
        />
      </div>

      {/* 2. Grid Filters */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-wrap items-end gap-4.5">
        {/* Domain Selection */}
        <div className="flex-1 min-w-[170px] flex flex-col gap-1.5">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Domain</span>
          <select
            value={selectedDomain}
            onChange={(e) => {
              setSelectedDomain(e.target.value);
              setSelectedSubTopic('All');
              setSelectedConcept('All');
            }}
            className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors hover:bg-slate-100/50"
          >
            <option value="All">All Domains</option>
            {DOMAINS_DATA.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        {/* Sub-Topic Selection */}
        <div className="flex-1 min-w-[170px] flex flex-col gap-1.5">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Sub-Topic</span>
          <select
            value={selectedSubTopic}
            onChange={(e) => {
              setSelectedSubTopic(e.target.value);
              setSelectedConcept('All');
            }}
            disabled={selectedDomain === 'All'}
            className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:enabled:bg-slate-100/50"
          >
            <option value="All">All Sub-topics</option>
            {activeSubTopics.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Concept Selection */}
        <div className="flex-1 min-w-[170px] flex flex-col gap-1.5">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Concept</span>
          <select
            value={selectedConcept}
            onChange={(e) => setSelectedConcept(e.target.value)}
            disabled={selectedSubTopic === 'All'}
            className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:enabled:bg-slate-100/50"
          >
            <option value="All">All Concepts</option>
            {activeConcepts.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Difficulty Selection */}
        <div className="flex-1 min-w-[140px] flex flex-col gap-1.5">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Difficulty</span>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors hover:bg-slate-100/50"
          >
            <option value="All">All Levels</option>
            <option value="EASY">EASY</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HARD">HARD</option>
          </select>
        </div>

        {/* Company Tags Selection */}
        <div className="flex-1 min-w-[140px] flex flex-col gap-1.5">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Company Tag</span>
          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors hover:bg-slate-100/50"
          >
            <option value="All">All Companies</option>
            {COMPANY_POOL.map((company) => (
              <option key={company} value={company}>{company}</option>
            ))}
          </select>
        </div>

        {/* Status Selection */}
        <div className="flex-1 min-w-[140px] flex flex-col gap-1.5">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Status</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors hover:bg-slate-100/50"
          >
            <option value="All">All Statuses</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
            <option value="Review Pending">Review Pending</option>
          </select>
        </div>

        {/* Action Button: Reset Filters */}
        <button
          onClick={onResetFilters}
          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 h-[38px] cursor-pointer shrink-0"
        >
          <FilterX className="w-3.5 h-3.5" />
          <span>Reset Filters</span>
        </button>
      </div>
    </div>
  );
}
