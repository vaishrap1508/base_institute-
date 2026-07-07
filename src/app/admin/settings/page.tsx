'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, Shield, RefreshCw, Server, Lock, Trash2, 
  Database, Save, Cpu, Plus, BookOpen, Calendar, Clock, 
  MapPin, Target, Edit, Check, ChevronRight, Activity, Bell, Grid, Eye, ShieldAlert,
  Compass
} from 'lucide-react';
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';
import { USER_ROLES, SAMPLE_QUESTIONS, DOMAINS_DATA } from '@/lib/admin/store';
import { UserRole } from '@/lib/admin/types';
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
  const [currentRole, setCurrentRole] = useState<UserRole>(USER_ROLES[0]);
  
  // Compiler Settings Toggles
  const [sandboxMode, setSandboxMode] = useState(true);
  const [latexRenderer, setLatexRenderer] = useState(true);
  const [shuffleDefault, setShuffleDefault] = useState(true);

  // Dispatch & Alerts Mock Toggles
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [systemHealthReports, setSystemHealthReports] = useState(true);
  const [userMilestoneUpdates, setUserMilestoneUpdates] = useState(false);

  // Security Toggles
  const [enable2fa, setEnable2fa] = useState(true);

  // Dynamic Onboarding Settings States
  const [goalOptions, setGoalOptions] = useState<any[]>([]);
  const [timelineOptions, setTimelineOptions] = useState<string[]>([]);
  const [commitmentOptions, setCommitmentOptions] = useState<string[]>([]);
  const [preferenceOptions, setPreferenceOptions] = useState<string[]>([]);
  const [indianStates, setIndianStates] = useState<string[]>([]);
  const [loadingOnboarding, setLoadingOnboarding] = useState(true);
  const [activeTab, setActiveTab] = useState<'goals' | 'states' | 'timelines' | 'commitments' | 'preferences'>('goals');
  const [savingOnboarding, setSavingOnboarding] = useState(false);

  // Form states for adding items
  const [newGoalId, setNewGoalId] = useState('');
  const [newGoalLabel, setNewGoalLabel] = useState('');
  const [newGoalDesc, setNewGoalDesc] = useState('');
  const [newTimeline, setNewTimeline] = useState('');
  const [newCommitment, setNewCommitment] = useState('');
  const [newPreference, setNewPreference] = useState('');
  const [newState, setNewState] = useState('');

  // Fetch dynamic onboarding settings on mount
  useEffect(() => {
    async function loadOnboardingSettings() {
      try {
        const { data, error } = await supabase
          .from('onboarding_settings')
          .select('*')
          .eq('id', 'current')
          .single();

        if (data && !error) {
          if (Array.isArray(data.goal_options)) setGoalOptions(data.goal_options);
          if (Array.isArray(data.timeline_options)) setTimelineOptions(data.timeline_options);
          if (Array.isArray(data.commitment_options)) setCommitmentOptions(data.commitment_options);
          if (Array.isArray(data.preference_options)) setPreferenceOptions(data.preference_options);
          if (Array.isArray(data.indian_states)) setIndianStates(data.indian_states);
        }
      } catch (err) {
        console.warn('Failed to fetch onboarding settings:', err);
      } finally {
        setLoadingOnboarding(false);
      }
    }
    loadOnboardingSettings();
  }, []);

  // Save dynamic onboarding settings handler
  const handleSaveOnboarding = async () => {
    setSavingOnboarding(true);
    try {
      const payload = {
        id: 'current',
        goal_options: goalOptions,
        timeline_options: timelineOptions,
        commitment_options: commitmentOptions,
        preference_options: preferenceOptions,
        indian_states: indianStates,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('onboarding_settings')
        .upsert(payload);

      if (error) throw error;
      setNotification("Success: Onboarding Flow configurations saved to database.");
    } catch (err: any) {
      console.error(err);
      setNotification(`Error: Failed to save onboarding configurations: ${err.message || err}`);
    } finally {
      setSavingOnboarding(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };
  
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
        console.warn(e);
      }
    }
  }, []);

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    localStorage.setItem('aptitude_current_role', JSON.stringify(role));
  };

  const handleResetCatalog = () => {
    localStorage.setItem('aptitude_questions', JSON.stringify(SAMPLE_QUESTIONS));
    setNotification('Catalog reset: Restored the default sample questions.');
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

        if (q.companyTags && Array.isArray(q.companyTags)) {
          for (const companyName of q.companyTags) {
            if (!companyName) continue;
            let companyUuid = '';
            
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

  const handlePasswordChange = () => {
    setNotification("Clearance verified: Password reset request token issued to administrator email.");
    setTimeout(() => setNotification(null), 4000);
  };

  // Helper toggle switch renderer
  const renderToggle = (checked: boolean, onChange: () => void) => {
    return (
      <button 
        type="button"
        onClick={onChange}
        className={`w-10 h-5.5 flex items-center rounded-full p-0.5 cursor-pointer transition-all duration-200 shrink-0 ${checked ? 'bg-[#00ffcc]' : 'bg-[#1b233a]'}`}
      >
        <div className={`bg-slate-900 w-4.5 h-4.5 rounded-full shadow-md transform transition-all duration-200 ${checked ? 'translate-x-4.5 bg-slate-950' : 'translate-x-0 bg-slate-400'}`} />
      </button>
    );
  };

  return (
    <div className="flex h-screen bg-[#070a13] text-slate-100 font-sans overflow-hidden antialiased transition-colors duration-300">
      <Sidebar activeId="settings" userRole={currentRole.role} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Header currentRole={currentRole} onRoleChange={handleRoleChange} />

        {notification && (
          <div className="absolute top-20 right-8 z-50 animate-slideIn">
            <div className="px-4.5 py-3.5 rounded-xl border bg-[#0f1322] border-purple-500/20 text-slate-200 shadow-xl flex items-center gap-3 max-w-md">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-xs font-semibold leading-normal">{notification}</span>
            </div>
          </div>
        )}

        {currentRole.role !== 'admin' ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#070a13]">
            <div className="w-full max-w-xl bg-[#0f1322] border border-[#151c2f] rounded-2xl shadow-xl overflow-hidden p-8 flex flex-col items-center text-center gap-6 animate-scaleUp">
              <div className="w-16 h-16 rounded-full bg-rose-950/20 border border-rose-900/30 flex items-center justify-center text-rose-400 shadow-inner relative">
                <Cpu className="w-7 h-7 animate-pulse" />
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-rose-600 text-[10px] font-black text-white flex items-center justify-center border-2 border-[#0f1322] shadow">!</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <h2 className="text-lg font-black text-white uppercase tracking-wider font-heading">Clearance Protocol Violation</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Secured Sandbox v2.4</p>
              </div>
              <div className="w-full bg-[#070a13] border border-[#151c2f] p-4 rounded-xl space-y-3.5 text-xs text-left">
                <div className="flex items-center justify-between border-b border-[#151c2f] pb-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Clearance Status</span>
                  <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-rose-950/45 text-rose-400 uppercase tracking-wide">DENIED</span>
                </div>
                <div className="grid grid-cols-2 gap-y-3.5 gap-x-6 font-semibold">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase">Attempted User</span>
                    <span className="text-slate-200 font-bold">{currentRole.name}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase">Clearance Role</span>
                    <span className="text-rose-400 font-bold uppercase tracking-wider text-[11px]">{currentRole.role}</span>
                  </div>
                  <div className="flex flex-col col-span-2">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase">Attempted Access Route</span>
                    <span className="text-slate-300 font-bold font-mono text-[11px]">/admin/settings</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3 w-full mt-2">
                <button
                  onClick={() => {
                    const admin = USER_ROLES.find(r => r.role === 'admin');
                    if (admin) handleRoleChange(admin);
                  }}
                  className="w-full sm:flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-purple-500/20 active:scale-98 transition-all cursor-pointer"
                >
                  <span>Request Admin Clearance</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-[#070a13] custom-scrollbar">
            
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#151c2f] pb-5">
              <div>
                <span className="text-[10px] font-black text-purple-400 tracking-wider uppercase leading-none">
                  Admin Panel
                </span>
                <h1 className="text-2xl font-black text-white tracking-tight uppercase font-heading mt-1">
                  System Settings
                </h1>
              </div>
            </div>

            {/* Hybrid Grid Layout: 2-Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column (60% / col-span-2): Identity, Performance Circular gauge, toggles */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Identity Management Card */}
                <div className="bg-[#0f1322] border border-[#151c2f] rounded-2xl p-6 space-y-6 relative overflow-hidden group">
                  <span className="text-[10px] font-black text-cyan-400 tracking-wider uppercase leading-none">
                    Identity Management
                  </span>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-6 pt-2">
                    <div className="relative shrink-0">
                      <img 
                        src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150" 
                        alt="Julian Draxler Avatar" 
                        className="w-20 h-20 rounded-xl object-cover border border-[#1b233a] shadow-lg"
                      />
                      <button className="absolute -bottom-1.5 -right-1.5 bg-[#00ffcc] text-slate-900 p-1.5 rounded-lg border-2 border-[#0f1322] shadow hover:scale-105 transition-all cursor-pointer">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 flex-1">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Admin Name</span>
                        <span className="text-sm font-bold text-white mt-1">Julian Draxler</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Admin Email</span>
                        <span className="text-sm font-bold text-white mt-1">j.draxler@lucid.io</span>
                      </div>
                      
                      <div className="sm:col-span-2 pt-1.5">
                        <button 
                          onClick={handlePasswordChange}
                          className="px-4 py-2 bg-[#1b233a] hover:bg-[#253254] text-slate-200 border border-[#1b233a] rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          Change Password
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Infrastructure Performance Card (with circular SVG gauge) */}
                <div className="bg-[#0f1322] border border-[#151c2f] rounded-2xl p-6 space-y-6">
                  <span className="text-[10px] font-black text-emerald-400 tracking-wider uppercase leading-none">
                    Infrastructure Performance
                  </span>
                  
                  <div className="flex items-center justify-center gap-6 bg-[#070a13]/60 p-4.5 border border-[#151c2f]/60 rounded-2xl relative max-w-md mx-auto">
                    <div className="relative flex flex-col items-center justify-center shrink-0">
                      <svg className="w-20 h-20 transform -rotate-90">
                        <circle cx="40" cy="40" r="32" stroke="#1b233a" strokeWidth="4.5" fill="transparent" />
                        <circle 
                          cx="40" 
                          cy="40" 
                          r="32" 
                          stroke="url(#storageGrad)" 
                          strokeWidth="4.5" 
                          fill="transparent"
                          strokeDasharray={2 * Math.PI * 32} 
                          strokeDashoffset={2 * Math.PI * 32 * (1 - 0.68)}
                          strokeLinecap="round" 
                        />
                        <defs>
                          <linearGradient id="storageGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#a855f7" />
                            <stop offset="100%" stopColor="#6366f1" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-base font-black text-white leading-none">68%</span>
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-0.5">Used</span>
                      </div>
                    </div>

                    <div className="flex flex-col text-left">
                      <span className="text-xs font-extrabold text-white">Storage Capacity</span>
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-1">Enterprise S3</span>
                      
                      <button className="text-[10px] font-bold text-purple-400 hover:text-purple-300 mt-2 flex items-center gap-0.5 uppercase tracking-wider transition-colors cursor-pointer">
                        <span>Configure Limits</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Dispatch & Alerts Toggles */}
                <div className="bg-[#0f1322] border border-[#151c2f] rounded-2xl p-6 space-y-6">
                  <span className="text-[10px] font-black text-slate-400 tracking-wider uppercase leading-none">
                    Dispatch & Alerts
                  </span>
                  
                  <div className="space-y-4 pt-2">
                    {/* Item 1 */}
                    <div className="flex items-center justify-between p-4 bg-[#070a13] border border-[#151c2f]/80 rounded-xl">
                      <div className="flex flex-col gap-1 pr-4">
                        <span className="text-xs font-bold text-slate-200">Security Alerts</span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                          Immediate broadcast for unauthorized access attempts.
                        </span>
                      </div>
                      {renderToggle(securityAlerts, () => setSecurityAlerts(!securityAlerts))}
                    </div>

                    {/* Item 2 */}
                    <div className="flex items-center justify-between p-4 bg-[#070a13] border border-[#151c2f]/80 rounded-xl">
                      <div className="flex flex-col gap-1 pr-4">
                        <span className="text-xs font-bold text-slate-200">System Health Reports</span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                          Weekly summaries of infrastructure availability.
                        </span>
                      </div>
                      {renderToggle(systemHealthReports, () => setSystemHealthReports(!systemHealthReports))}
                    </div>

                    {/* Item 3 */}
                    <div className="flex items-center justify-between p-4 bg-[#070a13] border border-[#151c2f]/80 rounded-xl">
                      <div className="flex flex-col gap-1 pr-4">
                        <span className="text-xs font-bold text-slate-200">User Milestone Updates</span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                          Notifications when key platform metrics are exceeded.
                        </span>
                      </div>
                      {renderToggle(userMilestoneUpdates, () => setUserMilestoneUpdates(!userMilestoneUpdates))}
                    </div>
                  </div>
                </div>

                {/* Compiler Switches (from present screen) */}
                <div className="bg-[#0f1322] border border-[#151c2f] rounded-2xl p-6 space-y-6">
                  <div className="flex items-center gap-2 border-b border-[#151c2f] pb-3.5">
                    <Settings className="w-4.5 h-4.5 text-purple-400" />
                    <span className="text-[10px] font-black text-purple-400 tracking-wider uppercase leading-none">
                      Compiler Switches
                    </span>
                  </div>

                  <div className="space-y-4">
                    {/* Switch 1 */}
                    <div className="flex items-center justify-between p-4 bg-[#070a13] border border-[#151c2f]/80 rounded-xl">
                      <div className="flex flex-col gap-1 pr-4">
                        <span className="text-xs font-bold text-slate-200">Staging Sandbox Telemetry</span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                          Enabling telemetry streams mock logs and events to the audit console in real time.
                        </span>
                      </div>
                      {renderToggle(sandboxMode, () => setSandboxMode(!sandboxMode))}
                    </div>

                    {/* Switch 2 */}
                    <div className="flex items-center justify-between p-4 bg-[#070a13] border border-[#151c2f]/80 rounded-xl">
                      <div className="flex flex-col gap-1 pr-4">
                        <span className="text-xs font-bold text-slate-200">KaTeX Mathematical Render Pipeline</span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                          Compiles double dollar signs ($$) into elegant centered equations inside the preview canvas.
                        </span>
                      </div>
                      {renderToggle(latexRenderer, () => setLatexRenderer(!latexRenderer))}
                    </div>

                    {/* Switch 3 */}
                    <div className="flex items-center justify-between p-4 bg-[#070a13] border border-[#151c2f]/80 rounded-xl">
                      <div className="flex flex-col gap-1 pr-4">
                        <span className="text-xs font-bold text-slate-200">Default Option Shuffling</span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                          Automatically enables choice option shuffling on newly instantiated questions inside the studio.
                        </span>
                      </div>
                      {renderToggle(shuffleDefault, () => setShuffleDefault(!shuffleDefault))}
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column (40% / col-span-1): Accounts, Fortress Security, Database Sync Tools */}
              <div className="lg:col-span-1 space-y-6">
                
                {/* Account Summary */}
                <div className="bg-[#0f1322] border border-[#151c2f] rounded-2xl p-6 space-y-4">
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wider border-b border-[#151c2f] pb-3.5 font-heading">
                    Account Summary
                  </h3>
                  
                  <div className="space-y-3.5 text-xs">
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-400 font-semibold">Current Role</span>
                      <span className="font-bold text-white">Super Admin</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-t border-[#151c2f]/60">
                      <span className="text-slate-400 font-semibold">Storage Tier</span>
                      <span className="font-bold text-white">Enterprise S3</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-t border-[#151c2f]/60">
                      <span className="text-slate-400 font-semibold">Last Login</span>
                      <span className="font-bold text-slate-300">14m ago (Paris, FR)</span>
                    </div>
                  </div>
                </div>

                {/* System Tips */}
                <div className="bg-[#0f1322] border border-[#151c2f] rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-2 border-b border-[#151c2f] pb-3.5">
                    <Compass className="w-4.5 h-4.5 text-cyan-400" />
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-heading">
                      System Tips
                    </h3>
                  </div>
                  
                  <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                    You are currently operating in <strong className="text-cyan-400">Global Admin Mode</strong>. Any changes to API limits will propagate across all 14 edge clusters within 30 seconds.
                  </p>
                  
                  <button className="text-[10px] font-black text-cyan-400 hover:text-cyan-300 uppercase tracking-widest block pt-1.5 transition-colors cursor-pointer">
                    READ DOCUMENTATION
                  </button>
                </div>

                {/* Stats Row (Latency & Nodes) */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Latency */}
                  <div className="bg-[#0f1322] border border-[#151c2f] rounded-2xl p-4 flex items-center gap-3 group hover:border-[#1b233a] transition-all">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                      <Activity className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Latency</span>
                      <span className="text-sm font-extrabold text-white">14ms</span>
                    </div>
                  </div>

                  {/* Nodes */}
                  <div className="bg-[#0f1322] border border-[#151c2f] rounded-2xl p-4 flex items-center gap-3 group hover:border-[#1b233a] transition-all">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                      <Server className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Nodes</span>
                      <span className="text-sm font-extrabold text-white">112/112</span>
                    </div>
                  </div>
                </div>

                {/* Fortress Security Card */}
                <div className="bg-[#0f1322] border border-[#151c2f] rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#151c2f] pb-3.5">
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-heading">
                      Fortress Security
                    </h3>
                    <Lock className="w-4.5 h-4.5 text-purple-400" />
                  </div>

                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider leading-relaxed">
                    Critical access and authentication controls.
                  </p>

                  <div className="space-y-4.5 pt-2">
                    <div className="flex justify-between items-center bg-[#070a13] p-3 border border-[#151c2f] rounded-xl">
                      <span className="text-xs font-bold text-slate-300">Enable 2FA</span>
                      {renderToggle(enable2fa, () => setEnable2fa(!enable2fa))}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button className="py-2.5 bg-[#1b233a] hover:bg-[#253254] text-slate-200 border border-[#1b233a] rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer text-center">
                        View Access Logs
                      </button>
                      <button className="py-2.5 bg-[#1b233a] hover:bg-[#253254] text-slate-200 border border-[#1b233a] rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer text-center">
                        Session Mgmt
                      </button>
                    </div>
                  </div>
                </div>

                {/* Database Utilities (from present screen) */}
                <div className="bg-[#0f1322] border border-[#151c2f] rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-2 border-b border-[#151c2f] pb-3.5">
                    <Database className="w-4.5 h-4.5 text-cyan-400" />
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-heading">
                      Database Utilities
                    </h3>
                  </div>

                  <div className="space-y-2.5">
                    <button
                      onClick={handleSeedQuestions}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500/10 hover:bg-blue-500/25 border border-blue-500/30 text-blue-400 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Seed Mock Question</span>
                    </button>

                    <button
                      onClick={handleResetCatalog}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Reset Catalog Defaults</span>
                    </button>

                    <button
                      onClick={handleSyncToSupabase}
                      disabled={isSyncing}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-500/10 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-400 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                      <span>{isSyncing ? 'Syncing...' : 'Sync Catalog Database'}</span>
                    </button>
                  </div>

                  {syncStatus && (
                    <div className="mt-3 p-3.5 bg-[#070a13] border border-[#151c2f] rounded-xl space-y-3 animate-scaleUp">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-slate-400">Sync Status</span>
                        <span className={syncStatus.inProgress ? "text-indigo-400 animate-pulse" : "text-emerald-400"}>
                          {syncStatus.inProgress ? 'In Progress' : 'Completed'}
                        </span>
                      </div>
                      
                      <div className="w-full bg-[#1b233a] h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-indigo-500 h-full transition-all duration-300" 
                          style={{ width: `${syncStatus.total > 0 ? (syncStatus.completed / syncStatus.total) * 100 : 0}%` }}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-1.5 text-center text-[9px] font-bold uppercase tracking-wider">
                        <div className="bg-[#0f1322] p-1.5 border border-[#151c2f]/60 rounded-lg">
                          <div className="text-slate-500">Total</div>
                          <div className="text-xs text-white mt-0.5">{syncStatus.total}</div>
                        </div>
                        <div className="bg-emerald-500/10 p-1.5 border border-emerald-500/20 rounded-lg">
                          <div className="text-emerald-400">Done</div>
                          <div className="text-xs text-white mt-0.5">{syncStatus.completed}</div>
                        </div>
                        <div className="bg-rose-500/10 p-1.5 border border-rose-500/20 rounded-lg">
                          <div className="text-rose-400">Fail</div>
                          <div className="text-xs text-white mt-0.5">{syncStatus.failed}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-3 bg-[#070a13] border border-[#151c2f] rounded-xl flex items-center gap-3 mt-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <Shield className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-white">Secure Core v2.4</span>
                      <span className="text-[9px] font-semibold text-slate-600 mt-0.5">Isolated scope sandbox</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Bottom Section: Onboarding Journey Customizer */}
            <div className="bg-[#0f1322] border border-[#151c2f] rounded-2xl p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#151c2f] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-heading">
                      Onboarding Journey Customizer
                    </h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                      Manage onboarding steps, options, goals, and state filters in real time.
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={handleSaveOnboarding}
                  disabled={savingOnboarding}
                  className="flex items-center justify-center gap-2 px-4.5 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-purple-500/10 cursor-pointer disabled:opacity-50"
                >
                  <Save className={`w-4 h-4 ${savingOnboarding ? 'animate-spin' : ''}`} />
                  <span>{savingOnboarding ? 'Saving Settings...' : 'Save Onboarding Settings'}</span>
                </button>
              </div>

              {/* Tab Toggles */}
              <div className="flex flex-wrap gap-2 border-b border-[#151c2f] pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <button
                  onClick={() => setActiveTab('goals')}
                  className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 border ${
                    activeTab === 'goals' 
                      ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' 
                      : 'hover:bg-[#151c2f]/40 hover:text-slate-200 border-transparent'
                  }`}
                >
                  <Target className="w-4 h-4" />
                  <span>Goals</span>
                  <span className="text-[10px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded-full font-extrabold">{goalOptions.length}</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('states')}
                  className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 border ${
                    activeTab === 'states' 
                      ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' 
                      : 'hover:bg-[#151c2f]/40 hover:text-slate-200 border-transparent'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  <span>States</span>
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded-full font-extrabold">{indianStates.length}</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('timelines')}
                  className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 border ${
                    activeTab === 'timelines' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                      : 'hover:bg-[#151c2f]/40 hover:text-slate-200 border-transparent'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Timelines</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full font-extrabold">{timelineOptions.length}</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('commitments')}
                  className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 border ${
                    activeTab === 'commitments' 
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
                      : 'hover:bg-[#151c2f]/40 hover:text-slate-200 border-transparent'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>Commitments</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full font-extrabold">{commitmentOptions.length}</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('preferences')}
                  className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 border ${
                    activeTab === 'preferences' 
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' 
                      : 'hover:bg-[#151c2f]/40 hover:text-slate-200 border-transparent'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Preferences</span>
                  <span className="text-[10px] bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded-full font-extrabold">{preferenceOptions.length}</span>
                </button>
              </div>

              {/* Loader or Content */}
              {loadingOnboarding ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3">
                  <RefreshCw className="w-6 h-6 text-purple-500 animate-spin" />
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Loading settings configurations...</span>
                </div>
              ) : (
                <div className="space-y-5">
                  
                  {/* Goals Tab Editor */}
                  {activeTab === 'goals' && (
                    <div className="space-y-5 animate-scaleUp">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {goalOptions.map((goal, idx) => (
                          <div key={goal.id || idx} className="p-4 bg-[#070a13] border border-[#151c2f] rounded-xl flex items-start justify-between gap-3 text-xs">
                            <div className="flex flex-col gap-1 min-w-0">
                              <span className="text-[#00ffcc] font-black uppercase tracking-wider text-[9px]">{goal.id}</span>
                              <span className="text-white font-extrabold text-sm tracking-tight">{goal.label}</span>
                              <p className="text-slate-400 font-semibold leading-relaxed mt-1">{goal.desc}</p>
                            </div>
                            <button
                              onClick={() => setGoalOptions(prev => prev.filter((_, i) => i !== idx))}
                              className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 p-1.5 rounded-lg transition-all shrink-0 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add Goal Option Form */}
                      <div className="bg-[#070a13] border border-[#151c2f] rounded-xl p-5 space-y-4">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Add Custom Onboarding Goal</span>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Goal Identifier</label>
                            <input
                              type="text"
                              placeholder="e.g. machine-learning"
                              value={newGoalId}
                              onChange={e => setNewGoalId(e.target.value)}
                              className="bg-[#0f1322] border border-[#151c2f] rounded-xl p-3 text-xs text-white font-bold focus:outline-none focus:border-purple-500/50"
                            />
                          </div>
                          
                          <div className="flex flex-col gap-1.5 md:col-span-2">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Goal Label/Title</label>
                            <input
                              type="text"
                              placeholder="e.g. Machine Learning Prep"
                              value={newGoalLabel}
                              onChange={e => setNewGoalLabel(e.target.value)}
                              className="bg-[#0f1322] border border-[#151c2f] rounded-xl p-3 text-xs text-white font-bold focus:outline-none focus:border-purple-500/50"
                            />
                          </div>
                          
                          <div className="flex flex-col gap-1.5 md:col-span-3">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Goal Description</label>
                            <input
                              type="text"
                              placeholder="e.g. Master classification, regression models, and model tuning."
                              value={newGoalDesc}
                              onChange={e => setNewGoalDesc(e.target.value)}
                              className="bg-[#0f1322] border border-[#151c2f] rounded-xl p-3 text-xs text-white font-bold focus:outline-none focus:border-purple-500/50"
                            />
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            if (!newGoalId.trim() || !newGoalLabel.trim()) return;
                            setGoalOptions(prev => [...prev, { id: newGoalId.trim(), label: newGoalLabel.trim(), desc: newGoalDesc.trim() }]);
                            setNewGoalId('');
                            setNewGoalLabel('');
                            setNewGoalDesc('');
                          }}
                          className="flex items-center gap-1.5 px-4.5 py-2.5 bg-purple-500/10 hover:bg-purple-500/25 border border-purple-500/30 text-purple-400 text-xs font-bold rounded-xl transition-all cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Goal Option</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* States Tab Editor */}
                  {activeTab === 'states' && (
                    <div className="space-y-5 animate-scaleUp">
                      <div className="flex flex-wrap gap-2.5 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar p-1">
                        {indianStates.map((st, idx) => (
                          <div key={st || idx} className="px-3.5 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 rounded-xl text-xs font-bold flex items-center gap-2 animate-scaleUp">
                            <span>{st}</span>
                            <button
                              onClick={() => setIndianStates(prev => prev.filter((_, i) => i !== idx))}
                              className="text-indigo-400 hover:text-rose-400 p-0.5 rounded transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add State Form */}
                      <div className="bg-[#070a13] border border-[#151c2f] rounded-xl p-5 flex flex-col sm:flex-row gap-4 items-end">
                        <div className="flex-1 space-y-1.5">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Add Indian State / Union Territory</label>
                          <input
                            type="text"
                            placeholder="e.g. Telangana"
                            value={newState}
                            onChange={e => setNewState(e.target.value)}
                            className="w-full bg-[#0f1322] border border-[#151c2f] rounded-xl p-3 text-xs text-white font-bold focus:outline-none focus:border-purple-500/50"
                          />
                        </div>
                        <button
                          onClick={() => {
                            if (!newState.trim()) return;
                            if (indianStates.includes(newState.trim())) return;
                            setIndianStates(prev => [...prev, newState.trim()]);
                            setNewState('');
                          }}
                          className="flex items-center gap-1.5 px-5 py-3 bg-indigo-500/10 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-400 text-xs font-bold rounded-xl transition-all cursor-pointer h-11"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add State</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Timelines Tab Editor */}
                  {activeTab === 'timelines' && (
                    <div className="space-y-5 animate-scaleUp">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4.5 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {timelineOptions.map((time, idx) => (
                          <div key={time || idx} className="p-3 bg-[#070a13] border border-[#151c2f] rounded-xl flex items-center justify-between gap-3 text-xs font-bold text-slate-200">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4.5 h-4.5 text-slate-500" />
                              <span>{time}</span>
                            </div>
                            <button
                              onClick={() => setTimelineOptions(prev => prev.filter((_, i) => i !== idx))}
                              className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 p-1 rounded-lg transition-all shrink-0 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add Timeline Form */}
                      <div className="bg-[#070a13] border border-[#151c2f] rounded-xl p-5 flex flex-col sm:flex-row gap-4 items-end">
                        <div className="flex-1 space-y-1.5">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Add Timeline Metric Option</label>
                          <input
                            type="text"
                            placeholder="e.g. Within 2 Weeks"
                            value={newTimeline}
                            onChange={e => setNewTimeline(e.target.value)}
                            className="w-full bg-[#0f1322] border border-[#151c2f] rounded-xl p-3 text-xs text-white font-bold focus:outline-none focus:border-purple-500/50"
                          />
                        </div>
                        <button
                          onClick={() => {
                            if (!newTimeline.trim()) return;
                            if (timelineOptions.includes(newTimeline.trim())) return;
                            setTimelineOptions(prev => [...prev, newTimeline.trim()]);
                            setNewTimeline('');
                          }}
                          className="flex items-center gap-1.5 px-5 py-3 bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-xl transition-all cursor-pointer h-11"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Timeline</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Commitments Tab Editor */}
                  {activeTab === 'commitments' && (
                    <div className="space-y-5 animate-scaleUp">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4.5 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {commitmentOptions.map((commit, idx) => (
                          <div key={commit || idx} className="p-3 bg-[#070a13] border border-[#151c2f] rounded-xl flex items-center justify-between gap-3 text-xs font-bold text-slate-200">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4.5 h-4.5 text-slate-500" />
                              <span>{commit}</span>
                            </div>
                            <button
                              onClick={() => setCommitmentOptions(prev => prev.filter((_, i) => i !== idx))}
                              className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 p-1 rounded-lg transition-all shrink-0 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add Commitment Form */}
                      <div className="bg-[#070a13] border border-[#151c2f] rounded-xl p-5 flex flex-col sm:flex-row gap-4 items-end">
                        <div className="flex-1 space-y-1.5">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Add Weekly Commitment Option</label>
                          <input
                            type="text"
                            placeholder="e.g. 20+ Hours per Week"
                            value={newCommitment}
                            onChange={e => setNewCommitment(e.target.value)}
                            className="w-full bg-[#0f1322] border border-[#151c2f] rounded-xl p-3 text-xs text-white font-bold focus:outline-none focus:border-purple-500/50"
                          />
                        </div>
                        <button
                          onClick={() => {
                            if (!newCommitment.trim()) return;
                            if (commitmentOptions.includes(newCommitment.trim())) return;
                            setCommitmentOptions(prev => [...prev, newCommitment.trim()]);
                            setNewCommitment('');
                          }}
                          className="flex items-center gap-1.5 px-5 py-3 bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 text-xs font-bold rounded-xl transition-all cursor-pointer h-11"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Commitment</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Learning Preferences Tab Editor */}
                  {activeTab === 'preferences' && (
                    <div className="space-y-5 animate-scaleUp">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4.5 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {preferenceOptions.map((pref, idx) => (
                          <div key={pref || idx} className="p-3 bg-[#070a13] border border-[#151c2f] rounded-xl flex items-center justify-between gap-3 text-xs font-bold text-slate-200">
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-4.5 h-4.5 text-slate-500" />
                              <span>{pref}</span>
                            </div>
                            <button
                              onClick={() => setPreferenceOptions(prev => prev.filter((_, i) => i !== idx))}
                              className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 p-1 rounded-lg transition-all shrink-0 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add Learning Preference Form */}
                      <div className="bg-[#070a13] border border-[#151c2f] rounded-xl p-5 flex flex-col sm:flex-row gap-4 items-end">
                        <div className="flex-1 space-y-1.5">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Add Pedagogical Learning Preference</label>
                          <input
                            type="text"
                            placeholder="e.g. Concept-oriented Interactive Lectures"
                            value={newPreference}
                            onChange={e => setNewPreference(e.target.value)}
                            className="w-full bg-[#0f1322] border border-[#151c2f] rounded-xl p-3 text-xs text-white font-bold focus:outline-none focus:border-purple-500/50"
                          />
                        </div>
                        <button
                          onClick={() => {
                            if (!newPreference.trim()) return;
                            if (preferenceOptions.includes(newPreference.trim())) return;
                            setPreferenceOptions(prev => [...prev, newPreference.trim()]);
                            setNewPreference('');
                          }}
                          className="flex items-center gap-1.5 px-5 py-3 bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 text-xs font-bold rounded-xl transition-all cursor-pointer h-11"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Preference</span>
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>

            {/* Premium Discard / Save Changes Button Row at very bottom */}
            <div className="flex items-center justify-between border-t border-[#151c2f] pt-6 pb-2">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00ffcc] animate-pulse" />
                <span>All changes will be logged in the global audit trail.</span>
              </span>

              <div className="flex items-center gap-3">
                <a 
                  href="/admin/dashboard" 
                  className="px-5 py-2.5 bg-[#0d1323] hover:bg-[#1b233a] border border-[#151c2f] text-slate-400 hover:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Discard
                </a>
                <button 
                  onClick={handleSaveOnboarding}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-purple-500/15 cursor-pointer active:scale-98"
                >
                  Save Changes
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
