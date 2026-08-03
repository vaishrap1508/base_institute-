'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Download, Library, CheckCircle2, FileText, ShieldAlert, Lock, RefreshCw, ArrowRight, Compass } from 'lucide-react';

// Custom Components
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';
import RoleToggle from '@/components/RoleToggle';
import FilterDropdowns from '@/components/admin/directory/FilterDropdowns';
import QuestionTable from '@/components/admin/directory/QuestionTable';

// Stores & Types
import { DOMAINS_DATA, USER_ROLES, SAMPLE_QUESTIONS } from '@/lib/admin/store';
import { UserRole, Question } from '@/lib/admin/types';
import { supabase } from '@/lib/supabase';
import { generate16BitQuestionId, generate16BitBinaryId } from '@/lib/admin/idGenerator';

export default function QuestionDirectoryPage() {
  const router = useRouter();

  // Navigation & Role states (matches editor page)
  const [currentRole, setCurrentRole] = useState<UserRole>(USER_ROLES[0]); // Default: Admin

  // Question Store State (localStorage synced)
  const [questions, setQuestions] = useState<Question[]>([]);

  // Filter States (declared first to avoid hoisting compile errors in hooks)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [selectedSubTopic, setSelectedSubTopic] = useState('All');
  const [selectedConcept, setSelectedConcept] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedCompany, setSelectedCompany] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Reset Filters Handler
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedDomain('All');
    setSelectedSubTopic('All');
    setSelectedConcept('All');
    setSelectedDifficulty('All');
    setSelectedCompany('All');
    setSelectedStatus('All');
  };

  const [isLoading, setIsLoading] = useState(true);
  const [dbSource, setDbSource] = useState<'Supabase Cloud' | 'Local Storage Sandbox'>('Supabase Cloud');

  const loadQuestions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('questions')
        .select(`
          id,
          question_hash_seed,
          difficulty,
          question_text,
          options,
          explanation,
          video_url,
          is_active,
          concept:concepts (
            id,
            name,
            sub_topic:sub_topics (
              id,
              name,
              domain:domains (id, name)
            )
          ),
          tags:question_companies (
            company:companies (name)
          )
        `)
        .limit(200);

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        const mappedQuestions: Question[] = data.map((q: any) => {
          const domainName = q.concept?.sub_topic?.domain?.name || '';
          const subTopicName = q.concept?.sub_topic?.name || '';
          const conceptName = q.concept?.name || '';

          const domainUuid = q.concept?.sub_topic?.domain?.id || '';
          const subTopicUuid = q.concept?.sub_topic?.id || '';
          const conceptUuid = q.concept?.id || '';

          let resolvedDomainId = 'quant';
          let resolvedSubTopicId = 'arithmetic';
          let resolvedConceptId = 'percentages';

          const domainMatch = DOMAINS_DATA.find(d => d.name === domainName || d.id === domainName);
          if (domainMatch) {
            resolvedDomainId = domainMatch.id;
            const subTopicMatch = domainMatch.subTopics.find(s => s.name === subTopicName || s.id === subTopicName);
            if (subTopicMatch) {
              resolvedSubTopicId = subTopicMatch.id;
              const conceptMatch = subTopicMatch.concepts.find(c => c.name === conceptName || c.id === conceptName);
              if (conceptMatch) {
                resolvedConceptId = conceptMatch.id;
              }
            }
          } else {
            resolvedDomainId = domainName.toLowerCase().replace(/[^a-z0-9]/g, '-');
            resolvedSubTopicId = subTopicName.toLowerCase().replace(/[^a-z0-9]/g, '-');
            resolvedConceptId = conceptName.toLowerCase().replace(/[^a-z0-9]/g, '-');
          }

          return {
            id: q.id,
            trackingId: q.tracking_id || undefined,
            questionBinaryId: q.id,
            questionInternalUuid: q.id,
            questionHashSeed: q.question_hash_seed || 0,
            domainUuid,
            subTopicUuid,
            conceptUuid,
            domainId: resolvedDomainId,
            subTopicId: resolvedSubTopicId,
            conceptId: resolvedConceptId,
            difficulty: q.difficulty || 'MEDIUM',
            companyTags: q.tags?.map((t: any) => t.company?.name).filter(Boolean) || [],
            shuffleOptions: true,
            questionStem: q.question_text || '',
            hintText: q.explanation || '',
            options: Array.isArray(q.options) 
              ? q.options.map((opt: any, index: number) => ({
                  id: opt.id || String.fromCharCode(65 + index),
                  text: opt.text || '',
                  isCorrect: opt.isCorrect || (opt.text === q.correct_answer),
                  metadata: opt.metadata || ''
                }))
              : [],
            videoUrl: q.video_url || '',
            status: q.is_active ? 'Published' : 'Draft',
            createdAt: 'Synced'
          };
        });

        setQuestions(mappedQuestions);
        setDbSource('Supabase Cloud');
      } else {
        const stored = localStorage.getItem('aptitude_questions');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            const parsedIds = new Set(parsed.map((q: any) => q.id));
            const missing = SAMPLE_QUESTIONS.filter(q => !parsedIds.has(q.id));
            if (missing.length > 0) {
              const merged = [...parsed, ...missing];
              localStorage.setItem('aptitude_questions', JSON.stringify(merged));
              setQuestions(merged);
            } else {
              setQuestions(parsed);
            }
          } catch (e) {
            setQuestions(SAMPLE_QUESTIONS);
          }
        } else {
          setQuestions(SAMPLE_QUESTIONS);
          localStorage.setItem('aptitude_questions', JSON.stringify(SAMPLE_QUESTIONS));
        }
        setDbSource('Local Storage Sandbox');
      }
    } catch (err) {
      console.warn('Failed to load questions from Supabase, falling back to local storage', err);
      const stored = localStorage.getItem('aptitude_questions');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const parsedIds = new Set(parsed.map((q: any) => q.id));
          const missing = SAMPLE_QUESTIONS.filter(q => !parsedIds.has(q.id));
          if (missing.length > 0) {
            const merged = [...parsed, ...missing];
            localStorage.setItem('aptitude_questions', JSON.stringify(merged));
            setQuestions(merged);
          } else {
            setQuestions(parsed);
          }
        } catch (e) {
          setQuestions(SAMPLE_QUESTIONS);
        }
      } else {
        setQuestions(SAMPLE_QUESTIONS);
      }
      setDbSource('Local Storage Sandbox');
    } finally {
      setIsLoading(false);
    }
  };

  // Load questions and current role on mount
  useEffect(() => {
    // 1. Fetch questions catalog
    loadQuestions();

    // 2. Load current role
    const storedRole = localStorage.getItem('aptitude_current_role');
    if (storedRole) {
      try {
        const parsed = JSON.parse(storedRole);
        const matched = USER_ROLES.find(r => r.role === parsed.role);
        if (matched) {
          setCurrentRole(matched);
        }
      } catch (e) {
        console.warn('Failed to parse current role', e);
      }
    }

    // 3. Load status filter from query params
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlStatus = params.get('status');
      if (urlStatus) {
        setSelectedStatus(urlStatus);
      }
    }
  }, []);

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    localStorage.setItem('aptitude_current_role', JSON.stringify(role));
  };

  // Compute active sidebar identifier based on active filters
  const sidebarActiveId = useMemo(() => {
    if (selectedStatus === 'Draft') return 'drafts';
    if (selectedStatus === 'Review Pending') return 'review';
    return 'directory';
  }, [selectedStatus]);

  // Filter Questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      // 1. Text Search Filter (matches ID, stem, difficulty, domain name, sub-topic name, concept name, status, and tags)
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const binaryId = q.questionBinaryId || generate16BitBinaryId(q.domainUuid || q.domainId, q.subTopicUuid || q.subTopicId, q.conceptUuid || q.conceptId, q.id, q.questionHashSeed || 0, undefined, questions);
        const matchesBinaryId = binaryId.replace(/-/g, '').includes(query.replace(/-/g, '')) || binaryId.toLowerCase().includes(query);
        const matchesId = q.id.toLowerCase().includes(query) || matchesBinaryId;
        const matchesStem = q.questionStem.toLowerCase().includes(query);

        // Resolve display names
        const domain = DOMAINS_DATA.find((d) => d.id === q.domainId);
        const subTopic = domain?.subTopics.find((s) => s.id === q.subTopicId);
        const concept = subTopic?.concepts.find((c) => c.id === q.conceptId);

        const matchesDomain = (domain?.name || '').toLowerCase().includes(query) || q.domainId.toLowerCase().includes(query);
        const matchesSubTopic = (subTopic?.name || '').toLowerCase().includes(query) || q.subTopicId.toLowerCase().includes(query);
        const matchesConcept = (concept?.name || '').toLowerCase().includes(query) || q.conceptId.toLowerCase().includes(query);

        const matchesStatus = (q.status || 'Draft').toLowerCase().includes(query);
        const matchesCompanies = q.companyTags.some((c) => c.toLowerCase().includes(query));
        const matchesDifficulty = q.difficulty.toLowerCase().includes(query);

        if (
          !matchesId &&
          !matchesStem &&
          !matchesDomain &&
          !matchesSubTopic &&
          !matchesConcept &&
          !matchesCompanies &&
          !matchesStatus &&
          !matchesDifficulty
        ) {
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

      // 7. Status Filter
      const qStatus = q.status || 'Draft';
      if (selectedStatus !== 'All' && qStatus !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [questions, searchQuery, selectedDomain, selectedSubTopic, selectedConcept, selectedDifficulty, selectedCompany, selectedStatus]);

  // Dashboard Stats Calculations
  const stats = useMemo(() => {
    const total = filteredQuestions.length;
    const published = filteredQuestions.filter(q => q.status === 'Published').length;
    const draft = filteredQuestions.filter(q => q.status === 'Draft' || !q.status).length;

    // Unique concepts covered in filtered subset
    const uniqueConcepts = new Set(filteredQuestions.map(q => q.conceptId));

    return {
      total,
      published,
      draft,
      conceptsCount: uniqueConcepts.size
    };
  }, [filteredQuestions]);

  // Navigate to Dynamic Content Creator to EDIT a question
  const handleEditQuestion = (q: Question) => {
    router.push(`/admin/editor?id=${q.id}`);
  };

  // Navigate to Dynamic Content Creator to ADD a fresh question
  const handleAddQuestion = () => {
    router.push('/admin/editor?new=true');
  };

  // Export Catalog Action: JSON Downloader (Enterprise Command Center Feature)
  const handleExportCatalog = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredQuestions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Aptitude_Questions_Catalog_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <>
      {/* Access control check matching Dynamic Content Creator constraints */}
        {currentRole.role !== 'admin' ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-[#030712]">
            <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden p-8 flex flex-col items-center text-center gap-6 animate-scaleUp">
              {/* Lock Icon */}
              <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 flex items-center justify-center text-rose-500 shadow-inner relative">
                <Lock className="w-7 h-7 animate-pulse" />
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-rose-600 text-[10px] font-black text-slate-900 dark:text-white flex items-center justify-center border-2 border-white shadow">
                  !
                </span>
              </div>

              {/* Clearance Violations Info */}
              <div className="flex flex-col gap-1.5">
                <h2 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">Clearance Protocol Violation</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">
                  Secure Sandbox Sandbox v2.4
                </p>
              </div>

              {/* Details table */}
              <div className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 p-4 rounded-xl space-y-3.5 text-xs text-left">
                <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800 pb-2">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Clearance Token Status
                  </span>
                  <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-500 uppercase tracking-wide">
                    DENIED
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-y-3.5 gap-x-6 font-semibold">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 dark:text-slate-500 font-semibold uppercase">Attempted User</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold">{currentRole.name}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 dark:text-slate-500 font-semibold uppercase">Clearance Role</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold uppercase tracking-wider text-[11px] text-rose-600 dark:text-rose-400">
                      {currentRole.role}
                    </span>
                  </div>
                  <div className="flex flex-col col-span-2">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 dark:text-slate-500 font-semibold uppercase">Attempted Access Route</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold font-mono text-[11px]">/admin/directory</span>
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full mt-2">
                <RoleToggle />
                <button
                  onClick={() => {
                    const admin = USER_ROLES.find(r => r.role === 'admin');
                    if (admin) handleRoleChange(admin);
                  }}
                  className="w-full sm:flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-slate-900 dark:text-white rounded-xl text-xs font-bold shadow-md hover:shadow-blue-500/10 active:scale-98 transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 animate-spin-hover" />
                  <span>Request Admin Clearance</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* The Question Directory Layout Space */
          <div className="flex-1 overflow-y-auto p-8 space-y-6">

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-slate-800 pb-5">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Question Directory</h1>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide uppercase border dark:border-slate-800 shadow-inner ${
                    dbSource === 'Supabase Cloud' 
                      ? 'bg-indigo-50 border-indigo-100 text-indigo-700 dark:bg-indigo-950/20 dark:border-indigo-900/30 dark:text-indigo-400' 
                      : 'bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${dbSource === 'Supabase Cloud' ? 'bg-indigo-600 animate-pulse' : 'bg-amber-500'}`} />
                    {dbSource}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                  Manage, search, organize, and monitor all platform questions.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
                <RoleToggle />
                {/* Export Catalog JSON */}
                <button
                  onClick={handleExportCatalog}
                  disabled={filteredQuestions.length === 0}
                  className="px-4 py-2.5 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200/90 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow-xs active:scale-98 cursor-pointer dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-slate-800 dark:text-slate-200"
                >
                  <Download className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span>Export Catalog</span>
                </button>

                {/* Add Question Primary Button */}
                <button
                  onClick={handleAddQuestion}
                  className="bg-blue-600 hover:bg-blue-700 text-slate-900 dark:text-white rounded-lg px-4.5 py-2.5 text-xs font-bold flex items-center gap-2 transition-all shadow-md hover:shadow-blue-500/10 active:scale-98 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Question</span>
                </button>
              </div>
            </div>

            {/* Premium Metrics Widgets Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

              {/* Stat 1: Total Catalog */}
              <div className="bg-white border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center gap-4.5 hover:shadow-sm transition-all duration-150">
                <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/30 flex items-center justify-center text-blue-600 shrink-0">
                  <Library className="w-5 h-5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none">
                    Total In Directory
                  </span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                    {stats.total}
                  </span>
                </div>
              </div>

              {/* Stat 2: Published */}
              <div className="bg-white border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center gap-4.5 hover:shadow-sm transition-all duration-150">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none">
                    Active Published
                  </span>
                  <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400 tracking-tight mt-1">
                    {stats.published}
                  </span>
                </div>
              </div>

              {/* Stat 3: Drafts */}
              <div className="bg-white border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center gap-4.5 hover:shadow-sm transition-all duration-150">
                <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-950/20 dark:border-slate-900/30 flex items-center justify-center text-slate-500 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none">
                    Incomplete Drafts
                  </span>
                  <span className="text-2xl font-black text-slate-800 dark:text-slate-200 tracking-tight mt-1">
                    {stats.draft}
                  </span>
                </div>
              </div>

            </div>

            {/* Filter Components Box */}
            <FilterDropdowns
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedDomain={selectedDomain}
              setSelectedDomain={setSelectedDomain}
              selectedSubTopic={selectedSubTopic}
              setSelectedSubTopic={setSelectedSubTopic}
              selectedConcept={selectedConcept}
              setSelectedConcept={setSelectedConcept}
              selectedDifficulty={selectedDifficulty}
              setSelectedDifficulty={setSelectedDifficulty}
              selectedCompany={selectedCompany}
              setSelectedCompany={setSelectedCompany}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
              onResetFilters={handleResetFilters}
            />

            {/* Scalable Table Grid */}
            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center min-h-[350px] bg-white dark:bg-[#0f1322] border border-slate-200 dark:border-[#151c2f] rounded-2xl p-12 shadow-xs">
                <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-3.5 uppercase tracking-wider">Loading Question Directory...</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-1">Retrieving question bank, taxonomy topics, and placement tags</span>
              </div>
            ) : (
              <QuestionTable
                questions={filteredQuestions}
                onEditQuestion={handleEditQuestion}
              />
            )}

          </div>
        )}
      </>
  );
}
