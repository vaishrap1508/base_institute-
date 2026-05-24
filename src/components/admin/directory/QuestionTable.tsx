'use client';

import React, { useState, useMemo } from 'react';
import { ArrowUpDown, ChevronLeft, ChevronRight, Edit3, ArrowUp, ArrowDown } from 'lucide-react';
import { Question } from '@/lib/admin/types';
import { DOMAINS_DATA } from '@/lib/admin/store';

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
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Helper: Format domain code to friendly readable name
  const getDomainName = (id: string) => {
    const found = DOMAINS_DATA.find((d) => d.id === id);
    return found ? found.name.split(' ')[0].toUpperCase() : id.toUpperCase();
  };

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
  }, [sortedQuestions, currentPage, itemsPerPage]);

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden flex flex-col">
      {/* Table Title and Pagination Page Selector Row */}
      <div className="px-6 py-4 border-b border-slate-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/30">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
          <span className="text-xs font-bold text-slate-800 tracking-tight">
            Listing {questions.length} total active matches
          </span>
        </div>

        {/* Rows per page controller */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span>Rows per page:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="text-xs font-bold bg-white border border-slate-200 rounded px-1.5 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Responsive Table Frame */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-200 text-[10px] font-bold text-slate-600 uppercase tracking-wider select-none">
              {/* Question ID Header */}
              <th 
                onClick={() => handleSort('id')} 
                className="px-6 py-4.5 w-32 cursor-pointer hover:bg-slate-100/50 group transition-colors"
              >
                <div className="flex items-center">
                  <span>Question ID</span>
                  {renderSortIndicator('id')}
                </div>
              </th>

              {/* Question Title / Preview Header */}
              <th 
                onClick={() => handleSort('stem')} 
                className="px-6 py-4.5 min-w-[320px] cursor-pointer hover:bg-slate-100/50 group transition-colors"
              >
                <div className="flex items-center">
                  <span>Question Preview</span>
                  {renderSortIndicator('stem')}
                </div>
              </th>

              {/* Domain Header */}
              <th 
                onClick={() => handleSort('domain')} 
                className="px-6 py-4.5 w-36 cursor-pointer hover:bg-slate-100/50 group transition-colors"
              >
                <div className="flex items-center">
                  <span>Domain</span>
                  {renderSortIndicator('domain')}
                </div>
              </th>

              {/* Difficulty Header */}
              <th 
                onClick={() => handleSort('difficulty')} 
                className="px-6 py-4.5 w-32 cursor-pointer hover:bg-slate-100/50 group transition-colors"
              >
                <div className="flex items-center">
                  <span>Difficulty</span>
                  {renderSortIndicator('difficulty')}
                </div>
              </th>

              {/* Company Tags Header */}
              <th className="px-6 py-4.5 w-44">
                <span>Company Tags</span>
              </th>

              {/* Created Date Header */}
              <th 
                onClick={() => handleSort('date')} 
                className="px-6 py-4.5 w-36 cursor-pointer hover:bg-slate-100/50 group transition-colors"
              >
                <div className="flex items-center">
                  <span>Created Date</span>
                  {renderSortIndicator('date')}
                </div>
              </th>

              {/* Status Header */}
              <th 
                onClick={() => handleSort('status')} 
                className="px-6 py-4.5 w-32 cursor-pointer hover:bg-slate-100/50 group transition-colors"
              >
                <div className="flex items-center">
                  <span>Status</span>
                  {renderSortIndicator('status')}
                </div>
              </th>

              {/* Actions Column */}
              <th className="px-6 py-4.5 w-16 text-center">
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
                    <span className="bg-blue-50 border border-blue-100/50 text-blue-700 text-[11px] font-bold font-mono px-2 py-0.5 rounded tracking-wide group-hover:bg-blue-100/65 transition-colors">
                      {q.id}
                    </span>
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

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="px-6 py-4.5 bg-slate-50/30 border-t border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-500">
          <div>
            Showing {questions.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}–
            {Math.min(currentPage * itemsPerPage, questions.length)} of {questions.length} questions
          </div>

          <div className="flex items-center gap-1">
            {/* Previous Page */}
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Direct Pages */}
            {Array.from({ length: totalPages }).map((_, index) => {
              const pageNum = index + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7.5 h-7.5 rounded-lg flex items-center justify-center border transition-all cursor-pointer ${
                    currentPage === pageNum
                      ? 'bg-blue-600 border-blue-600 text-white shadow-sm font-bold'
                      : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            {/* Next Page */}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
