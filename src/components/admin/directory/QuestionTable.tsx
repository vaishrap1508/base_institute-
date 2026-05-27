'use client';

import React, { useState, useMemo } from 'react';
import { ArrowUpDown, Edit3, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Copy, Check, FileSearch, X } from 'lucide-react';
import { Question } from '@/lib/admin/types';
import { DOMAINS_DATA } from '@/lib/admin/store';
import { generate16BitQuestionId, generate16BitBinaryId } from '@/lib/admin/idGenerator';

interface QuestionTableProps {
  questions: Question[];
  onEditQuestion: (q: Question) => void;
}

type SortField = 'id' | 'stem' | 'domain' | 'difficulty' | 'date' | 'status';
type SortOrder = 'asc' | 'desc';

export default function QuestionTable({ questions, onEditQuestion }: QuestionTableProps) {
  // Sorting State
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Decoder Modal State
  const [isDecoderOpen, setIsDecoderOpen] = useState(false);
  const [decodeInput, setDecodeInput] = useState('');

  // Helper: Format domain code to friendly readable name
  const getDomainName = (id: string) => {
    const found = DOMAINS_DATA.find((d) => d.id === id);
    return found ? found.name.split(' ')[0].toUpperCase() : id.toUpperCase();
  };

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

  // Helper: Get numeric weights for sorting difficulty
  const getDifficultyWeight = (diff: string) => {
    switch (diff.toUpperCase()) {
      case 'EASY': return 1;
      case 'MEDIUM': return 2;
      case 'HARD': return 3;
      default: return 0;
    }
  };

  // Handle Sort Toggle
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1); // Reset to first page on sort change
  };

  // Render Sort Header Indicator
  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 ml-1.5 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" />;
    }
    return sortOrder === 'asc' 
      ? <ArrowUp className="w-3.5 h-3.5 ml-1.5 text-blue-600 shrink-0" />
      : <ArrowDown className="w-3.5 h-3.5 ml-1.5 text-blue-600 shrink-0" />;
  };

  // Process Sorting
  const sortedQuestions = useMemo(() => {
    const items = [...questions];
    return items.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'id':
          comparison = a.id.localeCompare(b.id);
          break;
        case 'stem':
          comparison = a.questionStem.localeCompare(b.questionStem);
          break;
        case 'domain':
          comparison = getDomainName(a.domainId).localeCompare(getDomainName(b.domainId));
          break;
        case 'difficulty':
          comparison = getDifficultyWeight(a.difficulty) - getDifficultyWeight(b.difficulty);
          break;
        case 'date':
          const dateA = new Date(a.createdAt || 'Jan 01, 2023').getTime();
          const dateB = new Date(b.createdAt || 'Jan 01, 2023').getTime();
          comparison = dateA - dateB;
          break;
        case 'status':
          const statusA = a.status || 'Draft';
          const statusB = b.status || 'Draft';
          comparison = statusA.localeCompare(statusB);
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [questions, sortField, sortOrder]);

  // Process Pagination
  const totalPages = Math.ceil(sortedQuestions.length / itemsPerPage) || 1;
  const paginatedQuestions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedQuestions.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedQuestions, currentPage]);

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden flex flex-col">
      {/* Table Title Row */}
      <div className="px-6 py-4 border-b border-slate-150 flex items-center justify-between bg-slate-50/30">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
          <span className="text-xs font-bold text-slate-800 tracking-tight">
            Listing {questions.length} total active matches
          </span>
        </div>

        {/* Admin Decoder Modal Trigger Button */}
        <button
          onClick={() => setIsDecoderOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-650 hover:text-slate-800 rounded-lg text-[11px] font-bold shadow-xs transition-all cursor-pointer select-none"
        >
          <FileSearch className="w-3.5 h-3.5" />
          <span>Decode 16-Bit ID</span>
        </button>
      </div>

      {/* Responsive Table Frame Wrapper */}
      <div className="relative">
        {/* Responsive Table Frame */}
        <div className="overflow-x-auto overflow-y-scroll max-h-[380px] custom-scrollbar relative">
          <table className="w-full border-collapse text-left">
          <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-xs shadow-xs">
            <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider select-none">
              {/* Question ID Header */}
              <th 
                onClick={() => handleSort('id')} 
                className="sticky top-0 bg-slate-50/95 backdrop-blur-xs z-10 px-6 py-4.5 w-32 cursor-pointer hover:bg-slate-100/50 group transition-colors border-b border-slate-200/80"
              >
                <div className="flex items-center">
                  <span>Question ID</span>
                  {renderSortIndicator('id')}
                </div>
              </th>

              {/* Question Title / Preview Header */}
              <th 
                onClick={() => handleSort('stem')} 
                className="sticky top-0 bg-slate-50/95 backdrop-blur-xs z-10 px-6 py-4.5 min-w-[320px] cursor-pointer hover:bg-slate-100/50 group transition-colors border-b border-slate-200/80"
              >
                <div className="flex items-center">
                  <span>Question Preview</span>
                  {renderSortIndicator('stem')}
                </div>
              </th>

              {/* Domain Header */}
              <th 
                onClick={() => handleSort('domain')} 
                className="sticky top-0 bg-slate-50/95 backdrop-blur-xs z-10 px-6 py-4.5 w-36 cursor-pointer hover:bg-slate-100/50 group transition-colors border-b border-slate-200/80"
              >
                <div className="flex items-center">
                  <span>Domain</span>
                  {renderSortIndicator('domain')}
                </div>
              </th>

              {/* Difficulty Header */}
              <th 
                onClick={() => handleSort('difficulty')} 
                className="sticky top-0 bg-slate-50/95 backdrop-blur-xs z-10 px-6 py-4.5 w-32 cursor-pointer hover:bg-slate-100/50 group transition-colors border-b border-slate-200/80"
              >
                <div className="flex items-center">
                  <span>Difficulty</span>
                  {renderSortIndicator('difficulty')}
                </div>
              </th>

              {/* Company Tags Header */}
              <th className="sticky top-0 bg-slate-50/95 backdrop-blur-xs z-10 px-6 py-4.5 w-44 border-b border-slate-200/80">
                <span>Company Tags</span>
              </th>

              {/* Created Date Header */}
              <th 
                onClick={() => handleSort('date')} 
                className="sticky top-0 bg-slate-50/95 backdrop-blur-xs z-10 px-6 py-4.5 w-36 cursor-pointer hover:bg-slate-100/50 group transition-colors border-b border-slate-200/80"
              >
                <div className="flex items-center">
                  <span>Created Date</span>
                  {renderSortIndicator('date')}
                </div>
              </th>

              {/* Status Header */}
              <th 
                onClick={() => handleSort('status')} 
                className="sticky top-0 bg-slate-50/95 backdrop-blur-xs z-10 px-6 py-4.5 w-32 cursor-pointer hover:bg-slate-100/50 group transition-colors border-b border-slate-200/80"
              >
                <div className="flex items-center">
                  <span>Status</span>
                  {renderSortIndicator('status')}
                </div>
              </th>

              {/* Actions Column */}
              <th className="sticky top-0 bg-slate-50/95 backdrop-blur-xs z-10 px-6 py-4.5 w-16 text-center border-b border-slate-200/80">
                <span>Action</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-150">
            {paginatedQuestions.length > 0 ? (
              paginatedQuestions.map((q) => (
                <tr
                  key={q.id}
                  onClick={() => onEditQuestion(q)}
                  className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                >
                  {/* Question ID */}
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
                    ) : q.status === 'Published' ? (
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-bold text-emerald-700">Published</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span className="text-xs font-bold text-amber-700">Review Pending</span>
                      </div>
                    )}
                  </td>

                  {/* Hover Edit Action Icon */}
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <button 
                        className="p-1.5 rounded bg-slate-50 border border-slate-200/80 text-slate-400 group-hover:text-blue-600 group-hover:border-blue-200 group-hover:bg-blue-50/50 transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditQuestion(q);
                        }}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-16 text-center text-xs font-semibold text-slate-400 italic bg-slate-50/10">
                  No questions found matching your filter criteria. Try updating search text or filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Scrollbar cover next to the sticky header (placed after the scroll container to render on top of the scrollbar) */}
      <div className="absolute top-0 right-[1px] w-[10px] h-[51px] bg-slate-50 z-20 pointer-events-none" />
    </div>

      {/* Advanced Ellipsis-Enabled Pagination Footer */}
      {totalPages > 1 && (
        <div className="px-6 py-4.5 bg-slate-50/30 border-t border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-500 select-none">
          <div>
            Showing {questions.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}–
            {Math.min(currentPage * itemsPerPage, sortedQuestions.length)} of {sortedQuestions.length} questions
          </div>

          <div className="flex items-center gap-1">
            {/* Previous Page */}
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors cursor-pointer text-slate-500"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Direct Pages with Ellipsis */}
            {getPageNumbers(currentPage, totalPages).map((page, idx) => {
              if (page === '...') {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="w-7.5 h-7.5 flex items-center justify-center text-slate-400 font-bold"
                  >
                    ...
                  </span>
                );
              }

              return (
                <button
                  key={`page-${page}`}
                  onClick={() => setCurrentPage(page as number)}
                  className={`w-7.5 h-7.5 rounded-lg flex items-center justify-center border transition-all cursor-pointer font-bold ${
                    currentPage === page
                      ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                      : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {page}
                </button>
              );
            })}

            {/* Next Page */}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors cursor-pointer text-slate-500"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
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

// Advanced Pagination Helper (Numbers + ellipsis + arrows)
function getPageNumbers(currentPage: number, totalPages: number) {
  const pages: (number | string)[] = [];
  
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, '...', totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
  }
  
  return pages;
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
