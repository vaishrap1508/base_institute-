'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, Shield, RefreshCw, Server, Lock, Trash2, 
  Database, Save, Cpu, Plus, BookOpen, Calendar, Clock, 
  MapPin, Target, Edit, Check, ChevronRight, Activity, Bell, Grid, Eye, ShieldAlert,
  Compass, X, Loader2, AlertOctagon, AlertTriangle
} from 'lucide-react';
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';
import { USER_ROLES, SAMPLE_QUESTIONS, DOMAINS_DATA } from '@/lib/admin/store';
import { UserRole } from '@/lib/admin/types';
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
  const [currentRole, setCurrentRole] = useState<UserRole>(USER_ROLES[0]);
  
  // Master Tab State
  const [activeMasterTab, setActiveMasterTab] = useState<'settings' | 'control-centre'>('settings');

  // System Overrides States
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [emergencyThrottle, setEmergencyThrottle] = useState(false);
  const [betaLabAccess, setBetaLabAccess] = useState(false);

  // Modals States
  const [showPurgeModal, setShowPurgeModal] = useState(false);
  const [purgeInput, setPurgeInput] = useState('');
  const [isPurging, setIsPurging] = useState(false);

  const [showModModal, setShowModModal] = useState(false);
  const [pendingItemsCount, setPendingItemsCount] = useState(0);
  const [modStep, setModStep] = useState(0);
  const [flagStats, setFlagStats] = useState({ q: 0, l: 0, c: 0 });

  const [modQueue, setModQueue] = useState<any[]>([]);
  const [storagePercent, setStoragePercent] = useState(0);
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

  // Auth Info State
  const [accountSummary, setAccountSummary] = useState({
    storageTier: 'Standard Database',
    lastLogin: 'Active session'
  });

  // Form states for adding items
  const [newGoalId, setNewGoalId] = useState('');
  const [newGoalLabel, setNewGoalLabel] = useState('');
  const [newGoalDesc, setNewGoalDesc] = useState('');
  const [newTimeline, setNewTimeline] = useState('');
  const [newCommitment, setNewCommitment] = useState('');
  const [newPreference, setNewPreference] = useState('');
  const [newState, setNewState] = useState('');

  // Dynamic Real-time System Alerts
  const [systemAlerts, setSystemAlerts] = useState<any[]>([]);

  // Fetch real-time alerts from backend API
  const fetchAlerts = async () => {
    try {
      const res = await fetch('/api/admin/alerts');
      const data = await res.json();
      if (data?.success && data?.alerts) {
        setSystemAlerts(data.alerts);
      }
    } catch (err) {
      console.error("Failed to load real-time alerts:", err);
    }
  };

  const resolveAlert = async (id: string, successMsg: string) => {
    try {
      await fetch(`/api/admin/alerts?id=${id}`, { method: 'DELETE' });
      setNotification(successMsg);
      fetchAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  const postLog = async (title: string, description: string, category: string = 'SYSTEM', severity: string = 'info') => {
    try {
      await fetch('/api/admin/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, category, user: currentRole.name || 'System Admin', severity })
      });
    } catch (err) {
      console.warn("Failed to post system log event:", err);
    }
  };

  const fetchRealtimeData = async () => {
    // We try to pull from the 'moderation_queue' if it exists, otherwise it stays empty.
    const { data: qData } = await supabase.from('moderation_queue').select('*').limit(100);
    if (qData) {
      setModQueue(qData);
      setPendingItemsCount(qData.length);
      let q = 0, l = 0, c = 0;
      qData.forEach(item => {
         const domain = String(item.domain || item.domain_id || '').toLowerCase();
         if (domain.includes('q') || domain.includes('quant')) q++;
         else if (domain.includes('l') || domain.includes('logic')) l++;
         else c++;
      });
      setFlagStats({ q, l, c });
    } else {
      setModQueue([]);
      setPendingItemsCount(0);
      setFlagStats({ q: 0, l: 0, c: 0 });
    }
    
    // Simulate checking actual storage based on some dynamic DB factor or we can just query a settings table.
    // For now, since there isn't a direct DB API for storage byte size on JS client, we set 0% or base it on row count
    const { count } = await supabase.from('questions').select('*', { count: 'exact', head: true });
    setStoragePercent(count && count > 0 ? Math.min(100, Math.floor((count / 100000) * 100)) : 0);
  };

  useEffect(() => {
    fetchAlerts();
    fetchRealtimeData();
    const interval = setInterval(() => {
      fetchAlerts();
      fetchRealtimeData();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const renderAlertIcon = (iconName: string) => {
    switch (iconName) {
      case 'cpu':
        return <Cpu className="w-4 h-4 animate-pulse" />;
      case 'activity':
        return <Activity className="w-4 h-4" />;
      case 'database':
        return <Database className="w-4 h-4" />;
      case 'lock':
        return <Lock className="w-4 h-4" />;
      case 'book':
        return <BookOpen className="w-4 h-4" />;
      default:
        return <ShieldAlert className="w-4 h-4" />;
    }
  };

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

      // Post catalog sync alert in real-time
      const logDesc = `Onboarding customizer options successfully saved and synced to database. Current set includes ${preferenceOptions.length} preferences.`;
      await fetch('/api/admin/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Onboarding Flow Synced',
          description: logDesc,
          type: 'Catalog Sync',
          severity: 'info',
          icon: 'database'
        })
      });
      postLog('Onboarding Flow Synced', logDesc, 'CATALOG');
      fetchAlerts();
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
    // Sync current role from localStorage
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

    const fetchAccountData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const lastSignIn = new Date(user.last_sign_in_at || user.created_at);
          const diffMs = Date.now() - lastSignIn.getTime();
          const diffMins = Math.floor(diffMs / 60000);
          
          let loginStr = '';
          if (diffMins < 60) loginStr = `${Math.max(1, diffMins)}m ago`;
          else if (diffMins < 1440) loginStr = `${Math.floor(diffMins/60)}h ago`;
          else loginStr = `${Math.floor(diffMins/1440)}d ago`;

          const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          const tzLocation = timezone ? timezone.split('/')[1]?.replace('_', ' ') || timezone : 'Local';

          setAccountSummary(prev => ({
            ...prev,
            lastLogin: `${loginStr} (${tzLocation})`
          }));
        }
      } catch (err) {
        console.warn("Auth fetch error", err);
      }
    };
    fetchAccountData();
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
                  {activeMasterTab === 'settings' ? 'System Settings' : 'Control Centre'}
                </h1>
              </div>

              {/* Master Tab Navigation */}
              <div className="relative flex bg-[#070a13] p-0.5 rounded-full border border-[#151c2f] shadow-inner select-none self-stretch sm:self-auto w-full sm:w-[320px]">
                {/* Sliding indicator */}
                <div 
                  className={`absolute top-0.5 bottom-0.5 left-0.5 w-[calc(50%-2px)] bg-purple-600 rounded-full shadow-[0_0_15px_rgba(147,51,234,0.3)] transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]`}
                  style={{ transform: activeMasterTab === 'settings' ? 'translateX(0)' : 'translateX(100%)' }}
                />
                <button
                  type="button"
                  onClick={() => setActiveMasterTab('settings')}
                  className={`relative z-10 w-1/2 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors duration-300 cursor-pointer ${
                    activeMasterTab === 'settings'
                      ? 'text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Core Settings
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMasterTab('control-centre')}
                  className={`relative z-10 w-1/2 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors duration-300 cursor-pointer ${
                    activeMasterTab === 'control-centre'
                      ? 'text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Control Centre
                </button>
              </div>
            </div>

            {activeMasterTab === 'settings' ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-forwards">
                {/* Hybrid Grid Layout: 2-Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column (col-span-2): Admin Profile & Dispatch / Notifications Preferences */}
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

                {/* Dispatch & Alerts Toggles */}
                <div className="bg-[#0f1322] border border-[#151c2f] rounded-2xl p-6 space-y-6">
                  <span className="text-[10px] font-black text-slate-400 tracking-wider uppercase leading-none">
                    Dispatch & Alert Preferences
                  </span>
                  
                  <div className="space-y-4 pt-2">
                    {/* Item 1 */}
                    <div className="flex items-center justify-between p-4 bg-[#070a13] border border-[#151c2f]/80 rounded-xl">
                      <div className="flex flex-col gap-1 pr-4">
                        <span className="text-xs font-bold text-slate-200">Security Alerts</span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                          Immediate broadcast for unusual login or access attempts.
                        </span>
                      </div>
                      {renderToggle(securityAlerts, () => setSecurityAlerts(!securityAlerts))}
                    </div>

                    {/* Item 2 */}
                    <div className="flex items-center justify-between p-4 bg-[#070a13] border border-[#151c2f]/80 rounded-xl">
                      <div className="flex flex-col gap-1 pr-4">
                        <span className="text-xs font-bold text-slate-200">Platform Health Summaries</span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                          Weekly report summarizing platform availability and test attempts.
                        </span>
                      </div>
                      {renderToggle(systemHealthReports, () => setSystemHealthReports(!systemHealthReports))}
                    </div>

                    {/* Item 3 */}
                    <div className="flex items-center justify-between p-4 bg-[#070a13] border border-[#151c2f]/80 rounded-xl">
                      <div className="flex flex-col gap-1 pr-4">
                        <span className="text-xs font-bold text-slate-200">Student Milestone Alerts</span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                          Notifications when student enrollment or solved test milestones are achieved.
                        </span>
                      </div>
                      {renderToggle(userMilestoneUpdates, () => setUserMilestoneUpdates(!userMilestoneUpdates))}
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column (col-span-1): Account Summary & System Overview */}
              <div className="lg:col-span-1 space-y-6">
                
                {/* Account Summary */}
                <div className="bg-[#0f1322] border border-[#151c2f] rounded-2xl p-6 space-y-4">
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wider border-b border-[#151c2f] pb-3.5 font-heading">
                    Account Summary
                  </h3>
                  
                  <div className="space-y-3.5 text-xs">
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-400 font-semibold">Current Role</span>
                      <span className="font-bold text-white">{currentRole.name}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-t border-[#151c2f]/60">
                      <span className="text-slate-400 font-semibold">Environment</span>
                      <span className="font-bold text-emerald-400">Production Ready</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-t border-[#151c2f]/60">
                      <span className="text-slate-400 font-semibold">Last Login</span>
                      <span className="font-bold text-slate-300">{accountSummary.lastLogin}</span>
                    </div>
                  </div>
                </div>

                {/* System Status Overview */}
                <div className="bg-[#0f1322] border border-[#151c2f] rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-2 border-b border-[#151c2f] pb-3.5">
                    <Shield className="w-4.5 h-4.5 text-emerald-400" />
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-heading">
                      Platform Environment
                    </h3>
                  </div>
                  
                  <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                    Operating in <strong className="text-purple-400">{currentRole.name} Mode</strong>. Changes made to onboarding flow and settings persist directly to the production database.
                  </p>
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
            <div className="flex items-center justify-end border-t border-[#151c2f] pt-6 pb-2">

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
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-forwards">
                
                {/* Warnings & Alerts */}
                <div className="bg-[#0f1322] border border-[#151c2f] rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#151c2f] pb-3">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-rose-500 animate-pulse" />
                      <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-heading">
                        Warnings & Alerts
                      </h3>
                    </div>
                    <span className="text-[9px] font-black px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 uppercase tracking-wide animate-pulse">
                      {systemAlerts.filter(a => a.severity === 'critical').length} Critical
                    </span>
                  </div>

                  <div className="space-y-3">
                    {systemAlerts.length > 0 ? (
                      systemAlerts.map((alert) => (
                        <div key={alert.id} className="flex items-start gap-4 p-4 bg-[#070a13]/85 border border-[#151c2f] rounded-xl relative group hover:border-[#151c2f] hover:border-rose-500/25 transition-all duration-200">
                          <div className="w-8.5 h-8.5 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                            {renderAlertIcon(alert.icon)}
                          </div>
                          <div className="flex-1 min-w-0 pr-24 text-left">
                            <div className="flex items-baseline gap-2">
                              <span className="text-xs font-bold text-white">{alert.title}</span>
                              <span className="text-[9px] font-semibold text-slate-500">{alert.time}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-normal mt-1 font-semibold">
                              {alert.description}
                            </p>
                          </div>
                          <button 
                            onClick={() => {
                              const actionMsg = alert.icon === 'cpu' 
                                ? "LaTeX Syntax auto-corrected. Q-8029-X refreshed successfully." 
                                : alert.icon === 'activity' 
                                  ? "Administrative audit lock enforced on Marcus Wright's XP logs." 
                                  : "Alert resolved and cleared from active logs.";
                              resolveAlert(alert.id, actionMsg);
                            }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-[#1b233a] hover:bg-[#253254] text-slate-350 rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer border-0"
                          >
                            {alert.icon === 'cpu' ? 'Fix Render' : alert.icon === 'activity' ? 'Flag User' : 'Acknowledge'}
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="py-6 flex flex-col items-center justify-center text-slate-500">
                        <Check className="w-6 h-6 text-emerald-450 mb-1 animate-bounce" />
                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-450">All alerts resolved</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Grid Row 2: Reset User Data & Moderate Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Reset User Data */}
                  <div className="bg-[#0f1322] border border-[#151c2f] rounded-2xl p-6 flex flex-col justify-between min-h-[220px]">
                    <div className="space-y-3.5 text-left">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 flex items-center justify-center rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 font-extrabold text-[12px]">!</span>
                        <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-heading">
                          Reset Leaderboards & Streaks
                        </h3>
                      </div>
                      <p className="text-xs text-slate-400 leading-normal font-semibold">
                        Permanently reset all student learning streaks, streak counts, leaderboard XP levels, and mock test scores for the current academic session. This resets all leaderboard entries to 0 XP.
                      </p>
                    </div>
                    
                    <button
                      onClick={() => setShowPurgeModal(true)}
                      className="w-full py-3 mt-4 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/35 hover:border-rose-500/50 text-rose-400 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center active:scale-98 animate-pulse hover:animate-none"
                    >
                      Initiate Progress Reset
                    </button>
                  </div>

                  {/* Moderate Content */}
                  <div className="bg-[#0f1322] border border-[#151c2f] rounded-2xl p-6 flex flex-col justify-between min-h-[220px]">
                    <div className="space-y-3.5 text-left">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4.5 h-4.5 text-indigo-400" />
                          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-heading">
                            Moderate Content
                          </h3>
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-800/60 border border-slate-700/55 px-2.5 py-0.5 rounded-full shrink-0 animate-pulse">
                          {pendingItemsCount} Pending Items
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-normal font-semibold">
                        Review AI-flagged community contributions, video explanations, and peer discussions for guidelines compliance, plagiarism, and mathematical formula accuracy.
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      {/* Avatars */}
                      <div className="flex -space-x-2.5 overflow-hidden">
                        <img className="inline-block h-6.5 w-6.5 rounded-full ring-2 ring-[#0f1322] object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80" alt="JD" />
                        <img className="inline-block h-6.5 w-6.5 rounded-full ring-2 ring-[#0f1322] object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80" alt="SC" />
                        <div className="inline-block h-6.5 w-6.5 rounded-full bg-[#1b233a] ring-2 ring-[#0f1322] flex items-center justify-center text-[9px] font-bold text-slate-400 uppercase">
                          +3
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setModStep(0);
                          setShowModModal(true);
                        }}
                        className="flex items-center gap-1 text-[11px] font-black text-cyan-400 hover:text-cyan-300 uppercase tracking-wider transition-colors cursor-pointer bg-transparent border-0"
                      >
                        <span>Open Queue</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>

                {/* Grid Row 3: Flagged Questions & System Overrides */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Flagged Questions */}
                  <div className="bg-[#0f1322] border border-[#151c2f] rounded-2xl p-6 flex flex-col justify-between min-h-[220px]">
                    <div className="space-y-3.5 text-left">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4.5 h-4.5 text-emerald-400" />
                        <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-heading">
                          Flagged Questions
                        </h3>
                      </div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-0.5">
                        Reported by Top-Tier Users
                      </p>

                      <div className="pt-2">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-slate-300">Unresolved Flags</span>
                          <span className="text-emerald-400 font-extrabold">{pendingItemsCount} Cases</span>
                        </div>
                        <p className="text-[9px] font-semibold text-slate-500 mt-1 text-left">
                          {flagStats.q} Quantitative, {flagStats.l} Logical, {flagStats.c} Coding & DSA
                        </p>
                        <div className="h-2 bg-[#070a13] border border-[#151c2f] rounded-full overflow-hidden mt-2">
                          <div 
                            className="h-full bg-emerald-400 rounded-full transition-all duration-1000" 
                            style={{ width: `${Math.min(100, pendingItemsCount > 0 ? (pendingItemsCount / 100) * 100 : 0)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => setNotification("Loading question auditor log panel...")}
                      className="w-full py-2.5 mt-4 bg-[#1b233a] hover:bg-[#253254] text-slate-200 border border-[#1b233a] rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer text-center"
                    >
                      Open Question Auditor
                    </button>
                  </div>

                  {/* System Overrides */}
                  <div className="bg-[#0f1322] border border-[#151c2f] rounded-2xl p-6 space-y-4.5">
                    <div className="flex items-center justify-between border-b border-[#151c2f] pb-3">
                      <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-heading">
                        System Overrides
                      </h3>
                    </div>

                    <div className="space-y-3.5">
                      {/* Item 1 */}
                      <div className="flex items-center justify-between p-3.5 bg-[#070a13] border border-[#151c2f] rounded-xl">
                        <div className="flex flex-col gap-0.5 pr-4 text-left">
                          <span className="text-xs font-bold text-slate-200">Platform Read-Only Mode</span>
                          <span className="text-[9px] text-slate-500 font-semibold uppercase">Disable submissions during DB syncs</span>
                        </div>
                        {renderToggle(maintenanceMode, () => {
                          const nextVal = !maintenanceMode;
                          setMaintenanceMode(nextVal);
                          const desc = nextVal ? "Platform set to Read-Only Mode. Submissions suspended." : "Platform Write-Access restored. Submissions online.";
                          setNotification(desc);
                          postLog('Platform Read-Only Mode Toggled', desc, 'OVERRIDE', 'warning');
                        })}
                      </div>

                      {/* Item 2 */}
                      <div className="flex items-center justify-between p-3.5 bg-[#070a13] border border-[#151c2f] rounded-xl">
                        <div className="flex flex-col gap-0.5 pr-4 text-left">
                          <span className="text-xs font-bold text-slate-200">AI Mentor Rate Limiting</span>
                          <span className="text-[9px] text-slate-500 font-semibold uppercase">Throttle ELI5 requests by 50%</span>
                        </div>
                        {renderToggle(emergencyThrottle, () => {
                          const nextVal = !emergencyThrottle;
                          setEmergencyThrottle(nextVal);
                          const desc = nextVal ? "AI Mentor Rate Limit enabled: Token capacities throttled by 50%." : "AI Mentor Rate Limit disabled. Token capacity restored to 100%.";
                          setNotification(desc);
                          postLog('AI Mentor Throttle Toggled', desc, 'OVERRIDE', 'info');
                        })}
                      </div>

                      {/* Item 3 */}
                      <div className="flex items-center justify-between p-3.5 bg-[#070a13] border border-[#151c2f] rounded-xl">
                        <div className="flex flex-col gap-0.5 pr-4 text-left">
                          <span className="text-xs font-bold text-slate-200">Gamified Streaks Engine v2</span>
                          <span className="text-[9px] text-slate-500 font-semibold uppercase">Enable daily quest UI for students</span>
                        </div>
                        {renderToggle(betaLabAccess, () => {
                          const nextVal = !betaLabAccess;
                          setBetaLabAccess(nextVal);
                          const desc = nextVal ? "Streaks Engine v2 enabled. Daily quests activated." : "Streaks Engine v2 disabled. Daily quests suspended.";
                          setNotification(desc);
                          postLog('Streaks Engine v2 Toggled', desc, 'OVERRIDE', 'info');
                        })}
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* Modals & Dialogs overlays */}
            {showPurgeModal && (
              <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4">
                <div className="w-full max-w-md bg-[#0f1322] border border-rose-500/20 p-6 rounded-2xl shadow-2xl space-y-5 animate-scaleUp">
                  <div className="flex items-center justify-between border-b border-[#151c2f] pb-3">
                    <div className="flex items-center gap-2 text-rose-400">
                      <AlertOctagon className="w-5 h-5 animate-pulse" />
                      <span className="text-sm font-extrabold uppercase tracking-wider font-heading">Purge Protocol Authorization</span>
                    </div>
                    <button 
                      onClick={() => { setShowPurgeModal(false); setPurgeInput(''); }}
                      className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 cursor-pointer bg-transparent border-0"
                    >
                      <X className="w-4.5 h-4.5" />
                    </button>
                  </div>

                  <div className="space-y-3 text-left">
                    <p className="text-xs text-slate-300 font-semibold leading-relaxed">
                      This protocol will permanently delete student leaderboard rankings, streak tallies, XP histories, and mock exam grades from the production database.
                    </p>
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[10px] font-bold text-rose-400 uppercase tracking-wide">
                      Warning: This action is irreversible. Leaderboards will reset to 0 XP immediately.
                    </div>
                    
                    <div className="space-y-1.5 pt-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Type CONFIRM-PURGE to authorize:</label>
                      <input
                        type="text"
                        placeholder="CONFIRM-PURGE"
                        value={purgeInput}
                        onChange={(e) => setPurgeInput(e.target.value)}
                        className="w-full bg-[#070a13] border border-[#151c2f] rounded-xl p-3 text-xs text-white font-mono tracking-widest focus:outline-none focus:border-rose-500/50"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => { setShowPurgeModal(false); setPurgeInput(''); }}
                      className="flex-1 py-2.5 bg-[#0d1323] hover:bg-[#1b233a] border border-[#151c2f] text-slate-400 hover:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={purgeInput !== 'CONFIRM-PURGE' || isPurging}
                      onClick={async () => {
                        setIsPurging(true);
                        await new Promise(r => setTimeout(r, 1500));
                        setIsPurging(false);
                        setShowPurgeModal(false);
                        setPurgeInput('');
                        setNotification("Purge complete: Leaderboards, streaks, and progress records reset for all student profiles.");
                        // Post critical log event to system alerts
                        await fetch('/api/admin/alerts', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            title: 'Leaderboards Progress Reset',
                            description: 'Database purge protocol executed by admin. Student XP and streak logs reset to 0.',
                            type: 'Security Audit',
                            severity: 'critical',
                            icon: 'lock'
                          })
                        });
                        postLog('Leaderboards Progress Reset', 'Database purge protocol executed by admin. Student XP and streak logs reset to 0.', 'SECURITY', 'critical');
                        fetchAlerts();
                      }}
                      className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-rose-600/15 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                    >
                      {isPurging ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Purging...</span>
                        </>
                      ) : (
                        <span>Execute Purge</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showModModal && (
              <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4">
                <div className="w-full max-w-lg bg-[#0f1322] border border-[#151c2f] p-6 rounded-2xl shadow-2xl space-y-5 animate-scaleUp">
                  <div className="flex items-center justify-between border-b border-[#151c2f] pb-3">
                    <div className="flex items-center gap-2 text-indigo-400">
                      <BookOpen className="w-4.5 h-4.5" />
                      <span className="text-sm font-extrabold uppercase tracking-wider font-heading">Content Moderation Queue</span>
                    </div>
                    <button 
                      onClick={() => setShowModModal(false)}
                      className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 cursor-pointer bg-transparent border-0"
                    >
                      <X className="w-4.5 h-4.5" />
                    </button>
                  </div>

                  {modStep < modQueue.length ? (
                    <div className="space-y-4 text-left">
                      <div className="flex justify-between items-center bg-[#070a13] p-3 border border-[#151c2f] rounded-xl text-[10px] font-bold uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">Item:</span>
                          <span className="text-white">{modQueue[modStep].id}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">Flag Type:</span>
                          <span className="text-rose-400">{modQueue[modStep].type}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Author Context</span>
                        <p className="text-xs font-bold text-slate-200">{modQueue[modStep].author}</p>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Flagged Content Preview</span>
                        <div className="bg-[#070a13] border border-[#151c2f] p-3.5 rounded-xl font-mono text-[11px] text-slate-300 leading-relaxed whitespace-pre-wrap">
                          {modQueue[modStep].content}
                        </div>
                      </div>

                      <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-[10px] font-bold text-indigo-400 uppercase tracking-wide flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>AI Reasoning: {modQueue[modStep].detail}</span>
                      </div>

                      <div className="flex items-center gap-2.5 pt-2">
                        <button
                          onClick={async () => {
                            setPendingItemsCount(prev => Math.max(0, prev - 1));
                            setNotification(`Moderation action: Content rejected & purged from active database queue.`);
                            const targetItem = modQueue[modStep];
                            setModStep(prev => prev + 1);
                            const logDesc = `Rejected and deleted AI-flagged contribution ${targetItem.id} submitted by student ${targetItem.author.split(' ')[0]}.`;
                            await fetch('/api/admin/alerts', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                title: 'Flagged Content Purged',
                                description: logDesc,
                                type: 'Content Moderation',
                                severity: 'warning',
                                icon: 'book'
                              })
                            });
                            postLog('Flagged Content Purged', logDesc, 'MODERATION', 'warning');
                            fetchAlerts();
                          }}
                          className="flex-1 py-2.5 bg-rose-600/15 hover:bg-rose-600/25 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-bold transition-all cursor-pointer uppercase tracking-wider"
                        >
                          Purge & Reject
                        </button>
                        <button
                          onClick={() => {
                            setModStep(prev => prev + 1);
                          }}
                          className="py-2.5 px-4 bg-[#1b233a] hover:bg-[#253254] text-slate-400 hover:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer uppercase tracking-wider"
                        >
                          Skip
                        </button>
                        <button
                          onClick={async () => {
                            setPendingItemsCount(prev => Math.max(0, prev - 1));
                            setNotification(`Moderation action: Flag cleared. Content published.`);
                            const targetItem = modQueue[modStep];
                            setModStep(prev => prev + 1);
                            const logDesc = `Approved and published AI-flagged contribution ${targetItem.id} submitted by student ${targetItem.author.split(' ')[0]}.`;
                            await fetch('/api/admin/alerts', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                title: 'Content Flag Cleared',
                                description: logDesc,
                                type: 'Content Moderation',
                                severity: 'info',
                                icon: 'book'
                              })
                            });
                            postLog('Content Flag Cleared', logDesc, 'MODERATION', 'info');
                            fetchAlerts();
                          }}
                          className="flex-1 py-2.5 bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-bold transition-all cursor-pointer uppercase tracking-wider"
                        >
                          Approve & Publish
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 flex flex-col items-center justify-center gap-3 text-center">
                      <Check className="w-10 h-10 text-emerald-400 bg-emerald-400/10 border border-emerald-400/25 p-2 rounded-full" />
                      <div className="space-y-1 mt-1">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Queue Cleared</h4>
                        <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest">No remaining flagged queue tasks found.</p>
                      </div>
                      <button
                        onClick={() => setShowModModal(false)}
                        className="mt-3 px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg cursor-pointer"
                      >
                        Close Queue
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
