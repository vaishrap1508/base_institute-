'use client';

import React, { useState, useMemo } from 'react';
import { Search, Plus, FilterX, ChevronLeft, ChevronRight, HelpCircle, FileText, BarChart3, Settings, Copy, Check, FileSearch, X } from 'lucide-react';
import { Question, Domain, Difficulty } from '@/lib/admin/types';
import { DOMAINS_DATA, COMPANY_POOL } from '@/lib/admin/store';
import { generate16BitQuestionId, generate16BitBinaryId } from '@/lib/admin/idGenerator';

interface QuestionsManagementProps {
  questions: Question[];
  onAddQuestion: () => void;
  onEditQuestion: (q: Question) => void;
}

export default function QuestionsManagement({
  questions,
  onAddQuestion,
  onEditQuestion
}: QuestionsManagementProps) {
  // Filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [selectedSubTopic, setSelectedSubTopic] = useState('All');
  const [selectedConcept, setSelectedConcept] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedCompany, setSelectedCompany] = useState('All');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Decoder Modal State
  const [isDecoderOpen, setIsDecoderOpen] = useState(false);
  const [decodeInput, setDecodeInput] = useState('');

  // Helper: Get full domain name
  const getDomainFullName = (domId: string) => {
    const found = DOMAINS_DATA.find((d) => d.id === domId);
    return found ? found.name : domId;
  };

  // Helper: Get full sub-topic name
  const getSubTopicFullName = (domId: string, subId: string) => {
    const domain = DOMAINS_DATA.find((d) => d.id === domId);
    const sub = domain?.subTopics.find((s) => s.id === subId);
    return sub ? sub.name : subId;
  };

  // Helper: Get full concept name
  const getConceptFullName = (domId: string, subId: string, conId: string) => {
    const domain = DOMAINS_DATA.find((d) => d.id === domId);
    const sub = domain?.subTopics.find((s) => s.id === subId);
    const con = sub?.concepts.find((c) => c.id === conId);
    return con ? con.name : conId;
  };

  // Decoder Reverse Lookup Engine
  const decodedResult = useMemo(() => {
    if (!decodeInput.trim()) return null;
    const cleanInput = decodeInput.trim().replace(/-/g, '');
    
    const match = questions.find((q) => {
      const bId = q.questionBinaryId || generate16BitBinaryId(q.domainUuid || q.domainId, q.subTopicUuid || q.subTopicId, q.conceptUuid || q.conceptId, q.id, q.questionHashSeed || 0, undefined, questions);
      return bId.replace(/-/g, '') === cleanInput;
    });

    if (match) {
      return {
        found: true,
        question: match,
        domain: getDomainFullName(match.domainId),
        subTopic: getSubTopicFullName(match.domainId, match.subTopicId),
        concept: getConceptFullName(match.domainId, match.subTopicId, match.conceptId),
      };
    }

    return { found: false };
  }, [decodeInput, questions]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedDomain('All');
    setSelectedSubTopic('All');
    setSelectedConcept('All');
    setSelectedDifficulty('All');
    setSelectedCompany('All');
    setCurrentPage(1);
  };

  // Get active subtopics and concepts based on domain selection
  const activeSubTopics = useMemo(() => {
    if (selectedDomain === 'All') return [];
    const domain = DOMAINS_DATA.find((d) => d.id === selectedDomain);
    return domain ? domain.subTopics : [];
  }, [selectedDomain]);

  const activeConcepts = useMemo(() => {
    if (selectedSubTopic === 'All') return [];
    const subTopic = activeSubTopics.find((s) => s.id === selectedSubTopic);
    return subTopic ? subTopic.concepts : [];
  }, [selectedSubTopic, activeSubTopics]);

  // Adjust sub-topic/concept filters if domain changes
  const handleDomainChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDomain(e.target.value);
    setSelectedSubTopic('All');
    setSelectedConcept('All');
    setCurrentPage(1);
  };

  const handleSubTopicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSubTopic(e.target.value);
    setSelectedConcept('All');
    setCurrentPage(1);
  };

  // Filtered questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      // 1. Text Search Filter (Matches ID, stem, domainName, subTopicName, conceptName, or company tags)
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const binaryId = q.questionBinaryId || generate16BitBinaryId(q.domainUuid || q.domainId, q.subTopicUuid || q.subTopicId, q.conceptUuid || q.conceptId, q.id, q.questionHashSeed || 0, undefined, questions);
        const matchesBinaryId = binaryId.replace(/-/g, '').includes(query.replace(/-/g, '')) || binaryId.toLowerCase().includes(query);
        const matchesId = q.id.toLowerCase().includes(query) || matchesBinaryId;
        const matchesStem = q.questionStem.toLowerCase().includes(query);
        const matchesDomain = q.domainId.toLowerCase().includes(query);
        const matchesSubTopic = q.subTopicId.toLowerCase().includes(query);
        const matchesConcept = q.conceptId.toLowerCase().includes(query);
        const matchesCompanies = q.companyTags.some((c) => c.toLowerCase().includes(query));

        if (!matchesId && !matchesStem && !matchesDomain && !matchesSubTopic && !matchesConcept && !matchesCompanies) {
          return false;
        }
      }

      // 2. Domain Filter
      if (selectedDomain !== 'All' && q.domainId !== selectedDomain) {
        return false;
      }

      // 3. Sub-topic Filter
      if (selectedSubTopic !== 'All' && q.subTopicId !== selectedSubTopic) {
        return false;
      }

      // 4. Concept Filter
      if (selectedConcept !== 'All' && q.conceptId !== selectedConcept) {
        return false;
      }

      // 5. Difficulty Filter
      if (selectedDifficulty !== 'All' && q.difficulty !== selectedDifficulty) {
        return false;
      }

      // 6. Company Tag Filter
      if (selectedCompany !== 'All' && !q.companyTags.includes(selectedCompany)) {
        return false;
      }

      return true;
    });
  }, [questions, searchQuery, selectedDomain, selectedSubTopic, selectedConcept, selectedDifficulty, selectedCompany]);

  // Paginated questions
  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage) || 1;
  const paginatedQuestions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredQuestions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredQuestions, currentPage]);

  // Helpers for domain name formatting in UI
  const getDomainName = (id: string) => {
    const found = DOMAINS_DATA.find((d) => d.id === id);
    return found ? found.name.split(' ')[0].toUpperCase() : id.toUpperCase();
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-6">
      
      {/* 1. Header with title & Add button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Questions Management</h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Manage, organize, and monitor all questions across the repository.
          </p>
        </div>

        <button
          onClick={onAddQuestion}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4.5 py-2.5 text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer shrink-0 self-start md:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Add Question</span>
        </button>
      </div>

      {/* 2. Search & Filtering Card Controls */}
      <div className="space-y-4">
        {/* Search Input bar */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-4.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search questions by ID, topic, keywords, company tags..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-all"
          />
        </div>

        {/* Dropdown Filters row */}
        <div className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-sm flex flex-wrap items-end gap-4.5">
          {/* Domain Dropdown */}
          <div className="flex-1 min-w-[150px] flex flex-col gap-1.5">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Domain</span>
            <select
              value={selectedDomain}
              onChange={handleDomainChange}
              className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Domains</option>
              {DOMAINS_DATA.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Sub-Topic Dropdown */}
          <div className="flex-1 min-w-[150px] flex flex-col gap-1.5">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Sub-Topic</span>
            <select
              value={selectedSubTopic}
              onChange={handleSubTopicChange}
              disabled={selectedDomain === 'All'}
              className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="All">All Sub-topics</option>
              {activeSubTopics.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Concept Dropdown */}
          <div className="flex-1 min-w-[150px] flex flex-col gap-1.5">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Concept</span>
            <select
              value={selectedConcept}
              onChange={(e) => {
                setSelectedConcept(e.target.value);
                setCurrentPage(1);
              }}
              disabled={selectedSubTopic === 'All'}
              className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="All">All Concepts</option>
              {activeConcepts.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Difficulty Dropdown */}
          <div className="flex-1 min-w-[150px] flex flex-col gap-1.5">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Difficulty</span>
            <select
              value={selectedDifficulty}
              onChange={(e) => {
                setSelectedDifficulty(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Levels</option>
              <option value="EASY">EASY</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HARD">HARD</option>
            </select>
          </div>

          {/* Company Tag Dropdown */}
          <div className="flex-1 min-w-[150px] flex flex-col gap-1.5">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Company Tag</span>
            <select
              value={selectedCompany}
              onChange={(e) => {
                setSelectedCompany(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Companies</option>
              {COMPANY_POOL.map((company) => (
                <option key={company} value={company}>{company}</option>
              ))}
            </select>
          </div>

          {/* Reset Filters button */}
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 h-[34px] cursor-pointer"
          >
            <FilterX className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          {/* Admin Decoder Modal Button */}
          <button
            onClick={() => setIsDecoderOpen(true)}
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-650 hover:text-slate-800 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 h-[34px] cursor-pointer shadow-xs select-none"
          >
            <FileSearch className="w-3.5 h-3.5" />
            <span>Decode ID</span>
          </button>
        </div>
      </div>

      {/* 3. Questions Table Card Container */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {/* Responsive Table Frame Wrapper */}
        <div className="relative">
          {/* Responsive Table Frame */}
          <div className="overflow-x-auto overflow-y-scroll max-h-[380px] custom-scrollbar relative">
            <table className="w-full border-collapse text-left">
            <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-xs shadow-xs">
              <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">
                <th className="sticky top-0 bg-slate-50/95 backdrop-blur-xs z-10 px-6 py-4.5 w-32 border-b border-slate-200/80">Question ID</th>
                <th className="sticky top-0 bg-slate-50/95 backdrop-blur-xs z-10 px-6 py-4.5 min-w-[320px] border-b border-slate-200/80">Question Title / Preview</th>
                <th className="sticky top-0 bg-slate-50/95 backdrop-blur-xs z-10 px-6 py-4.5 w-36 border-b border-slate-200/80">Domain</th>
                <th className="sticky top-0 bg-slate-50/95 backdrop-blur-xs z-10 px-6 py-4.5 w-32 border-b border-slate-200/80">Difficulty</th>
                <th className="sticky top-0 bg-slate-50/95 backdrop-blur-xs z-10 px-6 py-4.5 w-44 border-b border-slate-200/80">Company Tags</th>
                <th className="sticky top-0 bg-slate-50/95 backdrop-blur-xs z-10 px-6 py-4.5 w-36 border-b border-slate-200/80">Created Date</th>
                <th className="sticky top-0 bg-slate-50/95 backdrop-blur-xs z-10 px-6 py-4.5 w-32 border-b border-slate-200/80">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {paginatedQuestions.length > 0 ? (
                paginatedQuestions.map((q) => (
                  <tr
                    key={q.id}
                    onClick={() => onEditQuestion(q)}
                    className="hover:bg-slate-50/60 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      {(() => {
                        const binaryId = q.questionBinaryId || generate16BitBinaryId(q.domainUuid || q.domainId, q.subTopicUuid || q.subTopicId, q.conceptUuid || q.conceptId, q.id, q.questionHashSeed || 0, undefined, questions);
                        return (
                          <div className="flex items-center gap-1.5 group/id relative">
                            <span 
                              className="bg-blue-50 border border-blue-100/50 text-blue-700 text-[10px] font-bold font-mono px-2 py-0.5 rounded tracking-wider transition-colors cursor-help group-hover/id:bg-blue-100/65 whitespace-nowrap"
                            >
                              {binaryId}
                            </span>
                            
                            {/* Detailed Taxonomical Hover Tooltip */}
                            <div className="absolute left-0 bottom-full mb-2 hidden group-hover/id:flex flex-col bg-slate-950 text-white text-[10px] font-medium p-2.5 rounded-lg shadow-xl border border-slate-800 z-35 min-w-[200px] leading-relaxed transition-all animate-in fade-in slide-in-from-bottom-1 pointer-events-none">
                              <span className="font-bold text-blue-400 border-b border-slate-800 pb-1 mb-1 block uppercase">ID Specs</span>
                              <div className="space-y-0.5">
                                <div><span className="text-slate-400 font-bold">Domain:</span> {getDomainFullName(q.domainId)}</div>
                                <div><span className="text-slate-400 font-bold">Sub-Topic:</span> {getSubTopicFullName(q.domainId, q.subTopicId)}</div>
                                <div><span className="text-slate-400 font-bold">Concept:</span> {getConceptFullName(q.domainId, q.subTopicId, q.conceptId)}</div>
                                <div><span className="text-slate-400 font-bold font-mono">Seed:</span> {q.questionHashSeed || 0}</div>
                                <div className="text-[9px] text-slate-500 font-mono mt-1 pt-1 border-t border-slate-900 break-all">UUID: {q.id}</div>
                              </div>
                            </div>

                            {/* Micro-interactive Copy Button */}
                            <CopyButton text={binaryId} />
                          </div>
                        );
                      })()}
                    </td>

                    {/* Preview Stem */}
                    <td className="px-6 py-4 font-semibold text-slate-800 text-xs">
                      <p className="line-clamp-2 max-w-xl group-hover:text-blue-600 transition-colors leading-relaxed">
                        {q.questionStem.replace(/[#$*`\n]/g, ' ').trim()}
                      </p>
                    </td>

                    {/* Domain */}
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">
                        {getDomainName(q.domainId)}
                      </span>
                    </td>

                    {/* Difficulty Badge */}
                    <td className="px-6 py-4">
                      {q.difficulty === 'EASY' ? (
                        <span className="bg-blue-50 border border-blue-100/60 text-blue-700 rounded-md px-2 py-0.5 text-[9px] font-extrabold tracking-wide uppercase">
                          Easy
                        </span>
                      ) : q.difficulty === 'MEDIUM' ? (
                        <span className="bg-amber-50 border border-amber-100/60 text-amber-700 rounded-md px-2 py-0.5 text-[9px] font-extrabold tracking-wide uppercase">
                          Medium
                        </span>
                      ) : (
                        <span className="bg-rose-50 border border-rose-100/60 text-rose-700 rounded-md px-2 py-0.5 text-[9px] font-extrabold tracking-wide uppercase">
                          Hard
                        </span>
                      )}
                    </td>

                    {/* Company Tags */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5 max-w-[160px]">
                        {q.companyTags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-slate-100 border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded text-[9px] font-extrabold tracking-wide"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Created Date */}
                    <td className="px-6 py-4 text-xs font-semibold text-slate-500">
                      {q.createdAt || 'Oct 01, 2023'}
                    </td>

                    {/* Status Dot & Badge */}
                    <td className="px-6 py-4">
                      {q.status === 'Draft' ? (
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          <span className="text-xs font-bold text-slate-500">Draft</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span className="text-xs font-bold text-emerald-700">Published</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-xs font-semibold text-slate-400 italic">
                    No questions found matching the filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Scrollbar cover next to the sticky header (placed after the scroll container to render on top of the scrollbar) */}
        <div className="absolute top-0 right-[1px] w-[10px] h-[51px] bg-slate-50 z-20 pointer-events-none" />
      </div>

        {/* Pagination bar footer */}
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-500">
          <div>
            Showing {filteredQuestions.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}–
            {Math.min(currentPage * itemsPerPage, filteredQuestions.length)} of {filteredQuestions.length} questions
          </div>

          <div className="flex items-center gap-1">
            {/* Previous page button */}
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Direct pages */}
            {Array.from({ length: totalPages }).map((_, index) => {
              const pageNum = index + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7.5 h-7.5 rounded-lg flex items-center justify-center border transition-all cursor-pointer ${
                    currentPage === pageNum
                      ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                      : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            {/* Next page button */}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      {/* Admin Decoder Modal Dialog */}
      {isDecoderOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col p-6 animate-in zoom-in-95 duration-200 relative">
            
            {/* Close Button */}
            <button
              onClick={() => {
                setIsDecoderOpen(false);
                setDecodeInput('');
              }}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <FileSearch className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 leading-tight">Admin Question ID Decoder</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Fixed 16-Bit Reverse Lookup</p>
              </div>
            </div>

            {/* Input Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Enter Binary Question ID
              </label>
              <input
                type="text"
                value={decodeInput}
                onChange={(e) => setDecodeInput(e.target.value)}
                placeholder="e.g. 0001-1010-1100-0101"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all uppercase"
                autoFocus
              />
            </div>

            {/* Decoded Output Panel */}
            <div className="mt-5 flex-1 min-h-[140px]">
              {decodeInput.trim() === '' ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Awaiting Input</span>
                  <p className="text-[11px] text-slate-400 font-medium max-w-[200px] mt-1 leading-relaxed">
                    Type or paste a 16-bit binary question ID to instantly reverse-lookup its metadata hierarchy.
                  </p>
                </div>
              ) : decodedResult?.found ? (
                <div className="border border-slate-200/90 rounded-xl p-4 bg-slate-50/30 space-y-3.5 text-xs font-semibold text-slate-500 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-slate-150 pb-2">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      ID Decoded Successfully
                    </span>
                    <span className="font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold">
                      {decodedResult.question ? (decodedResult.question.questionBinaryId || generate16BitBinaryId(decodedResult.question.domainUuid || decodedResult.question.domainId, decodedResult.question.subTopicUuid || decodedResult.question.subTopicId, decodedResult.question.conceptUuid || decodedResult.question.conceptId, decodedResult.question.id, decodedResult.question.questionHashSeed, undefined, questions)) : ''}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Domain</span>
                      <span className="text-slate-800 text-right max-w-[200px] truncate">{decodedResult.domain}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sub-Topic</span>
                      <span className="text-slate-800 text-right max-w-[200px] truncate">{decodedResult.subTopic}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Concept</span>
                      <span className="text-slate-800 text-right max-w-[200px] truncate">{decodedResult.concept}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Difficulty</span>
                      <span className="text-slate-800 uppercase">{decodedResult.question?.difficulty}</span>
                    </div>
                    <div className="flex flex-col bg-white p-2.5 rounded-lg border border-slate-100 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registry UUID</span>
                      <span className="text-[10px] font-mono text-slate-600 font-medium select-all break-all">{decodedResult.question?.id}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 border border-dashed border-rose-200 rounded-xl bg-rose-50/20">
                  <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">No Match Found</span>
                  <p className="text-[11px] text-rose-500/70 font-semibold max-w-[200px] mt-1 leading-relaxed">
                    This binary ID does not match any registered question in the database. Double-check your spelling or dashes.
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-2.5 border-t border-slate-150 pt-4">
              <button
                onClick={() => {
                  setIsDecoderOpen(false);
                  setDecodeInput('');
                }}
                className="px-4 py-2 border border-slate-200 hover:border-slate-300 text-slate-700 bg-white hover:bg-slate-50 font-bold rounded-xl text-xs shadow-xs transition-all cursor-pointer w-full text-center"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

// Micro-interactive Copy Button Component
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 opacity-0 group-hover/id:opacity-100 focus:opacity-100 transition-all duration-200 cursor-pointer"
      title="Copy binary ID"
    >
      {copied ? (
        <Check className="w-3 h-3 text-emerald-600" />
      ) : (
        <Copy className="w-3 h-3" />
      )}
    </button>
  );
}
