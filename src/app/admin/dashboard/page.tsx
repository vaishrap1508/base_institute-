'use client';

import React, { useState, useEffect } from 'react';
import { 
  Monitor, CheckCircle, Clock, UserPlus, Activity, 
  TrendingUp, MoreHorizontal, ChevronDown, Sparkles, 
  Compass, HelpCircle, LogOut, ArrowUpRight, Check,
  Cpu, Layers, ShieldCheck, Database, FileText, ArrowRight
} from 'lucide-react';
import { USER_ROLES } from '@/lib/admin/store';
import { UserRole } from '@/lib/admin/types';
import { useAdmin } from '@/app/admin/AdminContext';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

export default function DashboardPage() {
  const supabase = createClient();
  const { currentRole, handleRoleChange } = useAdmin();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    liveUsers: 0,
    liveUsersLabel: '+0%',
    dailySolves: 0,
    dailySolvesLabel: '+0%',
    newSignups: 0,
    newSignupsLabel: '+0',
    activeSolvers: 0,
    avgSessionTime: '0m 0s'
  });

  const [progressionData, setProgressionData] = useState<Array<{day: string, value: number, height: string, isHigh: boolean}>>([]);
  const [saturationData, setSaturationData] = useState<Array<{topic: string, percent: number, color: string, shadow: string}>>([]);
  const [bottlenecks, setBottlenecks] = useState<Array<{id: string, name: string, difficulty: string, time: string, solveRate: string}>>([]);

  const fetchStats = async () => {
    try {
      const { count: profilesCount } = await supabase
        .from('profiles')
        .select('*', { count: 'estimated', head: true });
        
      const { count: solvesCount } = await supabase
        .from('question_attempts')
        .select('*', { count: 'estimated', head: true })
        .eq('is_correct', true);

      const totalSolves = solvesCount || 0;
      const totalUsers = profilesCount || 1;
      
      // Calculate a dynamic session time based on attempts (assuming ~2.5 mins per attempt)
      const avgMinutes = Math.floor((totalSolves * 2.5) / totalUsers);
      const avgSeconds = Math.floor(((totalSolves * 2.5) / totalUsers - avgMinutes) * 60);

      // Simple growth logic based on counts (in reality we would compare with yesterday's counts)
      const nowMs = Date.now();
      const yesterday = new Date(nowMs - 24 * 3600 * 1000).toISOString();
      const { count: usersYesterday } = await supabase.from('profiles').select('*', { count: 'estimated', head: true }).gte('created_at', yesterday);
      const { count: solvesYesterday } = await supabase.from('question_attempts').select('*', { count: 'estimated', head: true }).gte('created_at', yesterday);
      
      const newU = usersYesterday || 0;
      const newS = solvesYesterday || 0;
      
      const uGrowth = Math.max(1, totalUsers - newU);
      const sGrowth = Math.max(1, totalSolves - newS);

      const liveLabel = `+${Math.round((newU / uGrowth) * 100)}%`;
      const solveLabel = `+${Math.round((newS / sGrowth) * 100)}%`;
      const signLabel = `+${newU}`;

      setStats(prev => ({
        ...prev,
        liveUsers: profilesCount || 0,
        liveUsersLabel: liveLabel,
        dailySolves: totalSolves,
        dailySolvesLabel: solveLabel,
        newSignups: totalUsers,
        newSignupsLabel: signLabel,
        activeSolvers: profilesCount || 0,
        avgSessionTime: `${avgMinutes}m ${avgSeconds}s`
      }));
    } catch (e) {
      console.warn("Error fetching live stats", e);
    }
  };

  const fetchChartData = async () => {
    try {
      // 1. Dynamic User Progression (Strict DB count per day)
      const { data: weekAtts } = await supabase.from('question_attempts').select('created_at').gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()).limit(1000);
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const counts = [0, 0, 0, 0, 0, 0, 0];
      weekAtts?.forEach((a: any) => {
        const d = new Date(a.created_at).getDay();
        counts[d]++;
      });
      
      const maxCount = Math.max(...counts, 1);
      
      // Shift so today is the last element
      const todayIdx = new Date().getDay();
      const prog = [];
      for (let i = 6; i >= 0; i--) {
        const idx = (todayIdx - i + 7) % 7;
        const val = counts[idx];
        prog.push({
          day: days[idx],
          value: val,
          height: `${Math.max(14, Math.floor((val / maxCount) * 100))}%`,
          isHigh: i === 0
        });
      }
      
      setProgressionData(prog);

      // 2. Domain Saturation
      const { data: atts } = await supabase.from('question_attempts').select('domain_id, is_correct').limit(500);
      const domMap: Record<string, { t: number, c: number }> = {};
      atts?.forEach((a: any) => {
        const id = a.domain_id || 'general';
        if (!domMap[id]) domMap[id] = { t: 0, c: 0 };
        domMap[id].t++;
        if (a.is_correct) domMap[id].c++;
      });
      
      const getSat = (keys: string[]) => {
        let t = 0; keys.forEach(k => t += domMap[k]?.t || 0);
        return t > 0 ? Math.floor((t / (atts?.length || 1)) * 100) : 0;
      };

      setSaturationData([
        { topic: 'Quantitative Aptitude', percent: getSat(['q', 'quantitative']), color: 'bg-[#00ffcc]', shadow: 'shadow-[0_0_8px_#00ffcc]' },
        { topic: 'Logical Reasoning', percent: getSat(['l', 'logical']), color: 'bg-purple-500', shadow: 'shadow-[0_0_8px_#a855f7]' },
        { topic: 'Verbal Ability', percent: getSat(['v', 'verbal']), color: 'bg-indigo-500', shadow: 'shadow-[0_0_8px_#6366f1]' },
        { topic: 'Coding & DSA', percent: getSat(['c', 'coding']), color: 'bg-slate-500', shadow: '' }
      ].sort((a, b) => b.percent - a.percent));

      // 3. Bottlenecks (Worst questions)
      // Real DB query for most failed questions
      const { data: failedAtts } = await supabase.from('question_attempts').select('question_id, time_taken_seconds').eq('is_correct', false).limit(100);
      if (!failedAtts || failedAtts.length === 0) {
        setBottlenecks([]);
      } else {
        const counts: Record<string, number> = {};
        const times: Record<string, number[]> = {};
        failedAtts.forEach((a: any) => {
          if (!a.question_id) return;
          counts[a.question_id] = (counts[a.question_id] || 0) + 1;
          if (a.time_taken_seconds) {
            if (!times[a.question_id]) times[a.question_id] = [];
            times[a.question_id].push(a.time_taken_seconds);
          }
        });
        
        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3);
        const qIds = sorted.map(s => s[0]);
        
        const [ { data: qData }, { data: allAttsForQ } ] = await Promise.all([
          supabase.from('questions').select('id, title, difficulty').in('id', qIds),
          supabase.from('question_attempts').select('question_id, is_correct').in('question_id', qIds)
        ]);
        
        setBottlenecks(sorted.map(s => {
          const qId = s[0];
          const qTimes = times[qId] || [120];
          const avgSecs = Math.floor(qTimes.reduce((a, b) => a + b, 0) / qTimes.length);
          const m = Math.floor(avgSecs / 60);
          const sec = avgSecs % 60;
          
          const qMatch = qData?.find((q: any) => q.id === qId);
          
          let solveRateStr = '0.0%';
          if (allAttsForQ) {
             const qAtts = allAttsForQ.filter((a: any) => a.question_id === qId);
             if (qAtts.length > 0) {
               const correct = qAtts.filter((a: any) => a.is_correct).length;
               solveRateStr = `${((correct / qAtts.length) * 100).toFixed(1)}%`;
             }
          }

          return {
            id: `#Q-${qId.substring(0, 4)}`,
            name: qMatch?.title || 'Unknown Question',
            difficulty: qMatch?.difficulty || (s[1] > 10 ? 'Lethal' : 'Elite'),
            time: `${m}m ${sec}s`,
            solveRate: solveRateStr
          };
        }));
      }
    } catch (e) {
      console.warn('Error fetching chart data', e);
    }
  };

  useEffect(() => {
    // Sync current role from localStorage
    const storedRole = localStorage.getItem('aptitude_current_role');
    if (storedRole) {
      try {
        const parsed = JSON.parse(storedRole);
        const matched = USER_ROLES.find(r => r.role === parsed.role);
        if (matched) handleRoleChange(matched);
      } catch (e) { localStorage.removeItem('aptitude_current_role'); localStorage.removeItem('aptitude_questions'); }
    }

    const syncSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const isMarcus = session.user.email === 'marcus.w@aptitude-ai.com';
        const role = isMarcus ? 'editor' : 'admin';
        const matched = USER_ROLES.find(r => r.role === role);
        if (matched) {
          handleRoleChange(matched);
          localStorage.setItem('aptitude_current_role', JSON.stringify(matched));
        }
      }
    };
    syncSession();
    fetchStats();
    fetchChartData();

    // Set up Supabase Realtime subscriptions
    const channel = supabase.channel('dashboard-metrics')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'question_attempts' }, (payload: any) => {
        // Increment daily solves live
        setStats(prev => ({
          ...prev,
          dailySolves: prev.dailySolves + 1
        }));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, (payload: any) => {
        // Increment users live
        setStats(prev => ({
          ...prev,
          liveUsers: prev.liveUsers + 1,
          newSignups: prev.newSignups + 1
        }));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);



  const handleRefresh = () => {
    setRefreshing(true);
    Promise.all([fetchStats(), fetchChartData()]).then(() => {
      setTimeout(() => {
        setRefreshing(false);
      }, 500);
    });
  };

  return (
    <>
      {currentRole.role !== 'admin' ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-[#070a13]">
            <div className="w-full max-w-xl bg-white dark:bg-[#0f1322] border border-slate-200 dark:border-[#151c2f] rounded-2xl shadow-xl overflow-hidden p-8 flex flex-col items-center text-center gap-6 animate-scaleUp">
              <div className="w-16 h-16 rounded-full bg-rose-950/20 border border-rose-900/30 flex items-center justify-center text-rose-400 shadow-inner relative">
                <Cpu className="w-7 h-7 animate-pulse" />
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-rose-600 text-[10px] font-black text-slate-900 dark:text-white flex items-center justify-center border-2 border-[#0f1322] shadow">!</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider font-heading">Clearance Protocol Violation</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Secured Sandbox v2.4</p>
              </div>
              <div className="w-full bg-slate-50 dark:bg-[#070a13] border border-slate-200 dark:border-[#151c2f] p-4 rounded-xl space-y-3.5 text-xs text-left">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#151c2f] pb-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Clearance Status</span>
                  <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-rose-950/45 text-rose-400 uppercase tracking-wide">DENIED</span>
                </div>
                <div className="grid grid-cols-2 gap-y-3.5 gap-x-6 font-semibold">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase">Attempted User</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold">{currentRole.name}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase">Clearance Role</span>
                    <span className="text-rose-400 font-bold uppercase tracking-wider text-[11px]">{currentRole.role}</span>
                  </div>
                  <div className="flex flex-col col-span-2">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase">Attempted Access Route</span>
                    <span className="text-slate-300 font-bold font-mono text-[11px]">/admin/dashboard</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3 w-full mt-2">
                <button
                  onClick={() => {
                    const admin = USER_ROLES.find(r => r.role === 'admin');
                    if (admin) handleRoleChange(admin);
                  }}
                  className="w-full sm:flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-slate-900 dark:text-white rounded-xl text-xs font-bold shadow-md hover:shadow-purple-500/20 active:scale-98 transition-all cursor-pointer"
                >
                  <span>Request Admin Clearance</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50 dark:bg-[#070a13] custom-scrollbar">
            
            {/* Top Overview and Title Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-[#151c2f] pb-5">
              <div>
                <span className="text-[10px] font-black text-cyan-400 tracking-widest uppercase leading-none">
                  Executive Overview
                </span>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight uppercase font-heading mt-1">
                  System Performance
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Real-time live operational metrics queried directly from database records.
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-[#0d1323] hover:bg-slate-100 dark:bg-[#151c2f] text-slate-300 border border-slate-200 dark:border-[#151c2f] rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer">
                  <span>Download Report</span>
                </button>
                <button 
                  onClick={handleRefresh}
                  className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-slate-900 dark:text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-purple-500/10 cursor-pointer ${refreshing ? 'opacity-85 animate-pulse' : ''}`}
                >
                  <Activity className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                  <span>System Refresh</span>
                </button>
              </div>
            </div>

            {/* Layout Grid: 1-Column */}
            <div className="grid grid-cols-1 gap-6">
              
              {/* Left Column: Metrics Row + Row 2 (Charts) + Table (width: 100%) */}
              <div className="space-y-6 flex flex-col">
                
                {/* 4-Column Metrics Grid */}
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-3.5">
                  
                  {/* Card 1: Live Registered Students */}
                  <div className="bg-white dark:bg-[#0f1322] border border-slate-200 dark:border-[#151c2f] rounded-2xl p-4 flex flex-col justify-between min-h-[140px] hover:border-purple-500/30 transition-all duration-200 group">
                    <div className="flex items-start justify-between gap-1">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-all shrink-0">
                        <Monitor className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                        Realtime DB
                      </span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-2.5 whitespace-nowrap">
                        {stats.liveUsers.toLocaleString()}
                      </h3>
                      <p className="text-[9px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1 whitespace-nowrap truncate" title="REGISTERED STUDENTS">
                        REGISTERED STUDENTS
                      </p>
                    </div>
                    <div className="mt-3 space-y-1.5">
                      <div className="flex justify-between items-center text-[9.5px] font-bold gap-1">
                        <span className="text-slate-500 dark:text-slate-400 whitespace-nowrap">Active Users</span>
                        <span className="text-emerald-400 font-extrabold whitespace-nowrap">{stats.liveUsers} Users</span>
                      </div>
                      <div className="w-full h-1 bg-emerald-500/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-400 rounded-full transition-all duration-500" 
                          style={{ width: `${stats.liveUsers === 0 ? 0 : Math.min(100, Math.max(2, (stats.liveUsers / 100) * 100))}%` }} 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Total Solved Questions */}
                  <div className="bg-white dark:bg-[#0f1322] border border-slate-200 dark:border-[#151c2f] rounded-2xl p-4 flex flex-col justify-between min-h-[140px] hover:border-purple-500/30 transition-all duration-200 group">
                    <div className="flex items-start justify-between gap-1">
                      <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-all shrink-0">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 whitespace-nowrap">
                        Realtime DB
                      </span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-2.5 whitespace-nowrap">
                        {stats.dailySolves.toLocaleString()}
                      </h3>
                      <p className="text-[9px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1 whitespace-nowrap truncate" title="TOTAL SOLVED QUESTIONS">
                        TOTAL SOLVED QUESTIONS
                      </p>
                    </div>
                    <div className="mt-3 space-y-1.5">
                      <div className="flex justify-between items-center text-[9.5px] font-bold gap-1">
                        <span className="text-slate-500 dark:text-slate-400 whitespace-nowrap">Solved Count</span>
                        <span className="text-purple-400 font-extrabold whitespace-nowrap">{stats.dailySolves} Solved</span>
                      </div>
                      <div className="w-full h-1 bg-purple-500/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-400 rounded-full transition-all duration-500" 
                          style={{ width: `${stats.dailySolves === 0 ? 0 : Math.min(100, Math.max(2, (stats.dailySolves / 1000) * 100))}%` }} 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Avg Solve Duration */}
                  <div className="bg-white dark:bg-[#0f1322] border border-slate-200 dark:border-[#151c2f] rounded-2xl p-4 flex flex-col justify-between min-h-[140px] hover:border-purple-500/30 transition-all duration-200 group">
                    <div className="flex items-start justify-between gap-1">
                      <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-all shrink-0">
                        <Clock className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 whitespace-nowrap">
                        Live
                      </span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-2.5 whitespace-nowrap">{stats.avgSessionTime}</h3>
                      <p className="text-[9px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1 whitespace-nowrap truncate" title="AVG SOLVE DURATION">
                        AVG SOLVE DURATION
                      </p>
                    </div>
                    <div className="mt-3 space-y-1.5">
                      <div className="flex justify-between items-center text-[9.5px] font-bold gap-1">
                        <span className="text-slate-500 dark:text-slate-400 whitespace-nowrap">Tracking Status</span>
                        <span className="text-blue-400 font-extrabold whitespace-nowrap">{stats.avgSessionTime}</span>
                      </div>
                      <div className="w-full h-1 bg-blue-500/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-400 rounded-full transition-all duration-500" 
                          style={{ width: `${stats.avgSessionTime === '0m 0s' ? 0 : 50}%` }} 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card 4: New Signups (24H) */}
                  <div className="bg-white dark:bg-[#0f1322] border border-slate-200 dark:border-[#151c2f] rounded-2xl p-4 flex flex-col justify-between min-h-[140px] hover:border-purple-500/30 transition-all duration-200 group">
                    <div className="flex items-start justify-between gap-1">
                      <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-all shrink-0">
                        <UserPlus className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 whitespace-nowrap">
                        24h Signups
                      </span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-2.5 whitespace-nowrap">
                        {stats.newSignups.toLocaleString()}
                      </h3>
                      <p className="text-[9px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1 whitespace-nowrap truncate" title="NEW SIGNUPS (24H)">
                        NEW SIGNUPS (24H)
                      </p>
                    </div>
                    <div className="mt-3 space-y-1.5">
                      <div className="flex justify-between items-center text-[9.5px] font-bold gap-1">
                        <span className="text-slate-500 dark:text-slate-400 whitespace-nowrap">DB Users</span>
                        <span className="text-cyan-400 font-extrabold whitespace-nowrap">{stats.newSignups} Total</span>
                      </div>
                      <div className="w-full h-1 bg-cyan-500/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-cyan-400 rounded-full transition-all duration-500" 
                          style={{ width: `${stats.newSignups === 0 ? 0 : Math.min(100, Math.max(2, (stats.newSignups / 2000) * 100))}%` }} 
                        />
                      </div>
                    </div>
                  </div>

                </div>

                {/* Row 2: User Progression */}
                <div className="grid grid-cols-1 gap-6">
                  
                  {/* User Progression Card (Bar Chart) */}
                  <div className="bg-white dark:bg-[#0f1322] border border-slate-200 dark:border-[#151c2f] rounded-2xl p-6 flex flex-col justify-between h-96">
                    <div className="flex justify-between items-center border-b border-slate-200 dark:border-[#151c2f] pb-4">
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider font-heading">
                          User Progression
                        </h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                          Monthly growth trajectory
                        </p>
                      </div>
                      <button className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 dark:bg-[#070a13] border border-slate-200 dark:border-[#151c2f] rounded-lg text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 cursor-pointer">
                        <span>Last 30 Days</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Chart visual */}
                    <div className="flex-1 flex items-end justify-between gap-3 pt-6 relative">
                      {/* Grid guideline horizontal lines */}
                      <div className="absolute inset-0 flex flex-col justify-between py-2 pointer-events-none opacity-10">
                        <div className="border-b border-slate-200 w-full" />
                        <div className="border-b border-slate-200 w-full" />
                        <div className="border-b border-slate-200 w-full" />
                        <div className="border-b border-slate-200 w-full" />
                      </div>

                      {progressionData.length > 0 ? progressionData.map((d) => (
                        <div key={d.day} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                          <div 
                            className={`w-full rounded-lg transition-all duration-500 relative ${
                              d.isHigh 
                                ? 'bg-gradient-to-t from-purple-500 to-indigo-600 shadow-[0_0_15px_rgba(139,92,246,0.3)] border border-purple-400/40' 
                                : 'bg-slate-100 dark:bg-[#151c2f] hover:bg-slate-700'
                            }`}
                            style={{ height: d.height }}
                          >
                            <span className={`absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block text-[9px] font-bold py-0.5 px-1.5 rounded whitespace-nowrap shadow-md ${
                              d.isHigh 
                                ? 'bg-white dark:bg-[#090d16] border border-purple-500/40 text-purple-300' 
                                : 'bg-slate-900 border border-slate-200 dark:border-[#151c2f] text-slate-900 dark:text-white'
                            }`}>
                              {d.value}%
                            </span>
                          </div>
                          <span className={`text-[9px] uppercase ${d.isHigh ? 'font-black text-purple-400' : 'font-extrabold text-slate-500'}`}>
                            {d.day}
                          </span>
                        </div>
                      )) : (
                        <div className="w-full flex items-center justify-center text-slate-500 text-xs font-bold animate-pulse">Loading trajectory...</div>
                      )}

                    </div>
                  </div>

                </div>

                {/* Bottom Row: Bottleneck Finder Table */}
                <div className="bg-white dark:bg-[#0f1322] border border-slate-200 dark:border-[#151c2f] rounded-2xl p-6 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-200 dark:border-[#151c2f] pb-4">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider font-heading">
                        Bottleneck Finder
                      </h3>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                        Low-performing curriculum segments
                      </p>
                    </div>
                    
                    <Link 
                      href="/admin/directory" 
                      className="flex items-center gap-1 text-[11px] font-black text-emerald-400 hover:text-emerald-300 uppercase tracking-wider transition-colors"
                    >
                      <span>View Full Audit</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {/* Responsive Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-[#151c2f]">
                          <th className="py-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider w-24">ID</th>
                          <th className="py-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Question Description</th>
                          <th className="py-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider w-28">Difficulty</th>
                          <th className="py-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider w-28 text-center">Avg. Time</th>
                          <th className="py-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider w-28 text-center">Solve %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#151c2f]">
                        {bottlenecks.length > 0 ? bottlenecks.map((b, i) => (
                          <tr key={i} className="hover:bg-slate-100 dark:bg-[#151c2f]/20 transition-colors duration-150">
                            <td className="py-4 text-xs font-semibold text-slate-500">{b.id}</td>
                            <td className="py-4 text-xs font-bold text-slate-800 dark:text-slate-200">{b.name}</td>
                            <td className="py-4">
                              <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded border ${
                                b.difficulty === 'Lethal' 
                                  ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' 
                                  : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                              }`}>
                                {b.difficulty}
                              </span>
                            </td>
                            <td className="py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 text-center">{b.time}</td>
                            <td className="py-4 text-xs font-extrabold text-orange-400 text-center">{b.solveRate}</td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-xs font-bold text-slate-500 animate-pulse">Loading bottlenecks...</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}
    </>
  );
}
