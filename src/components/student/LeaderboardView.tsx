'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Target, Activity, Flame, Award, ChevronRight, Zap, Orbit, BarChart } from 'lucide-react';

// Mock Data
const PODIUM_DATA = [
  { rank: 2, name: 'Marcus Chen', xp: 24850, accuracy: 94, streak: 18, avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Marcus' },
  { rank: 1, name: 'Elena Rodriguez', xp: 28120, accuracy: 98, streak: 42, avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Elena' },
  { rank: 3, name: 'Julian Thorne', xp: 21400, accuracy: 91, streak: 12, avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Julian' }
];

const LIST_DATA = [
  { rank: 4, name: 'Sarah Jenkins', xp: 19820, accuracy: 89, streak: 9, avatar: 'SJ', isMe: false },
  { rank: 5, name: 'David Miller', xp: 18150, accuracy: 87, streak: 14, avatar: 'DM', isMe: false },
  { rank: 6, name: 'Priya Patel', xp: 17500, accuracy: 85, streak: 11, avatar: 'PP', isMe: false },
  { rank: 1284, name: 'Alex Sterling', xp: 4920, accuracy: 82, streak: 5, avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Alex', isMe: true },
];

const FRIENDS_ACTIVITY = [
  { initials: 'ST', name: 'S. Taylor', action: 'climbed 5 spots', time: '2m' },
  { initials: 'JW', name: 'J. Wu', action: 'earned 500 XP', time: '1h' }
];

export const LeaderboardView = () => {
  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly' | 'global'>('weekly');

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="w-full flex flex-col xl:flex-row gap-8 text-left max-w-7xl mx-auto py-8 font-sans bg-white dark:bg-[#020617] rounded-3xl p-8 relative overflow-hidden border border-slate-200 dark:border-slate-800/50 shadow-sm dark:shadow-none">
      
      {/* Background Matrix/Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        
        {/* Header section with Live Pulse */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex gap-4 p-1.5 bg-slate-100 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner inline-flex">
            {['weekly', 'monthly', 'global'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative cursor-pointer ${
                  activeTab === tab 
                    ? 'text-indigo-600 dark:text-white bg-indigo-500/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]' 
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div layoutId="tabOutline" className="absolute inset-0 border border-indigo-500/50 rounded-xl pointer-events-none" />
                )}
              </button>
            ))}
          </div>


        </div>

        {/* Floating Holographic Podium */}
        <div className="flex items-end justify-center gap-4 lg:gap-10 mt-4 pb-16 px-2 relative">
          
          {/* Rank 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center relative group w-[160px]"
          >
            <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-slate-800 text-white text-[9px] font-black uppercase px-3 py-1 rounded-full border border-slate-700">
              {PODIUM_DATA[0].accuracy}% Accuracy
            </div>
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-900 border-2 border-slate-300 m-2 shadow-[0_0_15px_rgba(148,163,184,0.2)]">
                <img src={PODIUM_DATA[0].avatar} alt={PODIUM_DATA[0].name} className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-500 text-slate-700 dark:text-white text-[10px] font-black px-3 py-0.5 rounded-full shadow-[0_0_10px_rgba(148,163,184,0.3)]">
                #2
              </div>
            </div>
            <h3 className="text-sm font-black text-slate-800 dark:text-white text-center tracking-tight">{PODIUM_DATA[0].name}</h3>
            <p className="text-slate-600 dark:text-slate-300 font-black text-[11px] font-mono mt-1 drop-shadow-[0_0_5px_rgba(148,163,184,0.5)]">{PODIUM_DATA[0].xp.toLocaleString()} XP</p>
          </motion.div>

          {/* Rank 1 */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center relative z-20 group w-[200px]"
          >
            <div className="relative mb-8">
              <div className="w-28 h-28 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-900 border-2 border-[#f59e0b] m-2 shadow-[0_0_30px_rgba(217,119,6,0.35)]">
                <img src={PODIUM_DATA[1].avatar} alt={PODIUM_DATA[1].name} className="w-full h-full object-cover" />
              </div>
              
              {/* Hardcoded hex colors prevent CSS accent variables from overriding the gold rank badge to blue */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-[#d97706] border border-[#fcd34d] text-white text-xs font-black px-4 py-1 rounded-full shadow-[0_4px_15px_rgba(217,119,6,0.4)] flex items-center gap-1 select-none">
                <Trophy className="w-3 h-3 text-[#fef3c7]" /> #1
              </div>
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white text-center tracking-tight uppercase drop-shadow-[0_0_8px_rgba(217,119,6,0.15)]">{PODIUM_DATA[1].name}</h3>
            <p className="text-[#f59e0b] font-black text-sm font-mono mt-1 tracking-widest drop-shadow-[0_0_8px_rgba(217,119,6,0.3)]">{PODIUM_DATA[1].xp.toLocaleString()} XP</p>
          </motion.div>

          {/* Rank 3 */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center relative group w-[160px]"
          >
            <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-slate-800 text-white text-[9px] font-black uppercase px-3 py-1 rounded-full border border-slate-700">
              {PODIUM_DATA[2].accuracy}% Accuracy
            </div>
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-900 border-2 border-orange-600 m-2 shadow-[0_0_15px_rgba(234,88,12,0.2)]">
                <img src={PODIUM_DATA[2].avatar} alt={PODIUM_DATA[2].name} className="w-full h-full object-cover opacity-90" />
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-orange-100 dark:bg-orange-950 border border-orange-400 dark:border-orange-600 text-orange-700 dark:text-white text-[10px] font-black px-3 py-0.5 rounded-full shadow-[0_0_10px_rgba(234,88,12,0.3)]">
                #3
              </div>
            </div>
            <h3 className="text-sm font-black text-slate-800 dark:text-white text-center tracking-tight">{PODIUM_DATA[2].name}</h3>
            <p className="text-orange-600 dark:text-orange-400 font-black text-[11px] font-mono mt-1 drop-shadow-[0_0_5px_rgba(234,88,12,0.5)]">{PODIUM_DATA[2].xp.toLocaleString()} XP</p>
          </motion.div>
        </div>

        {/* Dynamic Data Grid List */}
        <div className="w-full relative z-10 mt-4">
          <div className="flex items-center justify-between mb-4 px-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Global Competitors</span>
            <button className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors flex items-center gap-1 cursor-pointer">
              View Full Ladder <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-3">
            {LIST_DATA.map((user, idx) => (
              <motion.div 
                key={idx} 
                variants={itemVariants}
                className={`group relative overflow-hidden rounded-2xl flex items-center justify-between p-4 transition-all duration-300 ${
                  user.isMe 
                    ? 'bg-indigo-50/50 dark:bg-gradient-to-r dark:from-indigo-600/20 dark:to-purple-600/5 border border-indigo-200 dark:border-indigo-500/30' 
                    : 'bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Left: Rank, Avatar, Name */}
                <div className="flex items-center gap-4 relative z-10">
                  <span className={`w-8 text-[11px] font-mono font-black text-center ${user.isMe ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>
                    #{user.rank}
                  </span>
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-inner">
                    {user.avatar.startsWith('http') ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] font-black text-slate-500 dark:text-slate-300">{user.avatar}</span>
                    )}
                  </div>
                  <span className={`text-xs font-black tracking-tight ${user.isMe ? 'text-indigo-955 dark:text-white' : 'text-slate-800 dark:text-slate-300'}`}>
                    {user.name}
                  </span>
                </div>

                {/* Right: Stats */}
                <div className="flex items-center gap-8 relative z-10">
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Score</span>
                    <span className="text-xs font-mono font-black text-slate-900 dark:text-white">
                      {user.xp.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="hidden sm:flex flex-col items-end w-24">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Accuracy</span>
                      <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">{user.accuracy}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800/80 h-2 rounded-full overflow-hidden p-[1px]">
                      <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]" style={{ width: `${user.accuracy}%` }} />
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Streak</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                      {user.streak} <Flame className="w-3.5 h-3.5 text-orange-500 dark:text-orange-400 fill-orange-500/20" />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

      </div>

      {/* Right Sidebar Area - Cyberpunk/HUD Data Panels */}
      <div className="w-full xl:w-[320px] flex flex-col gap-6 shrink-0 relative z-10 pt-4 xl:pt-0">
        
        {/* HUD Current Standing Block */}
        <div className="bg-slate-50 dark:bg-slate-900/40 backdrop-blur-sm border border-slate-200 dark:border-slate-800/60 rounded-3xl p-6 relative group overflow-hidden shadow-sm dark:shadow-none">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 blur-xl rounded-full" />

          
          <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400/80 mb-2 block">Global Rank Status</span>
          <div className="flex items-end gap-3 mb-4">
            <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter font-mono">1284</h2>
            <div className="flex flex-col pb-1">
              <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                ↑ 12 pos
              </span>
            </div>
          </div>
          
          {/* Rank Progress Bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden mb-3">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 w-[85%]" />
          </div>
          <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
            Top 15% of all active learners globally. Next tier at Rank #1000.
          </p>
        </div>

        {/* 2x2 Metric Data Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-808/60 rounded-2xl p-4 hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors shadow-sm dark:shadow-none text-left">
            <Target className="w-4 h-4 text-blue-600 dark:text-blue-400 mb-3" />
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-1">XP Earned</span>
            <span className="text-sm font-black text-slate-900 dark:text-white font-mono">4,920</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-808/60 rounded-2xl p-4 shadow-sm dark:shadow-none text-left">
            <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mb-3" />
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-1">Win Rate</span>
            <span className="text-sm font-black text-slate-900 dark:text-white font-mono">82%</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-808/60 rounded-2xl p-4 shadow-sm dark:shadow-none text-left">
            <Flame className="w-4 h-4 text-orange-500 dark:text-orange-400 fill-orange-500/20 mb-3" />
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-1">Hot Streak</span>
            <span className="text-sm font-black text-slate-900 dark:text-white font-mono">5 Days</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-808/60 rounded-2xl p-4 shadow-sm dark:shadow-none text-left">
            <BarChart className="w-4 h-4 text-purple-600 dark:text-purple-400 mb-3" />
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-1">Avg Score</span>
            <span className="text-sm font-black text-slate-900 dark:text-white font-mono">94.2</span>
          </div>
        </div>

        {/* Live Network Feed */}
        <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-808/60 rounded-3xl p-6 relative overflow-hidden flex-1 shadow-sm dark:shadow-none">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent opacity-30" />
          
          <div className="flex items-center justify-between mb-6">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Live Network</span>
          </div>
          
          <div className="space-y-5 text-left">
            {FRIENDS_ACTIVITY.map((friend, idx) => (
              <div key={idx} className="flex gap-3">
                <div className="mt-1 w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[8px] font-black text-slate-500 dark:text-slate-400 shrink-0 border border-slate-200 dark:border-slate-700">
                  {friend.initials}
                </div>
                <div>
                  <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                    <strong className="text-slate-900 dark:text-slate-200 font-bold">{friend.name}</strong> {friend.action}
                  </p>
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block mt-1">
                    {friend.time} ago
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
