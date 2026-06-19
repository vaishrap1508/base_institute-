'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trophy, 
  Flame, 
  Target, 
  Award, 
  ChevronDown, 
  ChevronUp, 
  Share2, 
  Download, 
  Link as LinkIcon, 
  Eye, 
  EyeOff, 
  Briefcase, 
  UserCheck, 
  Save, 
  Sparkles, 
  ShieldAlert, 
  Zap, 
  Calendar, 
  Activity, 
  CheckCircle,
  HelpCircle,
  Cpu,
  Lock,
  Edit3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AVATAR_PRESETS = [
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Jack',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Liliana',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Oliver',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Buster',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Zoe',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Lucy',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Milo',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Leo',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Max',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Charlie'
];

interface PlacementProfileProps {
  profile: any;
  setProfile: (val: any) => void;
  handleProfileSave: (e: React.FormEvent) => void;
  saveSuccess: boolean;
  setSaveSuccess: (val: boolean) => void;
}

export default function PlacementProfile({
  profile,
  setProfile,
  handleProfileSave,
  saveSuccess,
  setSaveSuccess
}: PlacementProfileProps) {

  // Avatar Customization States
  const [selectedFrame, setSelectedFrame] = useState<string>('Gold Frame');
  const [selectedRankBorder, setSelectedRankBorder] = useState<string>('Diamond');
  const [selectedEffect, setSelectedEffect] = useState<string>('Electric Ring');

  // Interactive controls
  const [visibility, setVisibility] = useState<'public' | 'private' | 'recruiter' | 'friends'>('recruiter');
  const [isFormExpanded, setIsFormExpanded] = useState<boolean>(false);
  const [generatingCard, setGeneratingCard] = useState<boolean>(false);
  const [cardGenerated, setCardGenerated] = useState<boolean>(false);
  const [customToast, setCustomToast] = useState<string | null>(null);

  // Active tooltip coordinate mapping for SVG components
  const [activeRadarTooltip, setActiveRadarTooltip] = useState<{ x: number; y: number; label: string; val: number } | null>(null);
  const [activeHeatmapTooltip, setActiveHeatmapTooltip] = useState<{ x: number; y: number; date: string; solves: number; acc: number } | null>(null);

  // Generate username handle from student name
  const usernameHandle = useMemo(() => {
    if (!profile.username) return 'student';
    return profile.username.toLowerCase().replace(/\s+/g, '_');
  }, [profile.username]);

  // Collateral Frames & Rank configurations
  const framesList = ['None', 'Bronze Frame', 'Silver Frame', 'Gold Frame', 'Platinum Frame', 'Neon Frame'];
  const rankBordersList = ['Bronze', 'Silver', 'Gold', 'Diamond', 'Top 100'];
  const effectsList = ['None', 'Floating Particles', 'Fire Aura', 'Electric Ring', 'Cosmic Glow', 'Diamond Sparkle'];

  // Radar chart configuration parameters
  const radarData = [
    { subject: 'Quant', value: 82, label: 'Quantitative Aptitude' },
    { subject: 'Logic', value: 91, label: 'Logical Reasoning' },
    { subject: 'Verbal', value: 63, label: 'Verbal Ability' },
    { subject: 'Speed', value: 74, label: 'Solving Speed' },
    { subject: 'Accuracy', value: 88, label: 'Solving Accuracy' }
  ];

  // SVG Radar computation
  const radarCenter = 130;
  const radarRadius = 85;
  const radarPoints = useMemo(() => {
    return radarData.map((d, i) => {
      const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      const r = (d.value / 100) * radarRadius;
      return {
        x: radarCenter + r * Math.cos(angle),
        y: radarCenter + r * Math.sin(angle),
        subject: d.subject,
        fullName: d.label,
        val: d.value
      };
    });
  }, [radarData]);

  // Pentagon outline grids for Radar background
  const pentagons = [0.2, 0.4, 0.6, 0.8, 1.0].map((scale) => {
    return radarData.map((_, i) => {
      const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      const r = scale * radarRadius;
      return {
        x: radarCenter + r * Math.cos(angle),
        y: radarCenter + r * Math.sin(angle)
      };
    });
  });

  // Consistency activity heatmap generator (371 blocks representing past year cells)
  const heatmapSolves = useMemo(() => {
    // Generate simulated consistency solves matrix
    const data = [];
    const date = new Date();
    date.setDate(date.getDate() - 370); // start 370 days ago

    for (let i = 0; i < 371; i++) {
      const dayOfWeek = date.getDay();
      const monthLabel = date.toLocaleString('default', { month: 'short' });
      
      // Simulate random seed activity count
      const seed = Math.random();
      let solves = 0;
      let accuracy = 0;
      
      if (seed > 0.4) {
        solves = Math.floor(Math.random() * 4) + 1; // Low/medium solves
        accuracy = Math.floor(Math.random() * 20) + 80;
      }
      if (seed > 0.85) {
        solves = Math.floor(Math.random() * 8) + 5; // High solves
        accuracy = Math.floor(Math.random() * 15) + 85;
      }

      data.push({
        index: i,
        day: dayOfWeek,
        month: monthLabel,
        dateStr: date.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' }),
        solves,
        accuracy
      });

      date.setDate(date.getDate() + 1);
    }
    return data;
  }, []);

  // Public controls helper update
  const handleVisibilityChange = (mode: 'public' | 'private' | 'recruiter' | 'friends') => {
    setVisibility(mode);
    setCustomToast(`Visibility updated to ${mode.toUpperCase()}! 🛡️`);
    setTimeout(() => setCustomToast(null), 2500);
  };

  // Simulated rank card generator
  const handleGenerateCard = () => {
    setGeneratingCard(true);
    setTimeout(() => {
      setGeneratingCard(false);
      setCardGenerated(true);
      setCustomToast('Placement Resume Card Generated! 🚀');
      setTimeout(() => setCustomToast(null), 2500);
    }, 1500);
  };

  // Pre-configured achievements listings
  const achievements = [
    // Category 1: Placement
    { id: 'p1', title: 'TCS Crusher', req: 'Solve 50 TCS level practice sets', category: 'placement', icon: '💻', unlocked: true },
    { id: 'p2', title: 'Infosys Champion', req: 'Unlock 8 Infosys test sets', category: 'placement', icon: '🛡️', unlocked: true },
    { id: 'p3', title: 'Amazon Tag Master', req: 'Solve 15 Amazon tagged hard items', category: 'placement', icon: '📦', unlocked: false },
    { id: 'p4', title: 'Accenture Expert', req: 'Attain 90% accuracy in Accenture mocks', category: 'placement', icon: '💎', unlocked: false },
    // Category 2: Consistency
    { id: 'c1', title: '7 Day Streak', req: 'Practice 7 days consecutively', category: 'consistency', icon: '🔥', unlocked: true },
    { id: 'c2', title: '30 Day Streak', req: 'Practice 30 days consecutively', category: 'consistency', icon: '⚡', unlocked: true },
    { id: 'c3', title: '100 Day Streak', req: 'Practice 100 days consecutively', category: 'consistency', icon: '🌟', unlocked: false },
    { id: 'c4', title: '365 Day Warrior', req: 'Maintain consistent learning for 365 days', category: 'consistency', icon: '🎖️', unlocked: false },
    // Category 3: Learning
    { id: 'l1', title: 'Arithmetic Apprentice', req: 'Solve 20 Arithmetic questions', category: 'learning', icon: '📐', unlocked: true },
    { id: 'l2', title: 'Ratio Master', req: 'Attain 100% ratios solving speed', category: 'learning', icon: '🧩', unlocked: true },
    { id: 'l3', title: 'Geometry Ninja', req: 'Complete 30 geometry sets', category: 'learning', icon: '🎯', unlocked: false },
    { id: 'l4', title: 'Logic Legend', req: 'Reach Level 25 in Logical puzzles', category: 'learning', icon: '👑', unlocked: true }
  ];

  // Helper styles for Avatar frames & borders
  const getAvatarStyles = () => {
    let frameClass = '';
    let rankBorderClass = '';
    let effectGlow = '';

    // Selected custom border frames
    if (selectedFrame === 'Bronze Frame') frameClass = 'ring-4 ring-[#CD7F32] shadow-lg';
    if (selectedFrame === 'Silver Frame') frameClass = 'ring-4 ring-[#C0C0C0] shadow-lg';
    if (selectedFrame === 'Gold Frame') frameClass = 'ring-4 ring-[#FFD700] shadow-[0_0_15px_rgba(255,215,0,0.4)]';
    if (selectedFrame === 'Platinum Frame') frameClass = 'ring-4 ring-[#E5E4E2] shadow-[0_0_15px_rgba(229,228,226,0.3)]';
    if (selectedFrame === 'Neon Frame') frameClass = 'ring-4 ring-[#00F3FF] shadow-[0_0_20px_rgba(0,243,255,0.5)] animate-pulse';

    // Placement Rank Border outlines
    if (selectedRankBorder === 'Bronze') rankBorderClass = 'border-4 border-[#CD7F32] rounded-3xl';
    if (selectedRankBorder === 'Silver') rankBorderClass = 'border-4 border-[#C0C0C0] rounded-3xl';
    if (selectedRankBorder === 'Gold') rankBorderClass = 'border-4 border-[#FFD700] rounded-3xl';
    if (selectedRankBorder === 'Diamond') rankBorderClass = 'border-4 border-[#10B981] dark:border-[#3B82F6] rounded-3xl';
    if (selectedRankBorder === 'Top 100') rankBorderClass = 'border-4 border-dashed border-red-500 rounded-3xl animate-spin-slow';

    // Effects glows
    if (selectedEffect === 'Floating Particles') effectGlow = 'shadow-[0_0_25px_rgba(245,158,11,0.25)]';
    if (selectedEffect === 'Fire Aura') effectGlow = 'shadow-[0_0_30px_rgba(239,68,68,0.5)]';
    if (selectedEffect === 'Electric Ring') effectGlow = 'shadow-[0_0_30px_rgba(59,130,246,0.5)]';
    if (selectedEffect === 'Cosmic Glow') effectGlow = 'shadow-[0_0_35px_rgba(139,92,246,0.5)]';
    if (selectedEffect === 'Diamond Sparkle') effectGlow = 'shadow-[0_0_25px_rgba(16,185,129,0.35)]';

    return { frameClass, rankBorderClass, effectGlow };
  };

  const { frameClass, rankBorderClass, effectGlow } = getAvatarStyles();

  return (
    <div className="w-full relative text-slate-100 dark:text-slate-100 space-y-8 select-text">
      
      {/* Toast Alert Popups */}
      <AnimatePresence>
        {customToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white shadow-xl text-xs font-bold uppercase tracking-wider select-none"
          >
            <span>{customToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Saved Message banner */}
      {saveSuccess && (
        <div className="bg-emerald-500/10 dark:bg-emerald-950/20 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl p-4 flex items-center gap-3 animate-fadeIn select-none">
          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
          <span className="text-xs font-bold font-sans">Aptitude credentials saved successfully to database!</span>
        </div>
      )}

      {/* SECTION 1: Identity Hero Card */}
      <section className="bg-slate-900/60 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-900 rounded-3xl p-6 md:p-8 backdrop-blur-md relative overflow-hidden flex flex-col md:flex-row items-center md:items-start gap-8">
        
        {/* Soft decorative background gradients */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 dark:bg-blue-600/5 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/5 dark:bg-purple-600/5 blur-3xl rounded-full pointer-events-none" />

        {/* Large Customizable Avatar Frame container */}
        <div className="relative shrink-0 select-none group">
          {/* Avatar effect layer */}
          {selectedEffect !== 'None' && (
            <div className={`absolute -inset-4 rounded-full filter blur-md opacity-70 animate-pulse pointer-events-none ${
              selectedEffect === 'Floating Particles' ? 'bg-amber-400/20' :
              selectedEffect === 'Fire Aura' ? 'bg-rose-500/30' :
              selectedEffect === 'Electric Ring' ? 'bg-blue-500/30 animate-pulse' :
              selectedEffect === 'Cosmic Glow' ? 'bg-purple-500/30' : 'bg-emerald-400/20'
            }`} />
          )}

          {/* Placement Rank Frame border wrapper */}
          <div className={`p-1.5 ${rankBorderClass} ${effectGlow} transition-all duration-300 group-hover:scale-103`}>
            
            {/* Main Avatar profile image */}
            <div className={`relative w-28 h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden bg-slate-950 ${frameClass}`}>
              {(!profile.avatar || profile.avatar === 'initial') ? (
                <div className="w-full h-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-3xl uppercase leading-none">
                  {profile.username ? profile.username[0] : 'V'}
                </div>
              ) : (
                <img
                  src={profile.avatar}
                  alt={profile.username}
                  className="w-full h-full object-cover"
                />
              )}

              {/* Floating micro effects */}
              {selectedEffect === 'Floating Particles' && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full absolute top-2 left-6 animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full absolute bottom-4 right-5 animate-bounce [animation-delay:0.3s]" />
                  <span className="w-1 h-1 bg-amber-300 rounded-full absolute top-12 right-2 animate-ping" />
                </div>
              )}

              {selectedEffect === 'Diamond Sparkle' && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <span className="text-[10px] text-emerald-300 absolute top-3 right-4 animate-pulse">✨</span>
                  <span className="text-[10px] text-emerald-300 absolute bottom-3 left-4 animate-pulse [animation-delay:0.6s]">✨</span>
                </div>
              )}
            </div>

          </div>

          {/* Floating level badge */}
          <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-600 to-indigo-600 border border-blue-400 text-white font-mono text-[10.5px] font-black px-2.5 py-1 rounded-full shadow-lg">
            LVL 27
          </div>
        </div>

        {/* Identity description and XP level progress */}
        <div className="flex-1 space-y-5 text-center md:text-left w-full">
          <div className="space-y-1.5">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 justify-center md:justify-start">
              <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white tracking-tight leading-none uppercase">
                {profile.username || 'Vaishnavi Raparthy'}
              </h2>
              {/* Verified badge */}
              <div className="self-center flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider select-none">
                <CheckCircle className="w-3 h-3" /> Verified Student
              </div>
            </div>
            
            <p className="text-xs text-slate-400 font-mono select-none">
              @{usernameHandle}
            </p>
            
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-normal">
              {profile.branch || 'Computer Science Engineering'} • Class of {profile.graduation_year || '2026'}
            </p>
          </div>

          {/* Level credentials and XP Slider bar */}
          <div className="space-y-2 max-w-md mx-auto md:mx-0 text-left select-none">
            <div className="flex justify-between items-end text-[10.5px] font-bold text-slate-500 font-mono uppercase">
              <span>Title: <strong className="text-blue-500 font-black">Logic Legend</strong></span>
              <span>2,740 / 3,000 XP</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 h-3 rounded-full overflow-hidden p-0.5">
              <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 h-full rounded-full shadow-[0_0_8px_rgba(59,130,246,0.4)]" style={{ width: '91%' }} />
            </div>
          </div>
        </div>

      </section>

      {/* Interactive Avatar Accessories controls row */}
      <section className="bg-slate-900/60 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-900 rounded-3xl p-5 md:p-6 backdrop-blur-md text-left space-y-5 select-none">
        
        <div className="border-b border-slate-100 dark:border-slate-900 pb-3 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-white">Avatar Accessories & Prestige Customizations</h4>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Unlock prestige collectibles and show off your solving rank borders.</p>
          </div>
          <Sparkles className="w-4 h-4 text-amber-500" />
        </div>

        {/* Custom selectors parameters grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Frame Select */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Unlocked Avatar Frames</label>
            <select
              value={selectedFrame}
              onChange={e => setSelectedFrame(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-white font-semibold focus:outline-none"
            >
              {framesList.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          {/* Border Select */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Placement Rank Borders</label>
            <select
              value={selectedRankBorder}
              onChange={e => setSelectedRankBorder(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-white font-semibold focus:outline-none"
            >
              {rankBordersList.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Effect Select */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Unlocked Avatar Effects</label>
            <select
              value={selectedEffect}
              onChange={e => setSelectedEffect(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-white font-semibold focus:outline-none"
            >
              {effectsList.map(eff => (
                <option key={eff} value={eff}>{eff}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Existing Avatar list rows selector */}
        <div className="pt-4 border-t border-slate-150 dark:border-slate-900 space-y-3">
          <label className="text-[9.5px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
            Switch base identity preset seed
          </label>
          
          <div className="flex flex-wrap gap-3 items-center">
            {/* Initials button */}
            <button
              type="button"
              onClick={() => setProfile({ ...profile, avatar: 'initial' })}
              className={`w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-xs uppercase shadow-sm transition-all duration-200 hover:scale-105 cursor-pointer border-2 ${(!profile.avatar || profile.avatar === 'initial')
                  ? 'border-blue-600 ring-2 ring-blue-500/20 scale-105'
                  : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              title="Use Initials"
            >
              {profile.username ? profile.username[0] : 'V'}
            </button>

            {/* dicebear list presets */}
            {AVATAR_PRESETS.map((imgUrl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setProfile({ ...profile, avatar: imgUrl })}
                className={`w-11 h-11 rounded-xl overflow-hidden shadow-sm transition-all duration-200 hover:scale-105 cursor-pointer border-2 ${profile.avatar === imgUrl
                    ? 'border-blue-600 ring-2 ring-blue-500/20 scale-105'
                    : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
              >
                <img src={imgUrl} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          
          {/* Paste URL field */}
          <div className="max-w-md pt-1.5">
            <input
              type="url"
              placeholder="Paste custom avatar image URL link..."
              value={profile.avatar && profile.avatar !== 'initial' && !AVATAR_PRESETS.includes(profile.avatar) ? profile.avatar : ''}
              onChange={e => setProfile({ ...profile, avatar: e.target.value || 'initial' })}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-600 placeholder-slate-400"
            />
          </div>
        </div>

      </section>

      {/* SECTION 2: Aptitude DNA Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 select-none">
        
        {/* Solves */}
        <div className="bg-slate-900/60 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-900 rounded-3xl p-5 md:p-6 text-left relative overflow-hidden group hover:translate-y-[-4px] hover:shadow-lg transition-all duration-250">
          <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-blue-500 to-indigo-500" />
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Total solved</span>
          
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-slate-800 dark:text-white">1,240</span>
            <span className="text-xs text-slate-400 font-bold">/ 10,000</span>
          </div>

          <div className="mt-4 space-y-1">
            <div className="w-full bg-slate-100 dark:bg-slate-900 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full" style={{ width: '12.4%' }} />
            </div>
            <div className="flex justify-between text-[8px] font-bold text-slate-400 font-mono uppercase">
              <span>Goal: 10K Solves</span>
              <span>12.4% Complete</span>
            </div>
          </div>
        </div>

        {/* Accuracy */}
        <div className="bg-slate-900/60 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-900 rounded-3xl p-5 md:p-6 text-left relative overflow-hidden group hover:translate-y-[-4px] hover:shadow-lg transition-all duration-250 flex items-center justify-between">
          <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-emerald-500 to-teal-500" />
          
          <div className="space-y-1">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Solve Accuracy</span>
            <span className="text-3xl font-black font-mono text-slate-800 dark:text-white block mt-2">88.5%</span>
            <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider font-mono">+1.4% past week</span>
          </div>

          {/* SVG Circular accuracy ring */}
          <div className="relative w-14 h-14 shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="28" cy="28" r="22" stroke="rgba(241,245,249,0.08)" strokeWidth="4.5" fill="transparent" />
              <circle cx="28" cy="28" r="22" stroke="#10B981" strokeWidth="4.5" fill="transparent"
                strokeDasharray={2 * Math.PI * 22}
                strokeDashoffset={2 * Math.PI * 22 * (1 - 0.885)}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center font-mono text-[9.5px] font-black text-slate-600 dark:text-slate-350">88%</span>
          </div>
        </div>

        {/* Streak */}
        <div className="bg-slate-900/60 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-900 rounded-3xl p-5 md:p-6 text-left relative overflow-hidden group hover:translate-y-[-4px] hover:shadow-lg transition-all duration-250 flex items-center justify-between">
          <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-amber-500 to-orange-500" />
          
          <div className="space-y-1">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Daily Streak</span>
            <span className="text-3xl font-black font-mono text-slate-800 dark:text-white block mt-2">42 Days</span>
            <span className="text-[9.5px] font-bold text-slate-400 font-mono">Personal Best: 75 Days</span>
          </div>
          
          <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center animate-pulse">
            <Flame className="w-6.5 h-6.5 text-amber-500 fill-current" />
          </div>
        </div>

        {/* Rank */}
        <div className="bg-slate-900/60 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-900 rounded-3xl p-5 md:p-6 text-left relative overflow-hidden group hover:translate-y-[-4px] hover:shadow-lg transition-all duration-250 flex items-center justify-between">
          <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-purple-500 to-pink-500" />
          
          <div className="space-y-1">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Global Rank</span>
            <span className="text-3xl font-black font-mono text-slate-800 dark:text-white block mt-2">#1,402</span>
            <span className="text-[9px] font-black bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider inline-block">Top 12%</span>
          </div>

          <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center">
            <Trophy className="w-6 h-6 text-purple-400" />
          </div>
        </div>

      </section>

      {/* Main Charts & Consistency layout section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Placement Radar chart (5 columns) */}
        <div className="lg:col-span-5 bg-slate-900/60 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-900 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden min-h-[360px] flex flex-col justify-between select-none">
          
          <div className="text-left">
            <h4 className="text-xs font-black uppercase text-slate-800 dark:text-white tracking-widest">Placement Readiness Radar</h4>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Your strengths across aptitude domains</p>
          </div>

          {/* Interactive SVG Radar Chart */}
          <div className="relative w-full flex items-center justify-center py-4">
            <svg width="260" height="260" className="overflow-visible">
              {/* Concentric grid pentagons */}
              {pentagons.map((pent, pIdx) => {
                const pointsStr = pent.map(pt => `${pt.x},${pt.y}`).join(' ');
                return (
                  <polygon
                    key={pIdx}
                    points={pointsStr}
                    fill="none"
                    stroke="rgba(226,232,240,0.06)"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Radial lines from center */}
              {radarPoints.map((pt, idx) => {
                const angle = (idx * 2 * Math.PI) / 5 - Math.PI / 2;
                const endX = radarCenter + radarRadius * Math.cos(angle);
                const endY = radarCenter + radarRadius * Math.sin(angle);
                return (
                  <line
                    key={idx}
                    x1={radarCenter}
                    y1={radarCenter}
                    x2={endX}
                    y2={endY}
                    stroke="rgba(226,232,240,0.06)"
                    strokeWidth="1.5"
                  />
                );
              })}

              {/* Filled polygon values */}
              {(() => {
                const pointsStr = radarPoints.map(pt => `${pt.x},${pt.y}`).join(' ');
                return (
                  <polygon
                    points={pointsStr}
                    fill="rgba(59,130,246,0.18)"
                    stroke="#3B82F6"
                    strokeWidth="2.5"
                    className="transition-all duration-300"
                  />
                );
              })()}

              {/* Interactive nodes */}
              {radarPoints.map((pt, idx) => {
                return (
                  <g key={idx}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="4.5"
                      fill="#3B82F6"
                      stroke="#030712"
                      strokeWidth="2"
                      className="cursor-pointer hover:r-6 transition-all"
                      onMouseEnter={(e) => {
                        const bbox = e.currentTarget.getBoundingClientRect();
                        setActiveRadarTooltip({
                          x: pt.x,
                          y: pt.y - 12,
                          label: pt.fullName,
                          val: pt.val
                        });
                      }}
                      onMouseLeave={() => setActiveRadarTooltip(null)}
                    />
                  </g>
                );
              })}

              {/* Labels with text anchors */}
              {radarPoints.map((pt, idx) => {
                const angle = (idx * 2 * Math.PI) / 5 - Math.PI / 2;
                const labelR = radarRadius + 18;
                const labelX = radarCenter + labelR * Math.cos(angle);
                const labelY = radarCenter + labelR * Math.sin(angle);

                let textAnchor: 'start' | 'end' | 'middle' = 'middle';
                if (Math.cos(angle) > 0.1) textAnchor = 'start';
                if (Math.cos(angle) < -0.1) textAnchor = 'end';

                return (
                  <text
                    key={idx}
                    x={labelX}
                    y={labelY + 4}
                    fill="#94A3B8"
                    fontSize="9.5"
                    fontWeight="black"
                    textAnchor={textAnchor}
                    className="font-mono uppercase select-none"
                  >
                    {pt.subject} ({pt.val})
                  </text>
                );
              })}
            </svg>

            {/* Radar Tooltip */}
            {activeRadarTooltip && (
              <div 
                className="absolute z-20 px-2.5 py-1.5 bg-slate-900 border border-slate-800 text-white rounded-xl text-[9px] font-bold flex flex-col pointer-events-none shadow-md"
                style={{ left: `${activeRadarTooltip.x - 40}px`, top: `${activeRadarTooltip.y - 30}px` }}
              >
                <span className="text-slate-400 font-semibold">{activeRadarTooltip.label}</span>
                <span className="font-mono text-blue-400 mt-0.5">Strength: {activeRadarTooltip.val}%</span>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-900 flex justify-between text-[8px] font-bold text-slate-500 font-mono uppercase">
            <span>Overall Index: 79.6%</span>
            <span>Target: 90%</span>
          </div>

        </div>

        {/* Right Column: Consistency Heatmap Grid (7 columns) */}
        <div className="lg:col-span-7 bg-slate-900/60 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-900 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden select-none space-y-5">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
            <div>
              <h4 className="text-xs font-black uppercase text-slate-800 dark:text-white tracking-widest">Consistency Tracker</h4>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">365-day aptitude solving commits</p>
            </div>
            
            {/* Legend block status */}
            <div className="flex items-center gap-1.5 text-[8.5px] font-bold text-slate-400 font-mono uppercase">
              <span>Less</span>
              <div className="w-2.5 h-2.5 bg-slate-900 rounded-xs border border-slate-800" />
              <div className="w-2.5 h-2.5 bg-blue-900/40 rounded-xs border border-blue-900/20" />
              <div className="w-2.5 h-2.5 bg-blue-500/40 rounded-xs border border-blue-500/20" />
              <div className="w-2.5 h-2.5 bg-blue-600 rounded-xs border border-blue-500" />
              <span>More</span>
            </div>
          </div>

          {/* Stats above Heatmap grid */}
          <div className="grid grid-cols-3 gap-3 text-left bg-slate-950/20 dark:bg-slate-900/20 p-3 rounded-2xl border border-slate-200/50 dark:border-slate-900">
            <div>
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Active Streak</span>
              <span className="text-sm font-mono font-black text-slate-800 dark:text-white mt-1 block">42 Days 🔥</span>
            </div>
            <div>
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Longest Streak</span>
              <span className="text-sm font-mono font-black text-slate-800 dark:text-white mt-1 block">75 Days</span>
            </div>
            <div>
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Solves This Month</span>
              <span className="text-sm font-mono font-black text-slate-800 dark:text-white mt-1 block">184 Sets</span>
            </div>
          </div>

          {/* Horizontal scrollable grid wrapper */}
          <div className="relative w-full overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            
            {/* SVG grid layout */}
            <div className="relative" style={{ width: '660px', height: '110px' }}>
              <svg width="660" height="98" className="overflow-visible">
                {Array.from({ length: 53 }).map((_, colIdx) => {
                  return Array.from({ length: 7 }).map((_, rowIdx) => {
                    const blockIdx = colIdx * 7 + rowIdx;
                    const cell = heatmapSolves[blockIdx];
                    if (!cell) return null;

                    // Color codes representing solves counts
                    let color = 'rgba(241,245,249,0.02)';
                    let border = 'rgba(241,245,249,0.05)';
                    if (cell.solves > 0) {
                      color = 'rgba(29, 78, 216, 0.2)'; // Light blue
                      border = 'rgba(59, 130, 246, 0.2)';
                    }
                    if (cell.solves >= 3) {
                      color = 'rgba(59, 130, 246, 0.5)'; // Bright blue
                      border = 'rgba(59, 130, 246, 0.4)';
                    }
                    if (cell.solves >= 6) {
                      color = '#2563eb'; // Electric blue
                      border = '#3B82F6';
                    }

                    const x = colIdx * 12;
                    const y = rowIdx * 12 + 12;

                    return (
                      <rect
                        key={blockIdx}
                        x={x}
                        y={y}
                        width="9.5"
                        height="9.5"
                        rx="1.5"
                        fill={color}
                        stroke={border}
                        strokeWidth="0.8"
                        className="cursor-pointer transition-all hover:stroke-white/50"
                        onMouseEnter={(e) => {
                          const bbox = e.currentTarget.getBoundingClientRect();
                          setActiveHeatmapTooltip({
                            x: x,
                            y: y - 10,
                            date: cell.dateStr,
                            solves: cell.solves,
                            acc: cell.accuracy
                          });
                        }}
                        onMouseLeave={() => setActiveHeatmapTooltip(null)}
                      />
                    );
                  });
                })}

                {/* Day indicator labels */}
                {['M', 'W', 'F'].map((day, idx) => (
                  <text
                    key={day}
                    x="-12"
                    y={idx * 24 + 31}
                    fill="#94A3B8"
                    fontSize="7.5"
                    fontWeight="black"
                    className="font-mono select-none text-right"
                  >
                    {day}
                  </text>
                ))}
              </svg>

              {/* Heatmap Tooltip */}
              {activeHeatmapTooltip && (
                <div 
                  className="absolute z-20 px-2.5 py-1.5 bg-slate-900 border border-slate-800 text-white rounded-xl text-[9px] font-bold flex flex-col pointer-events-none shadow-md whitespace-nowrap"
                  style={{ left: `${activeHeatmapTooltip.x - 50}px`, top: `${activeHeatmapTooltip.y - 48}px` }}
                >
                  <span className="text-slate-400 font-semibold">{activeHeatmapTooltip.date}</span>
                  {activeHeatmapTooltip.solves > 0 ? (
                    <span className="font-mono text-blue-400 mt-0.5">
                      Solved {activeHeatmapTooltip.solves} questions • Acc {activeHeatmapTooltip.acc}%
                    </span>
                  ) : (
                    <span className="italic text-slate-500 mt-0.5">No questions practiced</span>
                  )}
                </div>
              )}
            </div>

          </div>

        </div>

      </section>

      {/* SECTION 5: Trophy Case achievements carousel */}
      <section className="bg-slate-900/60 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-900 rounded-3xl p-6 backdrop-blur-md text-left space-y-4 select-none">
        
        <div>
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-white">Placement Achievements Trophy Case</h4>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Horizontal achievements catalog representing milestones and qualifier badges.</p>
        </div>

        {/* Carousel container */}
        <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {achievements.map((item) => {
            return (
              <div
                key={item.id}
                className={`flex-shrink-0 w-44 p-4 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden group ${
                  item.unlocked
                    ? 'bg-slate-950/40 border-slate-250 dark:border-slate-900 hover:border-blue-500/50 hover:translate-y-[-2px] shadow-sm'
                    : 'bg-slate-900/10 border-slate-200/40 opacity-40 select-none'
                }`}
                title={!item.unlocked ? `Locked: ${item.req}` : ''}
              >
                {/* Ribbon tag for category */}
                <div className={`absolute top-0 right-0 w-2.5 h-full ${
                  item.category === 'placement' ? 'bg-blue-600' :
                  item.category === 'consistency' ? 'bg-amber-500' : 'bg-purple-500'
                }`} />

                {/* Big emoji emblem */}
                <div className="text-2xl mb-3.5 group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>

                <h5 className="text-[11px] font-black uppercase text-slate-800 dark:text-white tracking-wide truncate pr-2">
                  {item.title}
                </h5>

                <p className="text-[9.5px] font-semibold text-slate-400 mt-1 leading-normal line-clamp-2 pr-1.5">
                  {item.unlocked ? item.req : `Req: ${item.req}`}
                </p>

                {!item.unlocked && (
                  <div className="mt-3.5 flex items-center gap-1 text-[8.5px] text-slate-500 font-bold uppercase font-mono">
                    <Lock className="w-3 h-3 shrink-0" /> Locked Achievement
                  </div>
                )}
                {item.unlocked && (
                  <div className="mt-3.5 flex items-center gap-1 text-[8.5px] text-emerald-500 font-black uppercase font-mono">
                    <CheckCircle className="w-3.5 h-3.5 shrink-0" /> Unlocked Earned
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </section>

      {/* Section 6 & 7: Generator and controls */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Rank Card Generator (8 columns) */}
        <div className="lg:col-span-8 bg-slate-900/60 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-900 rounded-3xl p-6 backdrop-blur-md text-left space-y-5 select-none">
          
          <div>
            <h4 className="text-xs font-black uppercase text-slate-800 dark:text-white tracking-widest">Placement Resume Card Generator</h4>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Generate a shareable infographic card highlighting your performance index.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Card preview graphic */}
            <div className="md:col-span-7">
              <div className="w-full aspect-[1.6/1] bg-gradient-to-tr from-[#0F172A] to-[#1E293B] border border-slate-800 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between shadow-2xl">
                {/* Background grids styling */}
                <div className="absolute top-0 right-0 w-36 h-36 bg-blue-600/10 blur-2xl rounded-full" />
                <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-indigo-600/10 blur-2xl rounded-full" />

                {/* Header branding details */}
                <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span className="font-mono text-[9px] font-black text-slate-400 uppercase tracking-widest">Aptitude Portfolio</span>
                  </div>
                  <div className="text-[9px] font-black text-blue-400 font-mono tracking-widest">LEVEL 27</div>
                </div>

                {/* Body details */}
                <div className="flex gap-4 items-center">
                  <div className="relative">
                    {/* Visual border frames preview */}
                    <div className={`p-1 ${rankBorderClass} ${effectGlow}`}>
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-950">
                        {(!profile.avatar || profile.avatar === 'initial') ? (
                          <div className="w-full h-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-base uppercase">
                            {profile.username ? profile.username[0] : 'V'}
                          </div>
                        ) : (
                          <img src={profile.avatar} className="w-full h-full object-cover" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 text-left min-w-0">
                    <h5 className="text-xs font-black uppercase text-white tracking-wide truncate">{profile.username || 'Vaishnavi Raparthy'}</h5>
                    <span className="text-[9px] text-slate-400 block truncate">{profile.college || 'VNR VJIET'}</span>
                    <span className="text-[8.5px] font-semibold text-slate-500 font-mono block">Class of {profile.graduation_year || '2026'} • CSE</span>
                  </div>
                </div>

                {/* Footer metrics */}
                <div className="flex justify-between items-center text-[8px] font-bold text-slate-400 font-mono border-t border-slate-800/80 pt-3">
                  <div className="flex flex-col">
                    <span className="text-slate-500">SOLVED</span>
                    <span className="text-xs text-white font-black mt-0.5 font-sans">1,240</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-500">ACCURACY</span>
                    <span className="text-xs text-emerald-400 font-black mt-0.5 font-sans">88.5%</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-500">STREAK</span>
                    <span className="text-xs text-amber-500 font-black mt-0.5 font-sans">42 Days 🔥</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-slate-500">GLOBAL</span>
                    <span className="text-xs text-blue-400 font-black mt-0.5 font-sans">#1,402</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Actions triggers */}
            <div className="md:col-span-5 space-y-4">
              <p className="text-xs font-semibold text-slate-400 leading-relaxed">
                Render a shareable social card representing your solves progress, streak consistency, and college badges.
              </p>

              {!cardGenerated && !generatingCard ? (
                <button
                  onClick={handleGenerateCard}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 animate-bounce" />
                  <span>Generate Rank Card</span>
                </button>
              ) : generatingCard ? (
                <div className="w-full py-2.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center gap-2 text-[10px] font-bold text-slate-500 uppercase">
                  <div className="w-3.5 h-3.5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
                  <span>Compiling graphics...</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setCustomToast('Downloading Rank Card PNG... 📥');
                      setTimeout(() => setCustomToast(null), 2000);
                    }}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PNG</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`https://baseinstitute.com/profile/${usernameHandle}`);
                        setCustomToast('Profile Link copied! 🔗');
                        setTimeout(() => setCustomToast(null), 2000);
                      }}
                      className="py-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-850 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-black text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <LinkIcon className="w-3 h-3" />
                      <span>Copy Link</span>
                    </button>
                    <button
                      onClick={() => {
                        setCustomToast('Opened sharing configurations modal! 🌐');
                        setTimeout(() => setCustomToast(null), 2000);
                      }}
                      className="py-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-850 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-black text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Share2 className="w-3 h-3" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Right Column: Public Profile Controls Visibility (4 columns) */}
        <div className="lg:col-span-4 bg-slate-900/60 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-900 rounded-3xl p-5 md:p-6 backdrop-blur-md text-left space-y-4 select-none">
          
          <div>
            <h4 className="text-xs font-black uppercase text-slate-800 dark:text-white tracking-widest">Public Profile Visibility</h4>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Control recruiter and public access views.</p>
          </div>

          {/* Visibility selector options */}
          <div className="space-y-2">
            {[
              { id: 'public', label: 'Public Index', desc: 'Visible to everyone on the platform', icon: Eye },
              { id: 'recruiter', label: 'Recruiter Visible', desc: 'Allows hiring firms to download resume', icon: Briefcase },
              { id: 'friends', label: 'Friends Only', desc: 'Visible to teammates and leaderboard peers', icon: UserCheck },
              { id: 'private', label: 'Private Mode', desc: 'Visible only to you and administrators', icon: EyeOff }
            ].map((option) => {
              const active = visibility === option.id;
              const IconComp = option.icon;
              return (
                <button
                  key={option.id}
                  onClick={() => handleVisibilityChange(option.id as any)}
                  className={`w-full p-3 rounded-xl border text-left flex items-start gap-3 transition-all duration-200 cursor-pointer ${
                    active
                      ? 'border-blue-600 bg-blue-50/20 dark:border-blue-500 dark:bg-blue-950/20 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-blue-500/30 hover:bg-slate-50/50 dark:border-slate-900 dark:bg-slate-950/40'
                  }`}
                >
                  <IconComp className={`w-4 h-4 shrink-0 mt-0.5 ${active ? 'text-blue-500' : 'text-slate-400'}`} />
                  <div className="leading-tight">
                    <span className={`text-[11px] font-black uppercase ${active ? 'text-blue-600 dark:text-blue-400 font-extrabold' : 'text-slate-700 dark:text-slate-350'}`}>{option.label}</span>
                    <p className="text-[9.5px] font-semibold text-slate-400 mt-1">{option.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

        </div>

      </section>

      {/* SECTION 8: Personal credentials expand-collapse list */}
      <section className="bg-slate-900/60 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-900 rounded-3xl p-5 md:p-6 backdrop-blur-md text-left space-y-4">
        
        {/* Toggle header */}
        <button
          onClick={() => setIsFormExpanded(!isFormExpanded)}
          className="w-full flex items-center justify-between font-black uppercase text-xs text-slate-800 dark:text-white select-none cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-blue-500" />
            <span>Edit Credentials & Academic Information Form</span>
          </div>
          {isFormExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {/* Collapsible form area */}
        <AnimatePresence>
          {isFormExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden space-y-5"
            >
              <form onSubmit={handleProfileSave} className="pt-4 border-t border-slate-100 dark:border-slate-900 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block">Student Name</label>
                    <input
                      type="text"
                      value={profile.username}
                      onChange={e => setProfile({ ...profile, username: e.target.value })}
                      required
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  {/* College */}
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block">College Name</label>
                    <input
                      type="text"
                      value={profile.college}
                      onChange={e => setProfile({ ...profile, college: e.target.value })}
                      required
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  {/* Degree */}
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block">Degree</label>
                    <input
                      type="text"
                      value={profile.degree}
                      onChange={e => setProfile({ ...profile, degree: e.target.value })}
                      required
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  {/* Branch */}
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block">Branch</label>
                    <input
                      type="text"
                      value={profile.branch}
                      onChange={e => setProfile({ ...profile, branch: e.target.value })}
                      required
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  {/* Graduation Year */}
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block">Graduation Year</label>
                    <input
                      type="number"
                      value={profile.graduation_year}
                      onChange={e => setProfile({ ...profile, graduation_year: parseInt(e.target.value) || 2026 })}
                      required
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  {/* Goals */}
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block">Preparation Goal</label>
                    <select
                      value={profile.primary_goal}
                      onChange={e => setProfile({ ...profile, primary_goal: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-600"
                    >
                      <option value="Campus Placements">Campus Placements</option>
                      <option value="Government Exam Prep">Government Exam Prep</option>
                      <option value="Software Engineer Roles">Software Engineer Roles</option>
                      <option value="Higher Education Studies">Higher Education Studies</option>
                    </select>
                  </div>

                  {/* Commitment */}
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block">Weekly Commitment</label>
                    <select
                      value={profile.weekly_commitment}
                      onChange={e => setProfile({ ...profile, weekly_commitment: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-600"
                    >
                      <option value="3–5 Hours">3–5 Hours</option>
                      <option value="5–10 Hours">5–10 Hours</option>
                      <option value="10–20 Hours">10–20 Hours</option>
                      <option value="20+ Hours">20+ Hours</option>
                    </select>
                  </div>

                  {/* Learning Preference */}
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block">Learning Preference</label>
                    <select
                      value={profile.learning_preference}
                      onChange={e => setProfile({ ...profile, learning_preference: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-600"
                    >
                      <option value="Concept + Practice">Concept + Practice</option>
                      <option value="Simulated Mock Focus">Simulated Mock Focus</option>
                      <option value="Interactive Quick Solving">Interactive Quick Solving</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-900">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Credentials</span>
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

      </section>

      {/* Section 9 & 10: Progress timeline and Smart insights */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Progress Timeline (6 columns) */}
        <div className="lg:col-span-6 bg-slate-900/60 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-900 rounded-3xl p-6 backdrop-blur-md text-left space-y-5 select-none">
          
          <div>
            <h4 className="text-xs font-black uppercase text-slate-800 dark:text-white tracking-widest">Aptitude Progress Timeline</h4>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Chronological record of prep achievements and solved landmarks.</p>
          </div>

          <div className="relative pl-6 border-l border-slate-200 dark:border-slate-800 space-y-5 py-2">
            {[
              { milestone: 'First Aptitude Question Solved', date: 'Oct 02, 2023', achieved: true, tag: 'START' },
              { milestone: 'Reached Level 10 prep stage', date: 'Dec 12, 2023', achieved: true, tag: 'LEVEL' },
              { milestone: '7-Day Streak challenge unlocked', date: 'Feb 15, 2024', achieved: true, tag: 'STREAK' },
              { milestone: 'Entered Top 10,000 global ranking', date: 'Jun 20, 2024', achieved: true, tag: 'RANK' },
              { milestone: 'Solved 500 total questions milestone', date: 'Nov 04, 2025', achieved: true, tag: 'SOLVE' },
              { milestone: 'Earned Logic Legend prestige title', date: 'Jun 18, 2026', achieved: true, tag: 'PRESTIGE' }
            ].map((step, idx) => (
              <div key={idx} className="relative">
                {/* Node dot check */}
                <div className="absolute -left-9 top-0.5 w-6 h-6 rounded-full flex items-center justify-center border-2 border-blue-600 bg-blue-500 text-white shadow-xs">
                  <CheckCircle className="w-3.5 h-3.5 stroke-[3.5]" />
                </div>
                
                <div className="leading-tight text-left pl-1">
                  <div className="flex items-center gap-2">
                    <h5 className="text-xs font-black uppercase tracking-tight text-slate-800 dark:text-white">
                      {step.milestone}
                    </h5>
                    <span className="text-[8px] font-black font-mono bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 px-1.5 py-0.2 rounded uppercase tracking-wider">
                      {step.tag}
                    </span>
                  </div>
                  <span className="text-[9.5px] text-slate-400 dark:text-slate-500 font-semibold block mt-0.5">
                    Completed • {step.date}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Right Column: AI Smart Insights (6 columns) */}
        <div className="lg:col-span-6 bg-slate-900/60 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-900 rounded-3xl p-6 backdrop-blur-md text-left space-y-4 select-none">
          
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900 pb-3">
            <div>
              <h4 className="text-xs font-black uppercase text-slate-800 dark:text-white tracking-widest flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-blue-500" /> Smart Prep Insights
              </h4>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">AI-powered suggestions based on solves profile.</p>
            </div>
            <span className="text-[8px] font-mono font-bold text-slate-400">Agent: Antigravity</span>
          </div>

          <div className="space-y-3.5">
            {[
              { text: "Your Logical reasoning index is stronger than 87% of active placement students.", badge: "STRENGTH", color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" },
              { text: "Optimal Activity Peak: You consistently perform best with 94% accuracy between 7 PM and 10 PM.", badge: "PEAK TIME", color: "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400" },
              { text: "Improvement Target: Elevating Verbal Ability Accuracy by 8% would increase your global rank by 500+ positions.", badge: "RANK BOOSTER", color: "bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400" }
            ].map((insight, idx) => (
              <div key={idx} className="p-4 bg-slate-950/20 dark:bg-slate-900/25 border border-slate-200/50 dark:border-slate-850 rounded-2xl flex flex-col gap-2">
                <span className={`text-[8.5px] font-black font-mono border px-2 py-0.5 rounded-md w-max uppercase tracking-wider ${insight.color}`}>
                  {insight.badge}
                </span>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-350 leading-relaxed">
                  "{insight.text}"
                </p>
              </div>
            ))}
          </div>

        </div>

      </section>

    </div>
  );
}
