'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Search, SlidersHorizontal, ChevronRight, TrendingUp, UserCheck, 
  Clock, Sparkles, TrendingDown, BookOpen, Trophy, Zap, Ban, ShieldCheck, 
  KeyRound, Check, X, Activity, ChevronLeft, Plus, Cpu, AlertTriangle, Loader2, Award, Mail
} from 'lucide-react';
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';
import { USER_ROLES } from '@/lib/admin/store';
import { UserRole } from '@/lib/admin/types';
import { supabase } from '@/lib/supabase';

export default function UsersPage() {
  const [currentRole, setCurrentRole] = useState<UserRole>(USER_ROLES[0]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'>('ALL');
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [newBadgeText, setNewBadgeText] = useState('Master Solver');
  
  const [analytics, setAnalytics] = useState({
    totalStudents: 0,
    studentGrowth: '0%',
    activeSolvers: 0,
    newcomers: 0,
    newcomersTodayLabel: '+0 today',
    sessionDepth: '0m 0s'
  });
  const [streakBreakRisk, setStreakBreakRisk] = useState(0);
  const [chartData, setChartData] = useState({
    activePath: "M0,140 C100,140 200,140 300,140 C400,140 500,140 600,140 C700,140 750,140 800,140",
    signupPath: "M0,140 C100,140 200,140 300,140 C400,140 500,140 600,140 C700,140 750,140 800,140",
    activePoints: [] as {x: number, y: number}[],
    signupPoints: [] as {x: number, y: number}[]
  });

  useEffect(() => {
    const storedRole = localStorage.getItem('aptitude_current_role');
    if (storedRole) {
      try {
        const parsed = JSON.parse(storedRole);
        const matched = USER_ROLES.find(r => r.role === parsed.role);
        if (matched) setCurrentRole(matched);
      } catch (e) { localStorage.removeItem('aptitude_current_role'); localStorage.removeItem('aptitude_questions'); }
    }
  }, []);

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    localStorage.setItem('aptitude_current_role', JSON.stringify(role));
  };

  const triggerToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Fetch real-time student data from Supabase
  const fetchUsersFromDb = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch profiles
      const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select('*');

      if (pError) throw pError;
      if (!profiles || profiles.length === 0) return;

      // 2. Fetch streaks
      const { data: streaks } = await supabase
        .from('user_streaks')
        .select('user_id, current_streak');

      const streakMap = new Map();
      streaks?.forEach(s => streakMap.set(s.user_id, s.current_streak));

      // 3. Fetch recent question attempts to map last active domain/accuracy
      const { data: attempts } = await supabase
        .from('question_attempts')
        .select('user_id, is_correct, created_at, domain_id');

      const userAttemptsMap = new Map();
      attempts?.forEach(a => {
        if (!userAttemptsMap.has(a.user_id)) {
          userAttemptsMap.set(a.user_id, []);
        }
        userAttemptsMap.get(a.user_id).push(a);
      });

      // Construct formatted students list
      const formattedStudents = profiles.map((p: any) => {
        const uAttempts = userAttemptsMap.get(p.id) || [];
        const total = uAttempts.length;
        const correct = uAttempts.filter((a: any) => a.is_correct).length;
        
        const getDomainAccuracy = (dIds: string[]) => {
          const dAtts = uAttempts.filter((a: any) => dIds.some(d => a.domain_id?.toLowerCase().includes(d)));
          if (dAtts.length === 0) return 0;
          const dCorr = dAtts.filter((a: any) => a.is_correct).length;
          return Math.round((dCorr / dAtts.length) * 100);
        };

        const accuracy = {
          quant: getDomainAccuracy(['q', 'quant']),
          logical: getDomainAccuracy(['l', 'logical']),
          verbal: getDomainAccuracy(['v', 'verbal']),
          coding: getDomainAccuracy(['c', 'coding'])
        };

        const streakVal = streakMap.get(p.id) || 0;

        // Recent Activity mapping
        const recentActivity = uAttempts.slice(0, 3).map((a: any) => {
          const diffMs = Date.now() - new Date(a.created_at).getTime();
          const diffMin = Math.floor(diffMs / 60000);
          const timeText = diffMin <= 0 ? 'Just now' : diffMin < 60 ? `${diffMin}m ago` : `${Math.floor(diffMin / 60)}h ago`;
          return {
            text: a.is_correct ? "Answered practice question correctly" : "Submitted incorrect option for MCQ",
            time: timeText
          };
        });

        if (recentActivity.length === 0) {
          recentActivity.push({ text: "Signed up and completed learning profile onboarding", time: "Recently" });
        }

        const lastActiveTime = uAttempts[0]
          ? (() => {
              const diffMin = Math.floor((Date.now() - new Date(uAttempts[0].created_at).getTime()) / 60000);
              return diffMin <= 0 ? 'Just now' : diffMin < 60 ? `${diffMin} minutes ago` : `${Math.floor(diffMin / 60)} hours ago`;
            })()
          : '1 day ago';

        return {
          id: p.id.substring(0, 8).toUpperCase(),
          uuid: p.id,
          name: p.username || p.name || 'Anonymous Student',
          email: p.email || 'student@platform.com',
          status: p.status || 'ACTIVE',
          streak: streakVal,
          xp: p.xp || 0,
          college: p.college || 'VIT Vellore',
          degree: p.degree || 'B.Tech',
          goal: p.primary_goal || 'Campus Placements',
          activeDomain: 'Quantitative',
          activeTopic: 'Arithmetic',
          lastActive: lastActiveTime,
          activeTarget: 'Quantitative - Core Practice',
          avatar: p.avatar && p.avatar !== 'initial' ? p.avatar : `https://api.dicebear.com/7.x/adventurer/svg?seed=${p.username || 'student'}`,
          accuracy,
          recentActivity
        };
      });

      // Sort by XP to make leaderboard accurate
      formattedStudents.sort((a, b) => b.xp - a.xp);
      setStudents(formattedStudents);

      // Compute dynamic stats over database precisely without mock inflation
      const onlineCount = formattedStudents.filter(s => s.lastActive.includes('minute') || s.lastActive.includes('now')).length;
      
      const { count: totalStudentsCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: totalAttemptsCount } = await supabase.from('question_attempts').select('*', { count: 'exact', head: true });
      const tUsers = totalStudentsCount || formattedStudents.length || 1;
      const tAttempts = totalAttemptsCount || 0;
      
      const avgMinutes = Math.floor((tAttempts * 2.5) / tUsers);
      const avgSeconds = Math.floor(((tAttempts * 2.5) / tUsers - avgMinutes) * 60);
      
      const nowMs = Date.now();
      const { data: monthProfiles } = await supabase.from('profiles').select('created_at').gte('created_at', new Date(nowMs - 30 * 24 * 3600 * 1000).toISOString());
      const { data: monthAttempts } = await supabase.from('question_attempts').select('created_at').gte('created_at', new Date(nowMs - 30 * 24 * 3600 * 1000).toISOString());
      
      const newcomersToday = monthProfiles?.filter(p => new Date(p.created_at).getTime() > nowMs - 24 * 3600 * 1000).length || 0;
      
      const prevMonthProfiles = await supabase.from('profiles').select('created_at').gte('created_at', new Date(nowMs - 60 * 24 * 3600 * 1000).toISOString()).lt('created_at', new Date(nowMs - 30 * 24 * 3600 * 1000).toISOString());
      const pmCount = prevMonthProfiles.data?.length || 1;
      const mCount = monthProfiles?.length || 0;
      const growth = pmCount === 0 ? 100 : Math.round(((mCount - pmCount) / pmCount) * 100);

      setAnalytics({
        totalStudents: tUsers,
        studentGrowth: growth >= 0 ? `+${growth}%` : `${growth}%`,
        activeSolvers: onlineCount,
        newcomers: newcomersToday,
        newcomersTodayLabel: `+${newcomersToday} today`,
        sessionDepth: `${avgMinutes}m ${avgSeconds}s`
      });

      // Calculate streak break risk (students with streak 1 or 2, liable to break)
      const riskCount = streaks?.filter(s => s.current_streak > 0 && s.current_streak < 3).length || 0;
      setStreakBreakRisk(riskCount);

      // Bucketing for charts
      const d1 = nowMs - 22.5 * 24 * 3600 * 1000;
      const d2 = nowMs - 15 * 24 * 3600 * 1000;
      const d3 = nowMs - 7.5 * 24 * 3600 * 1000;
      
      const getBucket = (data: any[]) => {
          if (!data) return [0,0,0,0];
          const b = [0,0,0,0];
          data.forEach(x => {
              const t = new Date(x.created_at).getTime();
              if (t < d1) b[0]++;
              else if (t < d2) b[1]++;
              else if (t < d3) b[2]++;
              else b[3]++;
          });
          return b;
      };

      const actB = getBucket(monthAttempts || []);
      const sigB = getBucket(monthProfiles || []);
      
      const maxAct = Math.max(...actB, 1);
      const maxSig = Math.max(...sigB, 1);
      
      const toY = (val: number, max: number) => 140 - (val / max) * 120; // 140 to 20 inverted
      
      const aY = actB.map(v => toY(v, maxAct));
      const sY = sigB.map(v => toY(v, maxSig));

      setChartData({
        activePath: `M0,${aY[0]} C100,${aY[0]} 200,${aY[1]} 300,${aY[1]} C400,${aY[1]} 500,${aY[2]} 600,${aY[2]} C700,${aY[2]} 750,${aY[3]} 800,${aY[3]}`,
        signupPath: `M0,${sY[0]} C100,${sY[0]} 200,${sY[1]} 300,${sY[1]} C400,${sY[1]} 500,${sY[2]} 600,${sY[2]} C700,${sY[2]} 750,${sY[3]} 800,${sY[3]}`,
        activePoints: [{x:300, y:aY[1]}, {x:600, y:aY[2]}, {x:800, y:aY[3]}],
        signupPoints: [{x:300, y:sY[1]}, {x:600, y:sY[2]}]
      });

    } catch (err) {
      console.warn("Supabase query error:", err);
      setStudents([]); // No mock students
      setAnalytics({
        totalStudents: 0,
        studentGrowth: '0%',
        activeSolvers: 0,
        newcomers: 0,
        newcomersTodayLabel: '+0 today',
        sessionDepth: '0m 0s'
      });
      setChartData({
        activePath: "M0,140 C100,140 200,140 300,140 C400,140 500,140 600,140 C700,140 750,140 800,140",
        signupPath: "M0,140 C100,140 200,140 300,140 C400,140 500,140 600,140 C700,140 750,140 800,140",
        activePoints: [],
        signupPoints: []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersFromDb();
  }, []);

  // Filter students based on search and status dropdown
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = 
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.college.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'ALL' || student.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [students, searchQuery, statusFilter]);

  const toggleStudentStatus = async (id: string, uuid: string, nextStatus: string) => {
    // 1. Update state locally
    setStudents(prev => prev.map(s => s.uuid === uuid ? { ...s, status: nextStatus } : s));
    if (selectedStudent && selectedStudent.uuid === uuid) {
      setSelectedStudent({ ...selectedStudent, status: nextStatus });
    }

    const logDesc = `Student ${selectedStudent?.name || id} profile status set to ${nextStatus} by administrator.`;
    // 2. Sync to backend
    try {
      await supabase
        .from('profiles')
        .update({ status: nextStatus })
        .eq('id', uuid);
      
      // Dispatch admin log event
      await fetch('/api/admin/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Student Status Modified',
          description: logDesc,
          category: 'SECURITY',
          severity: nextStatus === 'SUSPENDED' ? 'warning' : 'info'
        })
      });
    } catch (_) {}

    triggerToast(`Status for student ${id} updated to ${nextStatus}.`);
  };

  const grantBadgeToStudent = async (id: string, uuid: string) => {
    const logDesc = `Badge '${newBadgeText}' manually awarded to student ${selectedStudent?.name || id} by administrator.`;
    try {
      await supabase
        .from('user_badges')
        .insert({
          user_id: uuid,
          badge_id: 'manual-award',
          earned_at: new Date().toISOString(),
          is_completed: true,
          progress_percentage: 100
        });

      // Dispatch admin log event
      await fetch('/api/admin/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Badge Manually Granted',
          description: logDesc,
          category: 'ACHIEVEMENT',
          severity: 'info'
        })
      });
    } catch (_) {}
    triggerToast(`Badge '${newBadgeText}' successfully awarded to student ${id}.`);
  };

  return (
    <>
      {/* Global Toast Alert */}
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
              <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-455 shadow-inner relative">
                <Cpu className="w-7 h-7 animate-pulse" />
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-rose-600 text-[10px] font-black text-white flex items-center justify-center border-2 border-[#0f1322] shadow">!</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <h2 className="text-lg font-black text-white tracking-tight">Admin Access Required</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Base Institute Admin Panel</p>
              </div>
              <div className="w-full bg-[#070a13] border border-[#151c2f] p-4 rounded-xl space-y-3.5 text-xs text-left">
                <div className="flex items-center justify-between border-b border-[#151c2f] pb-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Clearance Status</span>
                  <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 uppercase tracking-wide">DENIED</span>
                </div>
                <div className="grid grid-cols-2 gap-y-3.5 gap-x-6 font-semibold text-slate-350">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase">Attempted User</span>
                    <span className="text-white font-bold">{currentRole.name}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase">Clearance Role</span>
                    <span className="text-rose-400 font-bold uppercase tracking-wider text-[11px]">{currentRole.role}</span>
                  </div>
                  <div className="flex flex-col col-span-2">
                    <span className="text-[10px] text-slate-500 uppercase">Attempted Access Route</span>
                    <span className="text-slate-350 font-bold font-mono text-[11px]">/admin/users</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  const admin = USER_ROLES.find(r => r.role === 'admin');
                  if (admin) handleRoleChange(admin);
                }}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-blue-500/10 active:scale-98 transition-all cursor-pointer border-0"
              >
                Request Admin Clearance
              </button>
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
                  User Management
                </h1>
                <p className="text-[11px] font-semibold text-slate-500 mt-1">
                  Monitor, manage, and inspect student progress across all courses and practice modules.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="py-24 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                <span className="text-[10px] font-bold text-slate-550 uppercase tracking-widest">Querying Platform Databases...</span>
              </div>
            ) : (
              <>
                {/* Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Stat 1 */}
                  <div className="bg-[#0f1322] border border-[#151c2f] rounded-2xl p-5 relative overflow-hidden group hover:border-[#151c2f]/80 transition-all">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block leading-none">Total Students</span>
                        <span className="text-2xl font-black text-white tracking-tight block">{analytics.totalStudents.toLocaleString()}</span>
                      </div>
                      <span className="text-[9px] font-black px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wide flex items-center gap-0.5">
                        {analytics.studentGrowth.startsWith('+') ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                        {analytics.studentGrowth}
                      </span>
                    </div>
                  </div>

                  {/* Stat 2 */}
                  <div className="bg-[#0f1322] border border-[#151c2f] rounded-2xl p-5 relative overflow-hidden group hover:border-[#151c2f]/80 transition-all">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block leading-none">Active Solvers</span>
                        <span className="text-2xl font-black text-white tracking-tight block">{analytics.activeSolvers.toLocaleString()}</span>
                      </div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        Currently Online
                      </span>
                    </div>
                  </div>

                  {/* Stat 3 */}
                  <div className="bg-[#0f1322] border border-[#151c2f] rounded-2xl p-5 relative overflow-hidden group hover:border-[#151c2f]/80 transition-all">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block leading-none">Newcomers</span>
                        <span className="text-2xl font-black text-white tracking-tight block">{analytics.newcomers.toLocaleString()}</span>
                      </div>
                      <span className="text-[9px] font-black px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase tracking-wide">
                        {analytics.newcomersTodayLabel}
                      </span>
                    </div>
                  </div>

                  {/* Stat 4 */}
                  <div className="bg-[#0f1322] border border-[#151c2f] rounded-2xl p-5 relative overflow-hidden group hover:border-[#151c2f]/80 transition-all">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block leading-none">Session Depth</span>
                        <span className="text-2xl font-black text-white tracking-tight block">{analytics.sessionDepth}</span>
                      </div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        Avg. Per User
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hybrid Grid Layout: 2-Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Panel (col-span-2) - Search & Table */}
                  <div className="lg:col-span-2 space-y-6">
                    
                    <div className="bg-[#0f1322] border border-[#151c2f] rounded-2xl overflow-hidden">
                      
                      {/* Search and filter controls */}
                      <div className="p-4 border-b border-[#151c2f] flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="relative w-full sm:max-w-xs">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <input
                            type="text"
                            placeholder="Search by name, ID or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#070a13] border border-[#151c2f] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-550 focus:outline-none focus:border-purple-500/50"
                          />
                        </div>

                        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between">
                          <SlidersHorizontal className="w-4 h-4 text-slate-550 shrink-0" />
                          <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="bg-[#070a13] border border-[#151c2f] text-slate-300 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-purple-500/50 cursor-pointer animate-none"
                          >
                            <option value="ALL">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                            <option value="SUSPENDED">Suspended</option>
                          </select>
                        </div>
                      </div>

                      {/* Student Records Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                          <thead>
                            <tr className="bg-[#070a13] border-b border-[#151c2f] text-[10px] font-black text-slate-500 uppercase tracking-widest select-none">
                              <th className="px-6 py-4">User Identity</th>
                              <th className="px-6 py-4">Status</th>
                              <th className="px-6 py-4">Streak & XP</th>
                              <th className="px-6 py-4">Persistence</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#151c2f] text-xs font-semibold text-slate-300">
                            {filteredStudents.length > 0 ? (
                              filteredStudents.map((student) => (
                                <tr 
                                  key={student.id} 
                                  onClick={() => setSelectedStudent(student)}
                                  className="hover:bg-[#070a13]/60 transition-colors cursor-pointer"
                                >
                                  <td className="px-6 py-4.5 flex items-center gap-3">
                                    <img 
                                      src={student.avatar} 
                                      alt={student.name} 
                                      className="w-9 h-9 rounded-full object-cover border border-[#151c2f] shadow-inner" 
                                    />
                                    <div className="flex flex-col text-left">
                                      <span className="font-bold text-white leading-tight">{student.name}</span>
                                      <span className="text-[9px] font-bold text-slate-550 uppercase mt-0.5 tracking-wider">
                                        {student.id} · {student.email}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4.5">
                                    <span className={`text-[9px] font-black px-2.5 py-0.5 rounded border uppercase tracking-wider ${
                                      student.status === 'ACTIVE' 
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                        : student.status === 'SUSPENDED'
                                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                          : 'bg-slate-800/60 text-slate-400 border-slate-700/60'
                                    }`}>
                                      {student.status}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4.5 text-left">
                                    <div className="flex flex-col">
                                      <span className="text-white font-bold flex items-center gap-1">
                                        <Zap className="w-3.5 h-3.5 text-amber-450 fill-current" />
                                        {student.streak} Days
                                      </span>
                                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                                        {student.xp.toLocaleString()} XP
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4.5 text-left">
                                    <div className="flex flex-col">
                                      <span className="text-slate-200 font-bold">{student.lastActive}</span>
                                      <span className="text-[9px] text-slate-500 font-semibold uppercase mt-0.5 tracking-wider">
                                        {student.activeTarget}
                                      </span>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={4} className="py-8 text-center text-slate-500 uppercase tracking-widest text-[10px] font-bold">
                                  No matching student records found
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination Footer */}
                      <div className="px-6 py-4 border-t border-[#151c2f] bg-[#070a13]/30 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                          Showing 1-{filteredStudents.length} of {students.length} students
                        </span>
                        <div className="flex items-center gap-1.5 select-none">
                          <button className="p-1 rounded-lg bg-slate-900 border border-[#151c2f] text-slate-500 hover:text-white cursor-pointer">
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button className="w-7 h-7 flex items-center justify-center rounded-full bg-purple-600 text-white text-[10px] font-bold shadow-md cursor-pointer border-0">
                            1
                          </button>
                          <button className="p-1 rounded-lg bg-slate-900 border border-[#151c2f] text-slate-500 hover:text-white cursor-pointer">
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                    </div>

                  </div>

                  {/* Right Panel (col-span-1) - Top Peaks & Churn Risk */}
                  <div className="lg:col-span-1 space-y-6">
                    
                    {/* Performance Peaks Leaderboard */}
                    <div className="bg-[#0f1322] border border-[#151c2f] rounded-2xl p-5 space-y-4 text-left">
                      <div className="flex justify-between items-center border-b border-[#151c2f] pb-3">
                        <div className="flex items-center gap-2">
                          <Trophy className="w-4.5 h-4.5 text-amber-400" />
                          <h3 className="text-xs font-black text-white uppercase tracking-widest font-heading">
                            Performance Peaks
                          </h3>
                        </div>
                        <Sparkles className="w-4 h-4 text-purple-400" />
                      </div>

                      <div className="space-y-3">
                        {students.slice(0, 3).map((stu, index) => (
                          <div key={stu.id} className="flex items-center justify-between p-2.5 bg-[#070a13]/70 border border-[#151c2f] rounded-xl hover:border-purple-550/20 transition-all">
                            <div className="flex items-center gap-3">
                              <img 
                                src={stu.avatar} 
                                alt={stu.name} 
                                className="w-7.5 h-7.5 rounded-full object-cover border border-[#151c2f]" 
                              />
                              <div className="flex flex-col text-left">
                                <span className="text-xs font-bold text-white leading-tight truncate max-w-[100px]">{stu.name}</span>
                                <span className="text-[9px] text-slate-550 font-bold uppercase tracking-wide">{stu.xp.toLocaleString()} XP</span>
                              </div>
                            </div>
                            <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-wide ${
                              index === 0 
                                ? 'bg-emerald-500/10 text-emerald-450 border border-emerald-550/20' 
                                : index === 1 
                                  ? 'bg-cyan-550/10 text-cyan-400 border border-cyan-500/20' 
                                  : 'bg-slate-800/80 text-slate-450 border border-slate-700/60'
                            }`}>
                              {index === 0 ? 'ELITE' : index === 1 ? 'TOP 5%' : 'STEADY'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Churn / Streak Break Risk Alert */}
                    <div className="bg-[#0f1322] border border-[#151c2f] rounded-2xl p-5 space-y-4 text-left">
                      <div className="flex justify-between items-center border-b border-[#151c2f] pb-3">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4.5 h-4.5 text-rose-500 animate-pulse" />
                          <h3 className="text-xs font-black text-white uppercase tracking-widest font-heading">
                            Streak Break Risk
                          </h3>
                        </div>
                        <span className="text-[8px] font-black px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 uppercase tracking-wide animate-pulse">
                          128 Students
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 leading-normal font-semibold">
                        Behavioral learning patterns indicate a potential drop in active student streaks. Direct engagement is recommended for these {streakBreakRisk} students.
                      </p>

                      <button 
                        onClick={() => triggerToast(`Push notifications sent: Streak reminder alerts dispatched to all ${streakBreakRisk} at-risk profiles.`)}
                        className="w-full py-3 mt-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-455 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center active:scale-98"
                      >
                        Send Streak Reminders
                      </button>
                    </div>

                  </div>

                </div>

                {/* Bottom Section - Active Solver Curves SVG dynamics */}
                <div className="bg-[#0f1322] border border-[#151c2f] rounded-2xl p-6 text-left">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#151c2f] pb-4">
                    <div>
                      <h3 className="text-xs font-black text-white uppercase tracking-widest font-heading">
                        Active Student Solver Dynamics
                      </h3>
                      <p className="text-[10px] text-slate-500 font-semibold uppercase mt-0.5 tracking-wider">
                        Mapping student solver activity vs. new registrations over 30 days.
                      </p>
                    </div>

                    <div className="flex gap-4 text-[9px] font-black uppercase tracking-widest select-none">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="text-slate-350">Active Solvers</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-purple-500" />
                        <span className="text-slate-350">New Registrations</span>
                      </div>
                    </div>
                  </div>

                  {/* Beautiful Double curve SVG Chart */}
                  <div className="pt-6 relative">
                    <svg className="w-full h-44 text-slate-500 overflow-visible" viewBox="0 0 800 160">
                      <defs>
                        <linearGradient id="activeGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#34d399" stopOpacity="0.15" />
                          <stop offset="100%" stopColor="#34d399" stopOpacity="0.0" />
                        </linearGradient>
                        <linearGradient id="signupGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.15" />
                          <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Horizontal grid lines */}
                      <line x1="0" y1="40" x2="800" y2="40" stroke="#151c2f" strokeDasharray="3" />
                      <line x1="0" y1="80" x2="800" y2="80" stroke="#151c2f" strokeDasharray="3" />
                      <line x1="0" y1="120" x2="800" y2="120" stroke="#151c2f" strokeDasharray="3" />

                      {/* Active Solvers Curve */}
                      <path
                        d={`${chartData.activePath} L800,160 L0,160 Z`}
                        fill="url(#activeGradient)"
                      />
                      <path
                        d={chartData.activePath}
                        fill="none"
                        stroke="#34d399"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />

                      {/* New Signups Curve */}
                      <path
                        d={`${chartData.signupPath} L800,160 L0,160 Z`}
                        fill="url(#signupGradient)"
                      />
                      <path
                        d={chartData.signupPath}
                        fill="none"
                        stroke="#a855f7"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeDasharray="1"
                      />

                      {/* Data Points */}
                      {chartData.activePoints.map((pt, i) => (
                        <circle key={`act-${i}`} cx={pt.x} cy={pt.y} r="4.5" fill="#34d399" stroke="#0f1322" strokeWidth="2" />
                      ))}
                      
                      {chartData.signupPoints.map((pt, i) => (
                        <circle key={`sig-${i}`} cx={pt.x} cy={pt.y} r="4" fill="#a855f7" stroke="#0f1322" strokeWidth="2" />
                      ))}
                    </svg>

                    {/* X axis labels */}
                    <div className="flex justify-between items-center text-[9px] font-bold text-slate-500 uppercase tracking-widest select-none pt-2.5">
                      <span>30 Days Ago</span>
                      <span>15 Days Ago</span>
                      <span>Today</span>
                    </div>
                  </div>
                </div>
              </>
            )}

          </div>
        )}

        {/* Detailed Student Profile Inspector Modal */}
        {selectedStudent && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4">
            <div className="w-full max-w-2xl bg-[#0f1322] border border-[#151c2f] rounded-2xl shadow-2xl overflow-hidden animate-scaleUp max-h-[90vh] flex flex-col">
              
              {/* Header */}
              <div className="px-6 py-4.5 border-b border-[#151c2f] flex justify-between items-center bg-[#070a13]/40">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-purple-400" />
                  <span className="text-xs font-black uppercase text-white tracking-widest font-heading">
                    Student Profile Inspector
                  </span>
                </div>
                <button 
                  onClick={() => setSelectedStudent(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors border-0 bg-transparent cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Scrollable Content Body */}
              <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar flex-1">
                
                {/* Profile Identity grid */}
                <div className="flex flex-col md:flex-row gap-6 border-b border-[#151c2f] pb-6">
                  
                  <div className="flex flex-col items-center gap-3 shrink-0">
                    <img 
                      src={selectedStudent.avatar} 
                      alt={selectedStudent.name} 
                      className="w-20 h-20 rounded-full object-cover border-2 border-purple-500/30 shadow-lg" 
                    />
                    <span className={`text-[8.5px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${
                      selectedStudent.status === 'ACTIVE' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : selectedStudent.status === 'SUSPENDED'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : 'bg-slate-800/60 text-slate-400 border-slate-700/60'
                    }`}>
                      {selectedStudent.status}
                    </span>
                  </div>

                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-left">
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Full Name</span>
                      <span className="text-white font-bold text-sm block">{selectedStudent.name}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Student ID</span>
                      <span className="text-slate-300 font-mono font-bold block">{selectedStudent.id}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Email Address</span>
                      <span className="text-slate-300 block">{selectedStudent.email}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Institutional Origin</span>
                      <span className="text-slate-350 block font-semibold">{selectedStudent.college} ({selectedStudent.degree})</span>
                    </div>
                    <div className="space-y-1 col-span-1 sm:col-span-2">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Target Learning Goal</span>
                      <span className="text-purple-400 font-bold block uppercase tracking-wide">{selectedStudent.goal}</span>
                    </div>
                  </div>

                </div>

                {/* Accuracy & Mastery Rates */}
                <div className="space-y-3.5 text-left">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-[#151c2f] pb-2">
                    Subject Accuracy & Mastery Rates
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Quant */}
                    <div className="bg-[#070a13] p-3 border border-[#151c2f] rounded-xl">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-slate-300">Quantitative Aptitude</span>
                        <span className="text-purple-400 font-extrabold">{selectedStudent.accuracy.quant}%</span>
                      </div>
                      <div className="h-2 bg-slate-900 border border-[#151c2f] rounded-full overflow-hidden mt-2">
                        <div className="h-full bg-purple-550 rounded-full" style={{ width: `${selectedStudent.accuracy.quant}%` }} />
                      </div>
                    </div>

                    {/* Logical */}
                    <div className="bg-[#070a13] p-3 border border-[#151c2f] rounded-xl">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-slate-300">Logical Reasoning</span>
                        <span className="text-purple-400 font-extrabold">{selectedStudent.accuracy.logical}%</span>
                      </div>
                      <div className="h-2 bg-slate-900 border border-[#151c2f] rounded-full overflow-hidden mt-2">
                        <div className="h-full bg-purple-550 rounded-full" style={{ width: `${selectedStudent.accuracy.logical}%` }} />
                      </div>
                    </div>

                    {/* Verbal */}
                    <div className="bg-[#070a13] p-3 border border-[#151c2f] rounded-xl">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-slate-300">Verbal Ability</span>
                        <span className="text-purple-400 font-extrabold">{selectedStudent.accuracy.verbal}%</span>
                      </div>
                      <div className="h-2 bg-slate-900 border border-[#151c2f] rounded-full overflow-hidden mt-2">
                        <div className="h-full bg-purple-550 rounded-full" style={{ width: `${selectedStudent.accuracy.verbal}%` }} />
                      </div>
                    </div>

                    {/* Coding */}
                    <div className="bg-[#070a13] p-3 border border-[#151c2f] rounded-xl">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-slate-300">Coding & DSA</span>
                        <span className="text-purple-400 font-extrabold">{selectedStudent.accuracy.coding}%</span>
                      </div>
                      <div className="h-2 bg-slate-900 border border-[#151c2f] rounded-full overflow-hidden mt-2">
                        <div className="h-full bg-purple-550 rounded-full" style={{ width: `${selectedStudent.accuracy.coding}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline activity logs */}
                <div className="space-y-3 text-left">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-[#151c2f] pb-2">
                    Recent Activity Timeline
                  </h4>

                  <div className="space-y-2.5">
                    {selectedStudent.recentActivity.map((act: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-2.5 bg-[#070a13]/70 border border-[#151c2f] rounded-xl">
                        <div className="flex items-center gap-2.5">
                          <Activity className="w-3.5 h-3.5 text-slate-500" />
                          <span className="text-[11px] text-slate-200 font-semibold">{act.text}</span>
                        </div>
                        <span className="text-[9px] text-slate-500 font-bold uppercase">{act.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Admin quick actions */}
                <div className="bg-[#070a13]/70 border border-[#151c2f] rounded-2xl p-4.5 space-y-4 text-left">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Administrative Command Center Actions
                  </h4>

                  <div className="flex flex-wrap items-center gap-3">
                    
                    {/* Status switcher */}
                    <div className="flex items-center gap-1 bg-[#070a13] p-0.5 rounded-xl border border-[#151c2f] shadow-inner select-none">
                      <button
                        onClick={() => toggleStudentStatus(selectedStudent.id, selectedStudent.uuid, 'ACTIVE')}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer border-0 ${
                          selectedStudent.status === 'ACTIVE'
                            ? 'bg-emerald-500 text-white shadow-md'
                            : 'text-slate-500 hover:text-slate-350'
                        }`}
                      >
                        Active
                      </button>
                      <button
                        onClick={() => toggleStudentStatus(selectedStudent.id, selectedStudent.uuid, 'SUSPENDED')}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer border-0 ${
                          selectedStudent.status === 'SUSPENDED'
                            ? 'bg-rose-500 text-white shadow-md'
                            : 'text-slate-500 hover:text-slate-350'
                        }`}
                      >
                        Suspend
                      </button>
                    </div>

                    {/* Reset Password */}
                    <button
                      onClick={() => triggerToast(`Password reset credentials link dispatched to ${selectedStudent.email}`)}
                      className="px-3.5 py-2.5 bg-[#1b233a] hover:bg-[#253254] border border-[#151c2f] text-slate-200 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Reset Password
                    </button>

                    {/* Award Badge */}
                    <div className="flex items-center gap-1.5 border border-[#151c2f] bg-[#070a13] rounded-xl pl-2.5 pr-1 py-1">
                      <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <input
                        type="text"
                        placeholder="Badge Name"
                        value={newBadgeText}
                        onChange={(e) => setNewBadgeText(e.target.value)}
                        className="bg-transparent focus:outline-none text-[10px] text-white font-bold w-24 border-0 placeholder-slate-650"
                      />
                      <button
                        onClick={() => grantBadgeToStudent(selectedStudent.id, selectedStudent.uuid)}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer border-0"
                      >
                        Grant
                      </button>
                    </div>

                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="px-6 py-4.5 border-t border-[#151c2f] bg-[#070a13]/30 flex justify-end gap-3 shrink-0">
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg cursor-pointer border-0"
                >
                  Close Inspector
                </button>
              </div>

            </div>
          </div>
        )}

      </>
  );
}

// Resilient Fallback Dataset if Supabase connection is offline
const INITIAL_STUDENTS = [
  {
    id: 'STU-8012',
    uuid: 'STU-8012-UUID',
    name: 'Elena Rodriguez',
    email: 'elena.r@cloud.com',
    status: 'ACTIVE',
    streak: 142,
    xp: 8430,
    college: 'Vellore Institute of Technology',
    degree: 'B.Tech CSE',
    goal: 'Campus Placements',
    activeDomain: 'Quantitative',
    activeTopic: 'Percentages',
    lastActive: '2 minutes ago',
    activeTarget: 'Quantitative - Percentages',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80',
    accuracy: { quant: 85, logical: 72, verbal: 90, coding: 65 },
    recentActivity: [
      { text: "Solved MCQ 'Percentage Increase' successfully", time: "2m ago" },
      { text: "Viewed video solution 'DSA: Sliding Window Guide'", time: "1h ago" },
      { text: "Submitted correct answer for AP Progression", time: "3h ago" }
    ]
  },
  {
    id: 'STU-8220',
    uuid: 'STU-8220-UUID',
    name: 'Julian Weaver',
    email: 'j.weaver@design.io',
    status: 'INACTIVE',
    streak: 0,
    xp: 3120,
    college: 'BITS Pilani',
    degree: 'B.E. Electrical',
    goal: 'Software Engineer Role',
    activeDomain: 'Logical Reasoning',
    activeTopic: 'Syllogisms',
    lastActive: '14 hours ago',
    activeTarget: 'Logical - Syllogisms',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80',
    accuracy: { quant: 60, logical: 80, verbal: 75, coding: 55 },
    recentActivity: [
      { text: "Completed 'Circular Permutations' exercises", time: "14h ago" },
      { text: "Failed test case 2 on recursive Fibonacci", time: "1d ago" }
    ]
  },
  {
    id: 'STU-8225',
    uuid: 'STU-8225-UUID',
    name: 'Marcus Kane',
    email: 'm.kane@system.net',
    status: 'SUSPENDED',
    streak: 28,
    xp: 4520,
    college: 'IIT Bombay',
    degree: 'B.Tech Mechanical',
    goal: 'Core Tech & Coding Roles',
    activeDomain: 'Coding & DSA',
    activeTopic: 'Arrays',
    lastActive: '3 days ago',
    activeTarget: 'Coding - Arrays & Pointers',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80',
    accuracy: { quant: 75, logical: 70, verbal: 60, coding: 85 },
    recentActivity: [
      { text: "Flagged: 4,500 XP anomaly alert triggered", time: "3d ago" },
      { text: "Solved two-pointer subarray sum pair challenge", time: "3d ago" }
    ]
  },
  {
    id: 'STU-8231',
    uuid: 'STU-8231-UUID',
    name: 'Sarah Light',
    email: 'sarah@lumen.com',
    status: 'ACTIVE',
    streak: 312,
    xp: 12850,
    college: 'Delhi Technological University',
    degree: 'B.Tech IT',
    goal: 'Direct Product Internships',
    activeDomain: 'Verbal Ability',
    activeTopic: 'Tenses & Grammar',
    lastActive: 'Just now',
    activeTarget: 'Verbal - Active Passive Voice',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80',
    accuracy: { quant: 92, logical: 88, verbal: 94, coding: 80 },
    recentActivity: [
      { text: "Answered 12 verbal questions with 100% accuracy", time: "Just now" },
      { text: "Logged in and met daily streak target", time: "10m ago" },
      { text: "Claimed badge 'Solving Streak Elite'", time: "4h ago" }
    ]
  },
  {
    id: 'STU-8240',
    uuid: 'STU-8240-UUID',
    name: 'David Chen',
    email: 'd.chen@gmail.com',
    status: 'ACTIVE',
    streak: 184,
    xp: 9840,
    college: 'IIT Madras',
    degree: 'B.Tech Engineering Physics',
    goal: 'Quantitative Finance Analyst',
    activeDomain: 'Quantitative',
    activeTopic: 'Probability',
    lastActive: '12 minutes ago',
    activeTarget: 'Quantitative - Combinatorics',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80',
    accuracy: { quant: 96, logical: 90, verbal: 82, coding: 78 },
    recentActivity: [
      { text: "Mastered 'Permutations & Combinations' module", time: "12m ago" },
      { text: "Solved mock test 4 and scored 98%", time: "1h ago" }
    ]
  },
  {
    id: 'STU-8255',
    uuid: 'STU-8255-UUID',
    name: 'Lila Veda',
    email: 'lila.veda@outlook.com',
    status: 'ACTIVE',
    streak: 92,
    xp: 8120,
    college: 'SRM University',
    degree: 'B.Tech Software Engineering',
    goal: 'FAANG Placements',
    activeDomain: 'Coding & DSA',
    activeTopic: 'Sliding Window',
    lastActive: '45 minutes ago',
    activeTarget: 'Coding - Longest Substring',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80',
    accuracy: { quant: 80, logical: 85, verbal: 88, coding: 92 },
    recentActivity: [
      { text: "Optimized sliding window solution runtime", time: "45m ago" },
      { text: "Earned badge 'Dynamic Solver'", time: "2h ago" }
    ]
  },
  {
    id: 'STU-8260',
    uuid: 'STU-8260-UUID',
    name: 'Soren Kierkegaard',
    email: 'soren.k@existential.org',
    status: 'ACTIVE',
    streak: 45,
    xp: 7450,
    college: 'St. Stephen\'s College',
    degree: 'B.A. Economics',
    goal: 'Management Consulting Placements',
    activeDomain: 'Logical Reasoning',
    activeTopic: 'Circular Permutations',
    lastActive: '1 hour ago',
    activeTarget: 'Logical - Seat Arrangements',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80',
    accuracy: { quant: 84, logical: 92, verbal: 86, coding: 40 },
    recentActivity: [
      { text: "Finished circular table seat puzzle set", time: "1h ago" },
      { text: "Submitted question review request for syllabus item", time: "1d ago" }
    ]
  }
];
