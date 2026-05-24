'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Shield, RefreshCw, Server, Lock, ToggleLeft, ToggleRight, Trash2, Database, Save, Cpu, Plus } from 'lucide-react';
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';
import { USER_ROLES, SAMPLE_QUESTIONS, DOMAINS_DATA } from '@/lib/admin/store';
import { UserRole } from '@/lib/admin/types';
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
  const [currentRole, setCurrentRole] = useState<UserRole>(USER_ROLES[0]);
  
  // Settings States (Mocks)
  const [sandboxMode, setSandboxMode] = useState(true);
  const [latexRenderer, setLatexRenderer] = useState(true);
  const [shuffleDefault, setShuffleDefault] = useState(true);
  
  const [notification, setNotification] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{
    inProgress: boolean;
    total: number;
    completed: number;
    failed: number;
    errors: string[];
  } | null>(null);

  useEffect(() => {
    const storedRole = localStorage.getItem('aptitude_current_role');
    if (storedRole) {
      try {
        const parsed = JSON.parse(storedRole);
        const matched = USER_ROLES.find(r => r.role === parsed.role);
        if (matched) setCurrentRole(matched);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    localStorage.setItem('aptitude_current_role', JSON.stringify(role));
  };

  const handleResetCatalog = () => {
    localStorage.setItem('aptitude_questions', JSON.stringify(SAMPLE_QUESTIONS));
    setNotification('Catalog reset: Restored the default 4 sample questions.');
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSeedQuestions = () => {
    const stored = localStorage.getItem('aptitude_questions');
    let list = SAMPLE_QUESTIONS;
    if (stored) {
      try { list = JSON.parse(stored); } catch (e) {}
    }
    
    // Generate a new test question
    const testId = 'Q-TEST-' + Math.floor(1000 + Math.random() * 9000);
    const seededQuestion = {
      id: testId,
      domainId: 'quant',
      subTopicId: 'algebra',
      conceptId: 'linear-eq',
      difficulty: 'MEDIUM' as const,
      companyTags: ['Meta', 'Uber'],
      shuffleOptions: true,
      questionStem: 'Solve for x: 3x + 12 = 27. \\n\\n$$3x = 15 \\implies x = 5$$',
      hintText: 'Subtract 12 from both sides first.',
      options: [
        { id: 'A', text: 'x = 5', isCorrect: true, metadata: '88%' },
        { id: 'B', text: 'x = 3', isCorrect: false, metadata: '10%' },
        { id: 'C', text: 'x = 15', isCorrect: false, metadata: '2%' }
      ],
      videoUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
      status: 'Published' as const,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    const updated = [seededQuestion, ...list];
    localStorage.setItem('aptitude_questions', JSON.stringify(updated));
    setNotification(`Success: Seeded dynamic question ${testId} into local storage directory.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSyncToSupabase = async () => {
    const localData = localStorage.getItem('aptitude_questions');
    if (!localData) {
      setNotification('No local questions found in sandbox to sync.');
      setTimeout(() => setNotification(null), 4000);
      return;
    }

    let questionsList = [];
    try {
      questionsList = JSON.parse(localData);
    } catch (e) {
      setNotification('Invalid data in local storage sandbox.');
      setTimeout(() => setNotification(null), 4000);
      return;
    }

    if (!Array.isArray(questionsList) || questionsList.length === 0) {
      setNotification('No questions available to sync.');
      setTimeout(() => setNotification(null), 4000);
      return;
    }

    setIsSyncing(true);
    const initialStatus = {
      inProgress: true,
      total: questionsList.length,
      completed: 0,
      failed: 0,
      errors: [] as string[]
    };
    setSyncStatus(initialStatus);

    let completedCount = 0;
    let failedCount = 0;
    const errorsList: string[] = [];

    for (const q of questionsList) {
      try {
        // 1. Resolve domain display name and fetch/insert domain ID
        const domainObj = DOMAINS_DATA.find(d => d.id === q.domainId);
        const domainName = domainObj ? domainObj.name : q.domainId;

        let domainIdUuid = '';
        const { data: existingDomains, error: domainSearchError } = await supabase
          .from('domains')
          .select('id')
          .eq('name', domainName);

        if (domainSearchError) {
          throw new Error(`Domain search failed for "${domainName}": ${domainSearchError.message}`);
        }

        if (existingDomains && existingDomains.length > 0) {
          domainIdUuid = existingDomains[0].id;
        } else {
          const { data: newDomain, error: domainInsertError } = await supabase
            .from('domains')
            .insert({ name: domainName })
            .select('id')
            .single();

          if (domainInsertError) {
            throw new Error(`Domain insert failed for "${domainName}": ${domainInsertError.message}`);
          }
          if (newDomain) {
            domainIdUuid = newDomain.id;
          } else {
            throw new Error(`Could not retrieve inserted Domain ID for "${domainName}"`);
          }
        }

        // 2. Resolve subtopic display name and fetch/insert subtopic ID
        let subTopicName = q.subTopicId;
        if (domainObj) {
          const subTopicObj = domainObj.subTopics.find(s => s.id === q.subTopicId);
          if (subTopicObj) subTopicName = subTopicObj.name;
        }

        let subTopicIdUuid = '';
        const { data: existingSubTopics, error: subTopicSearchError } = await supabase
          .from('sub_topics')
          .select('id')
          .eq('domain_id', domainIdUuid)
          .eq('name', subTopicName);

        if (subTopicSearchError) {
          throw new Error(`Sub-topic search failed for "${subTopicName}": ${subTopicSearchError.message}`);
        }

        if (existingSubTopics && existingSubTopics.length > 0) {
          subTopicIdUuid = existingSubTopics[0].id;
        } else {
          const { data: newSubTopic, error: subTopicInsertError } = await supabase
            .from('sub_topics')
            .insert({ domain_id: domainIdUuid, name: subTopicName })
            .select('id')
            .single();

          if (subTopicInsertError) {
            throw new Error(`Sub-topic insert failed for "${subTopicName}": ${subTopicInsertError.message}`);
          }
          if (newSubTopic) {
            subTopicIdUuid = newSubTopic.id;
          } else {
            throw new Error(`Could not retrieve inserted Sub-topic ID for "${subTopicName}"`);
          }
        }

        // 3. Resolve concept display name and fetch/insert concept ID
        let conceptName = q.conceptId;
        if (domainObj) {
          const subTopicObj = domainObj.subTopics.find(s => s.id === q.subTopicId);
          if (subTopicObj) {
            const conceptObj = subTopicObj.concepts.find(c => c.id === q.conceptId || c.id === q.conceptId.trim());
            if (conceptObj) conceptName = conceptObj.name;
          }
        }

        let conceptIdUuid = '';
        const { data: existingConcepts, error: conceptSearchError } = await supabase
          .from('concepts')
          .select('id')
          .eq('sub_topic_id', subTopicIdUuid)
          .eq('name', conceptName);

        if (conceptSearchError) {
          throw new Error(`Concept search failed for "${conceptName}": ${conceptSearchError.message}`);
        }

        if (existingConcepts && existingConcepts.length > 0) {
          conceptIdUuid = existingConcepts[0].id;
        } else {
          const { data: newConcept, error: conceptInsertError } = await supabase
            .from('concepts')
            .insert({ sub_topic_id: subTopicIdUuid, name: conceptName })
            .select('id')
            .single();

          if (conceptInsertError) {
            throw new Error(`Concept insert failed for "${conceptName}": ${conceptInsertError.message}`);
          }
          if (newConcept) {
            conceptIdUuid = newConcept.id;
          } else {
            throw new Error(`Could not retrieve inserted Concept ID for "${conceptName}"`);
          }
        }

        // 4. Check for existing question to prevent duplicate stems under same concept
        let questionUuid = '';
        const { data: existingQuestions, error: questionSearchError } = await supabase
          .from('questions')
          .select('id')
          .eq('concept_id', conceptIdUuid)
          .eq('question_text', q.questionStem);

        if (questionSearchError) {
          throw new Error(`Question search failed for query: ${questionSearchError.message}`);
        }

        if (existingQuestions && existingQuestions.length > 0) {
          questionUuid = existingQuestions[0].id;
        } else {
          // Find correct answer text
          const correctAnswerText = q.options?.find((o: any) => o.isCorrect)?.text || '';

          const { data: newQuestion, error: questionInsertError } = await supabase
            .from('questions')
            .insert({
              concept_id: conceptIdUuid,
              type: 'MCQ',
              difficulty: q.difficulty || 'MEDIUM',
              question_text: q.questionStem,
              options: q.options,
              correct_answer: correctAnswerText,
              explanation: q.hintText || '',
              video_url: q.videoUrl || '',
              is_active: q.status === 'Published'
            })
            .select('id')
            .single();

          if (questionInsertError) {
            throw new Error(`Question insert failed: ${questionInsertError.message}`);
          }
          if (newQuestion) {
            questionUuid = newQuestion.id;
          } else {
            throw new Error('Could not retrieve inserted Question ID');
          }
        }

        // 5. Handle company tags if present
        if (q.companyTags && Array.isArray(q.companyTags)) {
          for (const companyName of q.companyTags) {
            if (!companyName) continue;
            let companyUuid = '';
            
            // Find or insert company
            const { data: existingCompanies, error: companySearchError } = await supabase
              .from('companies')
              .select('id')
              .eq('name', companyName);

            if (companySearchError) {
              console.error(`Company search error for "${companyName}":`, companySearchError.message);
              continue;
            }

            if (existingCompanies && existingCompanies.length > 0) {
              companyUuid = existingCompanies[0].id;
            } else {
              const { data: newCompany, error: companyInsertError } = await supabase
                .from('companies')
                .insert({ name: companyName })
                .select('id')
                .single();

              if (companyInsertError) {
                console.error(`Company insert error for "${companyName}":`, companyInsertError.message);
                continue;
              }
              if (newCompany) {
                companyUuid = newCompany.id;
              }
            }

            // Pivot table insert
            if (companyUuid && questionUuid) {
              const { data: existingPivot, error: pivotSearchError } = await supabase
                .from('question_companies')
                .select('question_id')
                .eq('question_id', questionUuid)
                .eq('company_id', companyUuid);

              if (!pivotSearchError && (!existingPivot || existingPivot.length === 0)) {
                const { error: pivotInsertError } = await supabase
                  .from('question_companies')
                  .insert({
                    question_id: questionUuid,
                    company_id: companyUuid
                  });
                if (pivotInsertError) {
                  console.error('Pivot table insert error:', pivotInsertError.message);
                }
              }
            }
          }
        }

        completedCount++;
      } catch (err: any) {
        failedCount++;
        const message = err.message || 'Unknown error occurred';
        errorsList.push(`[${q.id}]: ${message}`);
        console.error(`Sync error on question ${q.id}:`, err);
      }

      // Update progress state incrementally
      setSyncStatus({
        inProgress: true,
        total: questionsList.length,
        completed: completedCount,
        failed: failedCount,
        errors: [...errorsList]
      });
    }

    setIsSyncing(false);
    setSyncStatus({
      inProgress: false,
      total: questionsList.length,
      completed: completedCount,
      failed: failedCount,
      errors: errorsList
    });

    if (failedCount === 0) {
      setNotification(`Sync complete! Successfully migrated ${completedCount} questions to Supabase.`);
    } else {
      setNotification(`Sync complete with warnings: ${completedCount} success, ${failedCount} failed.`);
    }
    setTimeout(() => setNotification(null), 6000);
  };

  return (
    <div className="flex h-screen bg-slate-100 font-sans overflow-hidden antialiased">
      <Sidebar activeId="settings" userRole={currentRole.role} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Header currentRole={currentRole} onRoleChange={handleRoleChange} />

        {notification && (
          <div className="absolute top-20 right-8 z-50 animate-slideIn">
            <div className="px-4.5 py-3.5 rounded-xl border bg-emerald-50 border-emerald-200 text-emerald-800 shadow-lg flex items-center gap-3 max-w-md">
              <span className="text-xs font-semibold leading-normal">{notification}</span>
            </div>
          </div>
        )}

        {currentRole.role !== 'admin' ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50">
            <div className="w-full max-w-xl bg-white border border-slate-200/80 rounded-2xl shadow-xl overflow-hidden p-8 flex flex-col items-center text-center gap-6 animate-scaleUp">
              <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shadow-inner relative">
                <Cpu className="w-7 h-7 animate-pulse" />
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-rose-600 text-[10px] font-black text-white flex items-center justify-center border-2 border-white shadow">!</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <h2 className="text-lg font-black text-slate-800 tracking-tight">Clearance Protocol Violation</h2>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Secured Sandbox v2.4</p>
              </div>
              <div className="w-full bg-slate-50 border border-slate-200/80 p-4 rounded-xl space-y-3.5 text-xs text-left">
                <div className="flex items-center justify-between border-b border-slate-200/50 pb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Clearance Status</span>
                  <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-rose-50 text-rose-700 uppercase tracking-wide">DENIED</span>
                </div>
                <div className="grid grid-cols-2 gap-y-3.5 gap-x-6 font-semibold">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Attempted User</span>
                    <span className="text-slate-800 font-bold">{currentRole.name}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Clearance Role</span>
                    <span className="text-slate-800 font-bold uppercase tracking-wider text-[11px] text-rose-600">{currentRole.role}</span>
                  </div>
                  <div className="flex flex-col col-span-2">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Attempted Access Route</span>
                    <span className="text-slate-800 font-bold font-mono text-[11px]">/admin/settings</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3 w-full mt-2">
                <button
                  onClick={() => {
                    const admin = USER_ROLES.find(r => r.role === 'admin');
                    if (admin) handleRoleChange(admin);
                  }}
                  className="w-full sm:flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-blue-500/10 active:scale-98 transition-all cursor-pointer"
                >
                  <span>Request Admin Clearance</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            {/* Page Header */}
            <div className="border-b border-slate-200/60 pb-5">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Configuration Panel</h1>
              <p className="text-xs font-semibold text-slate-500 mt-1">
                Configure global compiler triggers, LaTeX rendering pipelines, and Sandbox storage parameters.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Configuration Items */}
              <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl shadow-xs p-6 space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                  <Settings className="w-5 h-5 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-800 tracking-tight">Compiler Switches</h3>
                </div>

                <div className="space-y-5 text-xs font-semibold text-slate-700">
                  {/* Item 1 */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/60 rounded-xl">
                    <div className="flex flex-col gap-1">
                      <span className="text-slate-850 font-bold">Staging Sandbox Telemetry</span>
                      <span className="text-slate-400 font-medium leading-relaxed max-w-md">
                        Enabling telemetry streams mock logs and events to the audit console in real time.
                      </span>
                    </div>
                    <button onClick={() => setSandboxMode(!sandboxMode)} className="text-blue-600 hover:text-blue-700">
                      {sandboxMode ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10 text-slate-400" />}
                    </button>
                  </div>

                  {/* Item 2 */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/60 rounded-xl">
                    <div className="flex flex-col gap-1">
                      <span className="text-slate-850 font-bold">KaTeX Mathematical Render Pipeline</span>
                      <span className="text-slate-400 font-medium leading-relaxed max-w-md">
                        Compiles double dollar signs ($$) into elegant centered equations inside the preview canvas.
                      </span>
                    </div>
                    <button onClick={() => setLatexRenderer(!latexRenderer)} className="text-blue-600 hover:text-blue-700">
                      {latexRenderer ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10 text-slate-400" />}
                    </button>
                  </div>

                  {/* Item 3 */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/60 rounded-xl">
                    <div className="flex flex-col gap-1">
                      <span className="text-slate-850 font-bold">Default Option Shuffling</span>
                      <span className="text-slate-400 font-medium leading-relaxed max-w-md">
                        Automatically enables choice option shuffling on newly instantiated questions inside the studio.
                      </span>
                    </div>
                    <button onClick={() => setShuffleDefault(!shuffleDefault)} className="text-blue-600 hover:text-blue-700">
                      {shuffleDefault ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10 text-slate-400" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Maintenance Tools */}
              <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs p-6 space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                    <Database className="w-5 h-5 text-indigo-500" />
                    <h3 className="text-sm font-bold text-slate-800 tracking-tight">Database Utilities</h3>
                  </div>

                  <div className="space-y-3.5">
                    {/* Seed Button */}
                    <button
                      onClick={handleSeedQuestions}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 hover:bg-blue-100/80 border border-blue-200 text-blue-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Seed Mock Question</span>
                    </button>

                    {/* Reset Button */}
                    <button
                      onClick={handleResetCatalog}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Reset Catalog to Defaults</span>
                    </button>

                    {/* Sync to Supabase Button */}
                    <button
                      onClick={handleSyncToSupabase}
                      disabled={isSyncing}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200 text-indigo-700 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                      <span>{isSyncing ? 'Syncing to Supabase...' : 'Sync Catalog to Supabase'}</span>
                    </button>
                  </div>

                  {syncStatus && (
                    <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 animate-scaleUp">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-700">Sync Status</span>
                        <span className={syncStatus.inProgress ? "text-indigo-600 animate-pulse" : "text-emerald-600"}>
                          {syncStatus.inProgress ? 'In Progress...' : 'Completed'}
                        </span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-indigo-600 h-full transition-all duration-350" 
                          style={{ width: `${syncStatus.total > 0 ? (syncStatus.completed / syncStatus.total) * 100 : 0}%` }}
                        />
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold">
                        <div className="bg-white p-2 border border-slate-100 rounded-lg">
                          <div className="text-slate-400">Total</div>
                          <div className="text-sm text-slate-800">{syncStatus.total}</div>
                        </div>
                        <div className="bg-emerald-50 p-2 border border-emerald-100 rounded-lg">
                          <div className="text-emerald-600">Success</div>
                          <div className="text-sm text-emerald-800">{syncStatus.completed}</div>
                        </div>
                        <div className="bg-rose-50 p-2 border border-rose-100 rounded-lg">
                          <div className="text-rose-600">Failed</div>
                          <div className="text-sm text-rose-800">{syncStatus.failed}</div>
                        </div>
                      </div>

                      {syncStatus.errors.length > 0 && (
                        <div className="max-h-24 overflow-y-auto text-[10px] text-rose-600 space-y-1 bg-rose-50/50 p-2 rounded-lg border border-rose-100/50 font-mono">
                          {syncStatus.errors.map((err, idx) => (
                            <div key={idx}>• {err}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3 mt-4 text-xs font-semibold text-slate-500">
                  <Shield className="w-5 h-5 text-emerald-500 shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-slate-800 font-bold">Secure Core v2.4</span>
                    <span>Sandbox storage uses clean isolated scope.</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
