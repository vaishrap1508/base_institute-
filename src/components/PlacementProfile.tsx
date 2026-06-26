'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Edit3,
  X,
  Sun,
  Moon,
  Laptop,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { siteConfig } from '@/config/site';

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
  customColor: string;
  changeCustomColor: (color: string) => void;
  themeMode: 'light' | 'dark' | 'system';
  handleThemeChange: (mode: 'light' | 'dark' | 'system') => void;
}

export default function PlacementProfile({
  profile,
  setProfile,
  handleProfileSave,
  saveSuccess,
  setSaveSuccess,
  customColor,
  changeCustomColor,
  themeMode,
  handleThemeChange
}: PlacementProfileProps) {

  // Modals & Drawers States
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showRankCardModal, setShowRankCardModal] = useState(false);
  const [showAllAchievementsModal, setShowAllAchievementsModal] = useState(false);

  // Avatar Customization States
  const [selectedFrame, setSelectedFrame] = useState<string>('Gold Frame');
  const [selectedRankBorder, setSelectedRankBorder] = useState<string>('Diamond');
  const [selectedEffect, setSelectedEffect] = useState<string>('Electric Ring');

  // Interactive controls
  const [visibility, setVisibility] = useState<'public' | 'private' | 'recruiter' | 'friends'>('recruiter');
  const [generatingCard, setGeneratingCard] = useState<boolean>(false);
  const [cardGenerated, setCardGenerated] = useState<boolean>(false);
  const [customToast, setCustomToast] = useState<string | null>(null);
  const [rankCardType, setRankCardType] = useState<'LinkedIn' | 'WhatsApp' | 'Instagram' | 'Placement Resume'>('LinkedIn');

  // Active tooltip coordinate mapping for SVG components
  const [activeRadarTooltip, setActiveRadarTooltip] = useState<{ x: number; y: number; label: string; val: number } | null>(null);
  const [activeHeatmapTooltip, setActiveHeatmapTooltip] = useState<{ 
    x: number; 
    y: number; 
    date: string; 
    solves: number; 
    acc: number;
    topics: string[];
    timeSpent: string;
  } | null>(null);

  const changeCustomColorLocal = (color: string) => {
    changeCustomColor(color);
    if (typeof window !== 'undefined') {
      if (color === 'default') {
        setCustomToast(`Default layout theme restored! 🎨`);
      } else {
        setCustomToast(`Theme color updated successfully! 🎨`);
      }
    }
    setTimeout(() => setCustomToast(null), 2000);
  };

  // Generate username handle from student name
  const usernameHandle = useMemo(() => {
    if (!profile.username) return 'student';
    return profile.username.toLowerCase().replace(/\s+/g, '_');
  }, [profile.username]);

  // Collateral Frames & Rank configurations
  const framesList = ['None', 'Bronze Frame', 'Silver Frame', 'Gold Frame', 'Platinum Frame', 'Neon Frame'];
  const rankBordersList = ['Bronze', 'Silver', 'Gold', 'Diamond', 'Top 100'];
  const effectsList = ['None', 'Floating Particles', 'Fire Aura', 'Electric Ring', 'Cosmic Glow', 'Diamond Sparkle'];

  // Preset style mapping helper
  const stylePreset = useMemo(() => {
    return {
      cardBg: 'bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-900 shadow-sm',
      accentText: 'text-[var(--clr-primary)]',
      accentTextSub: 'opacity-85 text-[var(--clr-primary)]',
      accentBtn: 'bg-[var(--clr-primary)] hover:bg-[var(--clr-primary-dark)] text-white shadow-lg border-transparent transition-all',
      meshGradient: 'from-[var(--clr-primary)]/5 via-transparent to-[var(--clr-primary)]/5',
      dividerClass: 'border-slate-200/50 dark:border-slate-800/60',
      iconColor: 'text-[var(--clr-primary)]',
      badgeColor: 'bg-[var(--clr-primary)]/10 text-[var(--clr-primary)] border-[var(--clr-primary)]/20'
    };
  }, []);

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

  // Consistency activity heatmap generator with detailed tooltips
  const heatmapSolves = useMemo(() => {
    const data = [];
    const date = new Date();
    date.setDate(date.getDate() - 370);

    const topicsList = ['Arithmetic', 'Time & Work', 'Percentages', 'Ratios', 'Probability', 'Permutations', 'Logarithms', 'Data Interpretation'];

    for (let i = 0; i < 371; i++) {
      const dayOfWeek = date.getDay();
      const monthLabel = date.toLocaleString('default', { month: 'short' });
      
      const seed = Math.random();
      let solves = 0;
      let accuracy = 0;
      
      if (seed > 0.45) {
        solves = Math.floor(Math.random() * 4) + 1;
        accuracy = Math.floor(Math.random() * 20) + 80;
      }
      if (seed > 0.88) {
        solves = Math.floor(Math.random() * 7) + 5;
        accuracy = Math.floor(Math.random() * 15) + 85;
      }

      // Simulate random topics and time spent
      const topics: string[] = [];
      if (solves > 0) {
        const numTopics = Math.floor(Math.random() * 3) + 1;
        for (let t = 0; t < numTopics; t++) {
          const randomTopic = topicsList[Math.floor(Math.random() * topicsList.length)];
          if (!topics.includes(randomTopic)) topics.push(randomTopic);
        }
      }
      const timeSpent = solves > 0 ? `${solves * (Math.floor(Math.random() * 4) + 7)}m` : '0m';

      data.push({
        index: i,
        day: dayOfWeek,
        month: monthLabel,
        dateStr: date.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' }),
        solves,
        accuracy,
        topics,
        timeSpent
      });

      date.setDate(date.getDate() + 1);
    }
    return data;
  }, []);

  const handleVisibilityChange = (mode: 'public' | 'private' | 'recruiter' | 'friends') => {
    setVisibility(mode);
    setCustomToast(`Visibility updated to ${mode.toUpperCase()}! 🛡️`);
    setTimeout(() => setCustomToast(null), 2500);
  };

  const handleGenerateCard = () => {
    setGeneratingCard(true);
    setTimeout(() => {
      setGeneratingCard(false);
      setCardGenerated(true);
      setCustomToast('Placement Resume Card Generated! 🚀');
      setTimeout(() => setCustomToast(null), 2500);
    }, 1200);
  };

  // Pre-configured achievements with Rarity & Progress bars
  const achievements = useMemo(() => [
    { id: 'p1', title: 'TCS Crusher', req: 'Solve 50 TCS level practice sets', category: 'placement', icon: '💻', unlocked: true, rarity: 'Common', currentProgress: 50, targetProgress: 50 },
    { id: 'p2', title: 'Infosys Champion', req: 'Unlock 8 Infosys test sets', category: 'placement', icon: '🛡️', unlocked: true, rarity: 'Rare', currentProgress: 8, targetProgress: 8 },
    { id: 'p3', title: 'Amazon Tag Master', req: 'Solve 15 Amazon tagged hard items', category: 'placement', icon: '📦', unlocked: false, rarity: 'Epic', currentProgress: 11, targetProgress: 15 },
    { id: 'p4', title: 'Accenture Expert', req: 'Attain 90% accuracy in Accenture mocks', category: 'placement', icon: '💎', unlocked: false, rarity: 'Legendary', currentProgress: 86, targetProgress: 90 },
    { id: 'c1', title: '7 Day Streak', req: 'Practice 7 days consecutively', category: 'consistency', icon: '🔥', unlocked: true, rarity: 'Common', currentProgress: 7, targetProgress: 7 },
    { id: 'c2', title: '30 Day Streak', req: 'Practice 30 days consecutively', category: 'consistency', icon: '⚡', unlocked: true, rarity: 'Rare', currentProgress: 30, targetProgress: 30 },
    { id: 'c3', title: '100 Day Streak', req: 'Practice 100 days consecutively', category: 'consistency', icon: '🌟', unlocked: false, rarity: 'Epic', currentProgress: 42, targetProgress: 100 },
    { id: 'c4', title: '365 Day Warrior', req: 'Maintain consistent learning for 365 days', category: 'consistency', icon: '🎖️', unlocked: false, rarity: 'Mythic', currentProgress: 42, targetProgress: 365 },
    { id: 'l1', title: 'Arithmetic Apprentice', req: 'Solve 20 Arithmetic questions', category: 'learning', icon: '📐', unlocked: true, rarity: 'Common', currentProgress: 20, targetProgress: 20 },
    { id: 'l2', title: 'Ratio Master', req: 'Attain 100% ratios solving speed', category: 'learning', icon: '🧩', unlocked: true, rarity: 'Rare', currentProgress: 100, targetProgress: 100 },
    { id: 'l3', title: 'Geometry Ninja', req: 'Complete 30 geometry sets', category: 'learning', icon: '🎯', unlocked: false, rarity: 'Epic', currentProgress: 12, targetProgress: 30 },
    { id: 'l4', title: 'Logic Legend', req: 'Reach Level 25 in Logical puzzles', category: 'learning', icon: '👑', unlocked: true, rarity: 'Legendary', currentProgress: 27, targetProgress: 25 }
  ], []);

  const getRarityStyle = (rarity: string) => {
    switch (rarity) {
      case 'Rare': return 'bg-blue-500/10 text-blue-500 dark:text-blue-400 border-blue-500/30';
      case 'Epic': return 'bg-purple-500/10 text-purple-500 dark:text-purple-400 border-purple-500/30';
      case 'Legendary': return 'bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/30';
      case 'Mythic': return 'bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/30 animate-pulse';
      case 'Common':
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-350/30';
    }
  };

  const getAvatarStyles = () => {
    let frameClass = '';
    let rankBorderClass = '';
    let effectGlow = '';

    if (selectedFrame === 'Bronze Frame') frameClass = 'ring-4 ring-[#CD7F32] shadow-lg';
    if (selectedFrame === 'Silver Frame') frameClass = 'ring-4 ring-[#C0C0C0] shadow-lg';
    if (selectedFrame === 'Gold Frame') frameClass = 'ring-4 ring-[#FFD700] shadow-[0_0_15px_rgba(255,215,0,0.4)]';
    if (selectedFrame === 'Platinum Frame') frameClass = 'ring-4 ring-[#E5E4E2] shadow-[0_0_15px_rgba(229,228,226,0.3)]';
    if (selectedFrame === 'Neon Frame') frameClass = 'ring-4 ring-[#00F3FF] shadow-[0_0_20px_rgba(0,243,255,0.5)] animate-pulse';

    if (selectedRankBorder === 'Bronze') rankBorderClass = 'border-4 border-[#CD7F32] rounded-3xl';
    if (selectedRankBorder === 'Silver') rankBorderClass = 'border-4 border-[#C0C0C0] rounded-3xl';
    if (selectedRankBorder === 'Gold') rankBorderClass = 'border-4 border-[#FFD700] rounded-3xl';
    if (selectedRankBorder === 'Diamond') rankBorderClass = 'border-4 border-blue-600 dark:border-blue-500 rounded-3xl';
    if (selectedRankBorder === 'Top 100') rankBorderClass = 'border-4 border-dashed border-red-500 rounded-3xl animate-spin-slow';

    if (selectedEffect === 'Floating Particles') effectGlow = 'shadow-[0_0_25px_rgba(245,158,11,0.25)]';
    if (selectedEffect === 'Fire Aura') effectGlow = 'shadow-[0_0_30px_rgba(239,68,68,0.5)]';
    if (selectedEffect === 'Electric Ring') effectGlow = 'shadow-[0_0_30px_rgba(59,130,246,0.5)]';
    if (selectedEffect === 'Cosmic Glow') effectGlow = 'shadow-[0_0_35px_rgba(139,92,246,0.5)]';
    if (selectedEffect === 'Diamond Sparkle') effectGlow = 'shadow-[0_0_25px_rgba(16,185,129,0.35)]';

    return { frameClass, rankBorderClass, effectGlow };
  };

  const { frameClass, rankBorderClass, effectGlow } = getAvatarStyles();

  // Save actions mapping
  const onSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    handleProfileSave(e);
    setShowEditProfileModal(false);
  };

  return (
    <div className="w-full relative text-slate-800 dark:text-slate-100 space-y-8 select-text transition-colors duration-300">
      
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

      {/* SECTION 1: Identity Hero Card (Polished, settings relocated) */}
      <section className={`${stylePreset.cardBg} rounded-3xl p-6 md:p-8 backdrop-blur-md relative overflow-hidden flex flex-col lg:flex-row items-center lg:items-start gap-8`}>
        
        {/* Visual mesh gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-tr ${stylePreset.meshGradient} pointer-events-none opacity-40`} />

        {/* Customizable Avatar Frame container */}
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

              {/* Floating micro particles */}
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

          {/* Level badge */}
          <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-600 to-indigo-600 border border-blue-400 text-white font-mono text-[10.5px] font-black px-2.5 py-1 rounded-full shadow-lg">
            LVL 27
          </div>
        </div>

        {/* Identity Details */}
        <div className="flex-1 space-y-4 text-center lg:text-left w-full z-10">
          <div className="space-y-1.5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 justify-center lg:justify-start">
              <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">
                {profile.username || 'Vaishnavi Raparthy'}
              </h2>
              <div className="self-center flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider select-none">
                <CheckCircle className="w-3 h-3" /> Verified Student
              </div>
            </div>
            
            <p className="text-xs text-slate-400 dark:text-slate-500 font-mono">
              @{usernameHandle}
            </p>
            
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 leading-normal">
              {profile.branch || 'Computer Science Engineering'} • Class of {profile.graduation_year || '2026'}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">{profile.college || 'Vellore Institute of Technology'}</p>
          </div>

          {/* Level Progress */}
          <div className="space-y-2 max-w-sm mx-auto lg:mx-0 text-left select-none">
            <div className="flex justify-between items-end text-[10px] font-bold text-slate-500 font-mono uppercase">
              <span>Title: <strong className={`${stylePreset.accentText} font-black`}>Logic Legend</strong></span>
              <span>2,740 / 3,000 XP</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 h-2.5 rounded-full overflow-hidden p-0.5">
              <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 h-full rounded-full shadow-[0_0_8px_rgba(59,130,246,0.3)]" style={{ width: '91%' }} />
            </div>
          </div>

          {/* Quick Actions Deck */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-2 select-none">
            <button
              onClick={() => setShowCustomizeModal(true)}
              className="py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-[10.5px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-350 cursor-pointer transition-colors"
            >
              🎨 Customize Style
            </button>
            <button
              onClick={() => setShowEditProfileModal(true)}
              className="py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-[10.5px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-350 cursor-pointer transition-colors"
            >
              📝 Edit Profile
            </button>
            <button
              onClick={() => setShowPrivacyModal(true)}
              className="py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-[10.5px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-350 cursor-pointer transition-colors"
            >
              🛡️ Visibility Settings
            </button>
            <button
              onClick={() => setShowRankCardModal(true)}
              className={`py-1.5 px-3 rounded-xl text-[10.5px] font-black uppercase tracking-wider cursor-pointer transition-all ${stylePreset.accentBtn}`}
            >
              🏆 Generate Rank Card
            </button>
          </div>
        </div>

        {/* SIDE PANELS: Current Rank Tier & Styling Preset Card */}
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto shrink-0 select-none z-10">
          {/* Current Rank Tier Card */}
          <div className={`${stylePreset.cardBg} rounded-2xl p-5 md:p-6 flex flex-col justify-between w-full sm:w-60 min-h-[170px] text-left`}>
            <div className="space-y-1.5">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Aptitude Rank</span>
              <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-wide uppercase">Gold III</h4>
              <span className="text-xs font-bold text-slate-400 font-mono">Top 12% global tier</span>
            </div>
            
            <div className="space-y-2 pt-4">
              <div className="flex justify-between items-center text-[10px] font-bold font-mono text-slate-500 uppercase">
                <span>To Gold IV</span>
                <span>260 XP Needed</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-950 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '45%' }} />
              </div>
            </div>
          </div>

          {/* Preset selector panel & Mode Toggles */}
          <div className={`${stylePreset.cardBg} rounded-2xl p-5 md:p-6 flex flex-col justify-between w-full sm:w-60 min-h-[170px] gap-6`}>
            {/* Custom Brand Color Palette */}
            <div className="space-y-2.5 text-left">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">COLOR PALETTE</span>
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { name: 'Default', hex: 'default', bg: 'bg-gradient-to-tr from-blue-500 via-purple-500 to-emerald-500 border-slate-350 dark:border-slate-700' },
                  { name: 'Indigo', hex: '#6366F1', bg: 'bg-[#6366F1] border-indigo-300' },
                  { name: 'Purple', hex: '#8B5CF6', bg: 'bg-[#8B5CF6] border-purple-300' },
                  { name: 'Rose', hex: '#F43F5E', bg: 'bg-[#F43F5E] border-rose-300' },
                  { name: 'Amber', hex: '#F59E0B', bg: 'bg-[#F59E0B] border-amber-300' },
                  { name: 'Emerald', hex: '#10B981', bg: 'bg-[#10B981] border-emerald-300' }
                ].map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => changeCustomColorLocal(preset.hex)}
                    className={`w-6.5 h-6.5 rounded-full cursor-pointer transition-all border ${preset.bg} ${customColor === preset.hex ? 'scale-120 ring-2 ring-white/40 shadow-md' : 'opacity-75 hover:opacity-100'}`}
                    title={preset.name}
                  />
                ))}
                
                {/* Custom Color Picker Swatch */}
                <div className="relative w-6.5 h-6.5 rounded-full overflow-hidden border border-slate-350 dark:border-slate-700 bg-gradient-to-tr from-pink-500 via-purple-500 to-blue-500 cursor-pointer hover:scale-110 active:scale-95 transition-all shadow-xs flex items-center justify-center" title="Choose custom color">
                  <span className="text-[10px] text-white font-black select-none pointer-events-none">+</span>
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => changeCustomColorLocal(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </div>
              </div>
            </div>

            {/* Dark/Light mode switch */}
            <div className="space-y-2.5 text-left">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Viewport Mode</span>
              <div className="grid grid-cols-3 gap-1 bg-slate-50 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200/50 dark:border-slate-900">
                {[
                  { id: 'light', icon: Sun, label: 'Light' },
                  { id: 'dark', icon: Moon, label: 'Dark' },
                  { id: 'system', icon: Laptop, label: 'Sys' }
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = themeMode === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleThemeChange(item.id as any)}
                      className={`py-2 px-1 flex items-center justify-center rounded-lg cursor-pointer transition-all duration-300 ${isActive 
                        ? 'bg-white dark:bg-slate-800 text-[var(--clr-primary)] shadow-md'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-900/50'
                      }`}
                      title={item.label}
                    >
                      <Icon className={`w-5.5 h-5.5 transition-transform duration-300 ${isActive ? 'scale-110 stroke-[2.5]' : 'stroke-[2]'}`} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* NEW SECTION: Company Matches & Weekly Performance Widget */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 select-none">
        {/* Left Card: Company Matches (7 columns) */}
        <div className={`${stylePreset.cardBg} lg:col-span-7 rounded-3xl p-6 backdrop-blur-md text-left flex flex-col justify-between space-y-6`}>
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Best Company Matches</h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Estimated placement readiness based on curriculum domains scores.</p>
          </div>

          <div className="space-y-3.5">
            {[
              { company: 'TCS', percent: 94, color: 'bg-emerald-500' },
              { company: 'Infosys', percent: 89, color: 'bg-blue-500' },
              { company: 'Accenture', percent: 86, color: 'bg-indigo-500' },
              { company: 'Amazon', percent: 61, color: 'bg-amber-500' },
              { company: 'Google', percent: 44, color: 'bg-rose-500' }
            ].map((match) => (
              <div key={match.company} className="space-y-1">
                <div className="flex justify-between items-center text-[10.5px] font-bold font-mono">
                  <span className="text-slate-700 dark:text-slate-350">{match.company}</span>
                  <span className="text-slate-800 dark:text-white font-extrabold">{match.percent}% Match</span>
                </div>
                <div className="w-full bg-slate-50 dark:bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-100 dark:border-slate-900">
                  <div className={`h-full rounded-full ${match.color}`} style={{ width: `${match.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Card: Weekly Performance Widget (5 columns) */}
        <div className={`${stylePreset.cardBg} lg:col-span-5 rounded-3xl p-6 backdrop-blur-md text-left flex flex-col justify-between space-y-6`}>
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">This Week</h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Short-term prep activity and motivation landmarks.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-950/40 p-4 border border-slate-200/50 dark:border-slate-900 rounded-2xl text-left relative overflow-hidden">
              <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Questions Solved</span>
              <span className="text-2xl font-black font-mono text-slate-950 dark:text-white block mt-2">47</span>
              <span className="text-[8.5px] font-bold text-emerald-500 font-mono block mt-1">+12% vs last week</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/40 p-4 border border-slate-200/50 dark:border-slate-900 rounded-2xl text-left">
              <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Weekly Accuracy</span>
              <span className="text-2xl font-black font-mono text-emerald-500 block mt-2">91%</span>
              <span className="text-[8.5px] font-bold text-emerald-600 dark:text-emerald-400 font-mono block mt-1">Excellent tier</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/40 p-4 border border-slate-200/50 dark:border-slate-900 rounded-2xl text-left">
              <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Rank Shift</span>
              <span className="text-2xl font-black font-mono text-blue-500 block mt-2">+123</span>
              <span className="text-[8.5px] font-bold text-slate-400 font-mono block mt-1">Global ranking jump</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/40 p-4 border border-slate-200/50 dark:border-slate-900 rounded-2xl text-left">
              <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">XP Earned</span>
              <span className="text-2xl font-black font-mono text-purple-400 block mt-2">640</span>
              <span className="text-[8.5px] font-bold text-purple-600 dark:text-purple-400 font-mono block mt-1">Goal 500 XP met</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-900 flex justify-between text-[8px] font-bold text-slate-500 font-mono uppercase">
            <span>2 Mocks Completed</span>
            <span>Streak Maintained</span>
          </div>
        </div>
      </section>

      {/* SECTION 2: Restructured KPI Section (Hierarchy Created) */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-6 select-none">
        
        {/* PRIMARY CARD 1: Placement Readiness Index */}
        <div className={`${stylePreset.cardBg} md:col-span-4 rounded-3xl p-5 md:p-6 text-left relative overflow-hidden group hover:translate-y-[-2px] hover:shadow-md transition-all duration-200`}>
          <div className="absolute top-0 right-0 w-2 h-full bg-[#10B981]" />
          <span className="text-[8.5px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Overall Readiness</span>
          
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-slate-950 dark:text-white">79.6%</span>
            <span className="text-[9.5px] font-bold text-slate-400 uppercase font-mono">Index Score</span>
          </div>

          <div className="mt-4 space-y-1.5">
            <div className="w-full bg-slate-100 dark:bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-200/20 dark:border-slate-900">
              <div className="bg-[#10B981] h-full rounded-full" style={{ width: '79.6%' }} />
            </div>
            <div className="flex justify-between text-[8px] font-bold text-slate-400 font-mono uppercase">
              <span>Verified Index</span>
              <span>Top Academic Match</span>
            </div>
          </div>
        </div>

        {/* PRIMARY CARD 2: Global Rank */}
        <div className={`${stylePreset.cardBg} md:col-span-4 rounded-3xl p-5 md:p-6 text-left relative overflow-hidden group hover:translate-y-[-2px] hover:shadow-md transition-all duration-200`}>
          <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-purple-500 to-pink-500" />
          <span className="text-[8.5px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Global Ranking</span>
          
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-black font-mono text-slate-950 dark:text-white">#1,402</span>
            <span className="text-[9px] font-black bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider inline-block">Top 12%</span>
          </div>

          <p className="text-[9.5px] font-semibold text-slate-400 mt-5 leading-normal block">
            Ranked out of 11,540 active students inside the placement dashboard.
          </p>
        </div>

        {/* PRIMARY CARD 3: Daily Streak */}
        <div className={`${stylePreset.cardBg} md:col-span-4 rounded-3xl p-5 md:p-6 text-left relative overflow-hidden group hover:translate-y-[-2px] hover:shadow-md transition-all duration-200 flex flex-col justify-between`}>
          <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-amber-500 to-orange-500" />
          
          <div>
            <span className="text-[8.5px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Daily Streak</span>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-3xl font-black font-mono text-slate-950 dark:text-white">42 Days</span>
              <Flame className="w-6.5 h-6.5 text-amber-500 fill-current animate-pulse" />
            </div>
          </div>
          
          <span className="text-[9.5px] font-bold text-slate-400 font-mono block mt-4">Personal Best Record: 75 Days</span>
        </div>

        {/* SECONDARY CARD 1: Accuracy (Smaller visual weight) */}
        <div className={`${stylePreset.cardBg} md:col-span-6 rounded-2xl p-4 text-left flex items-center justify-between hover:border-slate-350 dark:hover:border-slate-700 transition-colors`}>
          <div className="space-y-1">
            <span className="text-[8.5px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Accuracy Rate</span>
            <span className="text-2xl font-black font-mono text-slate-950 dark:text-white">88.5%</span>
          </div>
          <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider font-mono bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg">+1.4% this week</span>
        </div>

        {/* SECONDARY CARD 2: Total Solved */}
        <div className={`${stylePreset.cardBg} md:col-span-6 rounded-2xl p-4 text-left flex items-center justify-between hover:border-slate-350 dark:hover:border-slate-700 transition-colors`}>
          <div className="space-y-1">
            <span className="text-[8.5px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Total Solved</span>
            <span className="text-2xl font-black font-mono text-slate-950 dark:text-white">1,240 <span className="text-xs text-slate-400 font-bold font-sans">/ 10k</span></span>
          </div>
          <div className="w-24 text-right space-y-1">
            <div className="w-full bg-slate-100 dark:bg-slate-950 h-1 rounded-full overflow-hidden border border-slate-200/20 dark:border-slate-800">
              <div className="bg-blue-500 h-full rounded-full" style={{ width: '12.4%' }} />
            </div>
            <span className="text-[8px] font-bold text-slate-400 font-mono block">12.4% COMPLETE</span>
          </div>
        </div>

      </section>

      {/* Main Charts & Consistency layout section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Placement Radar chart + Skill progress bars (5 columns) */}
        <div className={`${stylePreset.cardBg} lg:col-span-5 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden min-h-[360px] flex flex-col justify-between select-none`}>
          
          <div className="text-left space-y-0.5">
            <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-widest">Placement Readiness Radar</h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">Your strengths across aptitude domains</p>
          </div>

          {/* SVG Radar Chart */}
          <div className="relative w-full flex items-center justify-center py-4">
            <svg width="260" height="260" className="overflow-visible">
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

              {(() => {
                const pointsStr = radarPoints.map(pt => `${pt.x},${pt.y}`).join(' ');
                const radarColor = customColor === 'default' ? '#7075F4' : customColor;
                return (
                  <polygon
                    points={pointsStr}
                    fill={customColor === 'default' ? 'rgba(112, 117, 244, 0.18)' : `${customColor}2e`}
                    stroke={radarColor}
                    strokeWidth="2.5"
                    className="transition-all duration-300"
                  />
                );
              })()}

              {radarPoints.map((pt, idx) => (
                <g key={idx}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="4.5"
                    fill={customColor === 'default' ? '#7075F4' : customColor}
                    stroke="#030712"
                    strokeWidth="2"
                    className="cursor-pointer hover:r-6 transition-all"
                    onMouseEnter={(e) => {
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
              ))}

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

            {activeRadarTooltip && (
              <div 
                className="absolute z-20 px-2.5 py-1.5 bg-slate-900 border border-slate-800 text-white rounded-xl text-[9px] font-bold flex flex-col pointer-events-none shadow-md"
                style={{ left: `${activeRadarTooltip.x - 40}px`, top: `${activeRadarTooltip.y - 30}px` }}
              >
                <span className="text-slate-400 font-semibold">{activeRadarTooltip.label}</span>
                <span className="font-mono text-blue-400 mt-0.5 font-bold">Strength: {activeRadarTooltip.val}%</span>
              </div>
            )}
          </div>

          {/* Supporting Skill Bars underneath Radar */}
          <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-900">
            {[
              { label: 'Quantitative Aptitude', percent: 82, color: 'bg-blue-500' },
              { label: 'Logical Reasoning', percent: 91, color: 'bg-purple-500' },
              { label: 'Verbal Ability', percent: 63, color: 'bg-rose-500' },
              { label: 'Solving Speed', percent: 74, color: 'bg-amber-500' },
              { label: 'Accuracy Rating', percent: 88, color: 'bg-emerald-500' }
            ].map((bar) => (
              <div key={bar.label} className="space-y-1 text-left">
                <div className="flex justify-between items-center text-[9.5px] font-extrabold uppercase font-mono tracking-wide text-slate-500 dark:text-slate-400">
                  <span>{bar.label}</span>
                  <span className="text-slate-800 dark:text-white font-black">{bar.percent}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-950 h-1 rounded-full overflow-hidden border border-slate-200/10 dark:border-slate-900">
                  <div className={`h-full rounded-full ${bar.color}`} style={{ width: `${bar.percent}%` }} />
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Right Column: Consistency Heatmap Grid (7 columns) */}
        <div className={`${stylePreset.cardBg} lg:col-span-7 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden select-none space-y-5`}>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
            <div>
              <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-widest">Consistency Tracker</h4>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">365-day commitment to learning & problem solving</p>
            </div>
            
            <div className="flex items-center gap-1.5 text-[8.5px] font-bold text-slate-400 font-mono uppercase">
              <span>Less</span>
              <div className="w-2.5 h-2.5 bg-slate-100 dark:bg-slate-950 rounded-xs border border-slate-250 dark:border-slate-800" />
              <div className="w-2.5 h-2.5 bg-blue-900/20 rounded-xs border border-blue-900/10" />
              <div className="w-2.5 h-2.5 bg-blue-500/30 rounded-xs border border-blue-500/20" />
              <div className="w-2.5 h-2.5 bg-blue-600 rounded-xs border border-blue-500" />
              <span>More</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-left bg-slate-50 dark:bg-slate-950/20 p-3 rounded-2xl border border-slate-200/50 dark:border-slate-900">
            <div>
              <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Active Streak</span>
              <span className="text-sm font-mono font-black text-slate-900 dark:text-white mt-1 block">42 Days 🔥</span>
            </div>
            <div>
              <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Longest Streak</span>
              <span className="text-sm font-mono font-black text-slate-900 dark:text-white mt-1 block">75 Days</span>
            </div>
            <div>
              <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Solved Monthly</span>
              <span className="text-sm font-mono font-black text-slate-900 dark:text-white mt-1 block">184 Sets</span>
            </div>
          </div>

          {/* Heatmap Grid */}
          <div className="relative w-full overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 scrollbar-track-transparent">
            <div className="relative" style={{ width: '660px', height: '110px' }}>
              <svg width="660" height="98" className="overflow-visible">
                {Array.from({ length: 53 }).map((_, colIdx) => {
                  return Array.from({ length: 7 }).map((_, rowIdx) => {
                    const blockIdx = colIdx * 7 + rowIdx;
                    const cell = heatmapSolves[blockIdx];
                    if (!cell) return null;

                    let color = 'rgba(241,245,249,0.03)';
                    let border = 'rgba(241,245,249,0.06)';
                    if (cell.solves > 0) {
                      color = 'rgba(29, 78, 216, 0.15)';
                      border = 'rgba(59, 130, 246, 0.15)';
                    }
                    if (cell.solves >= 3) {
                      color = 'rgba(59, 130, 246, 0.45)';
                      border = 'rgba(59, 130, 246, 0.35)';
                    }
                    if (cell.solves >= 6) {
                      color = '#2563eb';
                      border = '#3B82F6';
                    }

                    // Dynamic custom color theme mapping for heatmap colors
                    if (cell.solves > 0) {
                      color = cell.solves >= 6 ? customColor : cell.solves >= 3 ? `${customColor}80` : `${customColor}20`;
                      border = cell.solves >= 6 ? customColor : `${customColor}40`;
                    }

                    if (document.documentElement.classList.contains('dark') === false && cell.solves === 0) {
                      color = 'rgba(15,23,42,0.03)';
                      border = 'rgba(15,23,42,0.06)';
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
                        className="cursor-pointer transition-all hover:stroke-blue-500/80"
                        onMouseEnter={(e) => {
                          setActiveHeatmapTooltip({
                            x: x,
                            y: y - 10,
                            date: cell.dateStr,
                            solves: cell.solves,
                            acc: cell.accuracy,
                            topics: cell.topics,
                            timeSpent: cell.timeSpent
                          });
                        }}
                        onMouseLeave={() => setActiveHeatmapTooltip(null)}
                      />
                    );
                  });
                })}

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

              {/* Rich Heatmap Tooltip */}
              {activeHeatmapTooltip && (
                <div 
                  className="absolute z-20 px-3 py-2 bg-slate-950/95 dark:bg-slate-900/95 border border-slate-800 text-white rounded-xl text-[10.5px] font-bold flex flex-col pointer-events-none shadow-xl min-w-44 text-left"
                  style={{ left: `${activeHeatmapTooltip.x - 70}px`, top: `${activeHeatmapTooltip.y - 74}px` }}
                >
                  <span className="text-slate-400 font-extrabold text-[9.5px] tracking-wide block border-b border-slate-800 pb-1">{activeHeatmapTooltip.date}</span>
                  {activeHeatmapTooltip.solves > 0 ? (
                    <div className="space-y-1 mt-1 leading-normal">
                      <div className="flex justify-between font-mono">
                        <span>Solved:</span>
                        <span className="text-blue-400 font-black">{activeHeatmapTooltip.solves} Qs</span>
                      </div>
                      <div className="flex justify-between font-mono">
                        <span>Accuracy:</span>
                        <span className="text-emerald-400 font-black">{activeHeatmapTooltip.acc}%</span>
                      </div>
                      <div className="flex justify-between font-mono">
                        <span>Duration:</span>
                        <span className="text-amber-400 font-black">{activeHeatmapTooltip.timeSpent}</span>
                      </div>
                      <div className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold pt-1 border-t border-slate-800">
                        Topics: {activeHeatmapTooltip.topics.join(', ')}
                      </div>
                    </div>
                  ) : (
                    <span className="italic text-slate-500 font-mono mt-1 text-[9.5px]">No activity commits</span>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>

      </section>

      {/* LOWER SECTION: Achievements & Recent Activity */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 select-none">
        
        {/* Left Column: Trophy Case (7 columns) */}
        <div className={`${stylePreset.cardBg} lg:col-span-7 rounded-3xl p-6 backdrop-blur-md text-left flex flex-col justify-between space-y-5`}>
          
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900 pb-3">
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Placement Achievements</h4>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Top unlocked badges and locked milestones progress.</p>
            </div>
            
            <button 
              onClick={() => setShowAllAchievementsModal(true)}
              className="py-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-[9.5px] font-black uppercase text-slate-600 dark:text-slate-350 cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {achievements.filter((_, idx) => idx < 6).map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all relative overflow-hidden group ${
                  item.unlocked
                    ? 'bg-slate-50/50 dark:bg-slate-950/20 border-slate-200 dark:border-slate-800 hover:border-blue-500/55'
                    : 'bg-slate-100/30 dark:bg-slate-950/5 border-slate-200/40 dark:border-slate-900 opacity-60'
                }`}
              >
                {/* Big emoji icon */}
                <div className="text-2xl pt-0.5 shrink-0 group-hover:scale-105 transition-transform">
                  {item.icon}
                </div>

                <div className="flex-1 space-y-1 text-left min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h5 className="text-[10.5px] font-black uppercase text-slate-800 dark:text-white tracking-wide truncate">
                      {item.title}
                    </h5>
                    <span className={`text-[7.5px] font-extrabold px-1.5 py-0.2 rounded border font-mono uppercase shrink-0 ${getRarityStyle(item.rarity)}`}>
                      {item.rarity}
                    </span>
                  </div>

                  <p className="text-[9.5px] font-semibold text-slate-400 dark:text-slate-500 leading-tight">
                    {item.req}
                  </p>

                  <div className="pt-1.5 space-y-1">
                    <div className="flex justify-between text-[8px] font-mono font-bold text-slate-400 uppercase">
                      <span>Progress</span>
                      <span>{item.currentProgress} / {item.targetProgress}</span>
                    </div>
                    <div className="w-full bg-slate-200/50 dark:bg-slate-950 h-1 rounded-full overflow-hidden border border-slate-200/10 dark:border-slate-900">
                      <div className={`h-full rounded-full ${item.unlocked ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${(item.currentProgress / item.targetProgress) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Right Column: Recent Activity Feed (5 columns) */}
        <div className={`${stylePreset.cardBg} lg:col-span-5 rounded-3xl p-6 backdrop-blur-md text-left flex flex-col justify-between space-y-5`}>
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Recent Activity</h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Real-time log of solved commits and dashboard triggers.</p>
          </div>

          <div className="space-y-3.5 pl-1.5 relative border-l border-slate-100 dark:border-slate-900 py-1">
            {[
              { text: "Solved Percentages #842", time: "2 hours ago", icon: "✓" },
              { text: "Earned 30 Day Streak Achievement", time: "1 day ago", icon: "✓" },
              { text: "Added Revision Note on Time & Work", time: "2 days ago", icon: "✓" },
              { text: "Completed TCS Placement Mock #12", time: "3 days ago", icon: "✓" },
              { text: "Reached Top 15% Global Ranking", time: "4 days ago", icon: "✓" },
              { text: "Prestige Title Logic Legend unlocked", time: "5 days ago", icon: "✓" }
            ].map((act, index) => (
              <div key={index} className="relative pl-4 text-left leading-none">
                {/* Check dot */}
                <div className={`absolute -left-[10px] top-0 w-4 h-4 rounded-full border flex items-center justify-center text-[7.5px] font-black text-white ${
                  index === 0 ? 'bg-emerald-500 border-emerald-400' : 'bg-slate-200 dark:bg-slate-800 border-slate-350 dark:border-slate-700 text-slate-400 dark:text-slate-500'
                }`}>
                  {act.icon}
                </div>
                
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block leading-tight">{act.text}</span>
                <span className="text-[8.5px] text-slate-400 dark:text-slate-500 font-semibold block mt-0.5">{act.time}</span>
              </div>
            ))}
          </div>

        </div>

      </section>

      {/* PROGRESS TIMELINE & SMART INSIGHTS */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Progress Timeline (6 columns) */}
        <div className={`${stylePreset.cardBg} lg:col-span-6 rounded-3xl p-6 backdrop-blur-md text-left space-y-5 select-none`}>
          <div>
            <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-widest">Aptitude Progress Timeline</h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Chronological record of prep achievements and solved landmarks.</p>
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
                <div className="absolute -left-9 top-0.5 w-6 h-6 rounded-full flex items-center justify-center border-2 border-blue-600 bg-blue-500 text-white shadow-xs">
                  <CheckCircle className="w-3.5 h-3.5 stroke-[3.5]" />
                </div>
                
                <div className="leading-tight text-left pl-1">
                  <div className="flex items-center gap-2">
                    <h5 className="text-xs font-black uppercase tracking-tight text-slate-900 dark:text-white">
                      {step.milestone}
                    </h5>
                    <span className="text-[8px] font-black font-mono bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 px-1.5 py-0.2 rounded uppercase tracking-wider">
                      {step.tag}
                    </span>
                  </div>
                  <span className="text-[9.5px] text-slate-450 dark:text-slate-550 font-semibold block mt-0.5">
                    Completed • {step.date}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Right Column: AI Smart Insights (6 columns) */}
        <div className={`${stylePreset.cardBg} lg:col-span-6 rounded-3xl p-6 backdrop-blur-md text-left space-y-4 select-none`}>
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900 pb-3">
            <div>
              <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-widest flex items-center gap-1.5">
                <Cpu className={`w-4 h-4 ${stylePreset.iconColor}`} /> Smart Prep Insights
              </h4>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">AI-powered suggestions based on solves profile.</p>
            </div>
            <span className="text-[8px] font-mono font-bold text-slate-400">Agent: Antigravity</span>
          </div>

          <div className="space-y-3.5">
            {[
              { text: "Your Logical reasoning index is stronger than 87% of active placement students.", badge: "STRENGTH", color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" },
              { text: "Optimal Activity Peak: You consistently perform best with 94% accuracy between 7 PM and 10 PM.", badge: "PEAK TIME", color: "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400" },
              { text: "Improvement Target: Elevating Verbal Ability Accuracy by 8% would increase your global rank by 500+ positions.", badge: "RANK BOOSTER", color: "bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400" }
            ].map((insight, idx) => (
              <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-950/20 border border-slate-200/50 dark:border-slate-900 rounded-2xl flex flex-col gap-2">
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

      {/* ====================================================================
          MODALS & DRAWERS OVERLAYS (AnimatePresence)
          ==================================================================== */}
      <AnimatePresence>
        
        {/* Modal 1: Customize Style Modal */}
        {showCustomizeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setShowCustomizeModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-left border-b border-slate-100 dark:border-slate-800 pb-3 pr-8">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">Edit Avatar & Visual Style</h3>
                <p className="text-[10px] text-slate-400 mt-1">Configure profile borders, prestige custom frames, and visual particles.</p>
              </div>

              {/* Dynamic Live Preview */}
              <div className="flex justify-center py-4 bg-slate-50 dark:bg-slate-950/30 rounded-2xl border border-slate-100 dark:border-slate-900">
                <div className="relative">
                  {selectedEffect !== 'None' && (
                    <div className={`absolute -inset-4 rounded-full filter blur-md opacity-70 animate-pulse pointer-events-none ${
                      selectedEffect === 'Floating Particles' ? 'bg-amber-400/20' :
                      selectedEffect === 'Fire Aura' ? 'bg-rose-500/30' :
                      selectedEffect === 'Electric Ring' ? 'bg-blue-500/30 animate-pulse' :
                      selectedEffect === 'Cosmic Glow' ? 'bg-purple-500/30' : 'bg-emerald-400/20'
                    }`} />
                  )}

                  <div className={`p-1.5 ${rankBorderClass} ${effectGlow}`}>
                    <div className={`relative w-24 h-24 rounded-2xl overflow-hidden bg-slate-950 ${frameClass}`}>
                      {(!profile.avatar || profile.avatar === 'initial') ? (
                        <div className="w-full h-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-xl uppercase">
                          {profile.username ? profile.username[0] : 'V'}
                        </div>
                      ) : (
                        <img src={profile.avatar} alt="Preview" className="w-full h-full object-cover" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Settings selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Custom Frames</label>
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

                <div className="space-y-1.5">
                  <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Rank Borders</label>
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

                <div className="space-y-1.5">
                  <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Prestige Effects</label>
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

              {/* Avatar seeds preset list */}
              <div className="space-y-2 text-left pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Change Avatar Preset</label>
                <div className="flex flex-wrap gap-2.5 items-center">
                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, avatar: 'initial' })}
                    className={`w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-[10px] uppercase cursor-pointer border-2 ${(!profile.avatar || profile.avatar === 'initial') ? 'border-blue-500 scale-105' : 'border-transparent opacity-70 hover:opacity-100'}`}
                  >
                    {profile.username ? profile.username[0] : 'V'}
                  </button>

                  {AVATAR_PRESETS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setProfile({ ...profile, avatar: url })}
                      className={`w-9 h-9 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${profile.avatar === url ? 'border-blue-500 scale-105' : 'border-transparent opacity-70 hover:opacity-100'}`}
                    >
                      <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom url input */}
              <div className="space-y-1.5 text-left">
                <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Custom Avatar Image URL</label>
                <input
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  value={profile.avatar && profile.avatar !== 'initial' && !AVATAR_PRESETS.includes(profile.avatar) ? profile.avatar : ''}
                  onChange={e => setProfile({ ...profile, avatar: e.target.value || 'initial' })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-650"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    setShowCustomizeModal(false);
                    setCustomToast('Style Customizations Applied! 🎨');
                    setTimeout(() => setCustomToast(null), 2000);
                  }}
                  className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer ${stylePreset.accentBtn}`}
                >
                  Apply Style & Close
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Modal 2: Edit Credentials Modal */}
        {showEditProfileModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setShowEditProfileModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-left border-b border-slate-100 dark:border-slate-800 pb-3 pr-8">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">Edit Academic Credentials</h3>
                <p className="text-[10px] text-slate-400 mt-1">Configure your official placement credentials and goals catalog.</p>
              </div>

              <form onSubmit={onSaveProfile} className="space-y-4 text-left">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Student Name</label>
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
                    <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">College Name</label>
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
                    <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Degree</label>
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
                    <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Branch</label>
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
                    <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Graduation Year</label>
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
                    <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Preparation Goal</label>
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
                    <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Weekly Commitment</label>
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
                    <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Learning Preference</label>
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

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="submit"
                    className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5 ${stylePreset.accentBtn}`}
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Academic Details</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Modal 3: Privacy & Visibility Drawer */}
        {showPrivacyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative"
            >
              <button 
                onClick={() => setShowPrivacyModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-left border-b border-slate-100 dark:border-slate-800 pb-3 pr-8">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">Profile Privacy & Visibility</h3>
                <p className="text-[10px] text-slate-400 mt-1">Control recruiter and public access view parameters.</p>
              </div>

              <div className="space-y-3.5">
                {[
                  { id: 'public', label: 'Public Index', desc: 'Visible to everyone on the platform', icon: Eye },
                  { id: 'recruiter', label: 'Recruiter Visible', desc: 'Allows hiring firms to search and contact you', icon: Briefcase },
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
                          : 'border-slate-200 bg-white hover:border-blue-500/30 hover:bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/40 dark:hover:bg-slate-800/80'
                      }`}
                    >
                      <IconComp className={`w-4 h-4 shrink-0 mt-0.5 ${active ? 'text-blue-500' : 'text-slate-400'}`} />
                      <div className="leading-tight">
                        <span className={`text-[10.5px] font-black uppercase ${active ? 'text-blue-600 dark:text-blue-400 font-extrabold' : 'text-slate-700 dark:text-slate-350'}`}>{option.label}</span>
                        <p className="text-[9.5px] font-semibold text-slate-400 mt-1">{option.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setShowPrivacyModal(false)}
                  className={`w-full py-2 text-xs font-black uppercase tracking-wider cursor-pointer ${stylePreset.accentBtn}`}
                >
                  Close Settings
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Modal 4: Shareable Rank Card Modal (relocated generator) */}
        {showRankCardModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setShowRankCardModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-left border-b border-slate-100 dark:border-slate-800 pb-3 pr-8">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">Placement Portfolio Card</h3>
                <p className="text-[10px] text-slate-400 mt-1">Configure and export customized placement portfolios cards.</p>
              </div>

              {/* Template selector chips */}
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                {['LinkedIn', 'WhatsApp', 'Instagram', 'Placement Resume'].map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setRankCardType(type as any);
                      setCardGenerated(false);
                    }}
                    className={`py-1.5 px-3 rounded-lg text-[9.5px] font-black uppercase tracking-wider border cursor-pointer transition-all ${
                      rankCardType === type
                        ? 'bg-blue-50 border-blue-300 text-blue-600 dark:bg-blue-950/30 dark:border-blue-900 dark:text-blue-400'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {type} Card
                  </button>
                ))}
              </div>

              {/* Infographic block preview */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-7 flex justify-center">
                  <div className={`w-full max-w-[340px] aspect-[1.6/1] bg-gradient-to-tr from-[#0F172A] to-[#1E293B] border border-slate-800 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between shadow-2xl`}>
                    <div className="absolute top-0 right-0 w-36 h-36 bg-blue-600/10 blur-2xl rounded-full" />
                    <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-indigo-600/10 blur-2xl rounded-full" />

                    <div className="flex justify-between items-center border-b border-slate-800/80 pb-3 select-none">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="font-mono text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          {rankCardType.toUpperCase()} PORTFOLIO
                        </span>
                      </div>
                      <div className="text-[9px] font-black text-blue-400 font-mono tracking-widest">LEVEL 27</div>
                    </div>

                    <div className="flex gap-4 items-center">
                      <div className="relative shrink-0">
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

                      <div className="space-y-0.5 text-left min-w-0">
                        <h5 className="text-xs font-black uppercase text-white tracking-wide truncate">{profile.username || 'Vaishnavi Raparthy'}</h5>
                        <span className="text-[9px] text-slate-400 block truncate">{profile.college || 'VIT University'}</span>
                        <span className="text-[8.5px] font-semibold text-slate-500 font-mono block">Class of {profile.graduation_year || '2026'} • CSE</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[8px] font-bold text-slate-400 font-mono border-t border-slate-800/80 pt-3 select-none">
                      <div className="flex flex-col text-left">
                        <span className="text-slate-500">SOLVED</span>
                        <span className="text-xs text-white font-black mt-0.5 font-sans">1,240</span>
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-slate-500">ACCURACY</span>
                        <span className="text-xs text-emerald-400 font-black mt-0.5 font-sans">88.5%</span>
                      </div>
                      <div className="flex flex-col text-left">
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

                {/* Actions Panel */}
                <div className="md:col-span-5 space-y-4 text-left">
                  <p className="text-xs font-semibold text-slate-550 leading-relaxed dark:text-slate-400">
                    Share a dynamically styled card matching the **{rankCardType} format** directly to show off your streaks, rank score, and aptitude credentials.
                  </p>

                  {!cardGenerated && !generatingCard ? (
                    <button
                      onClick={handleGenerateCard}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 animate-bounce" />
                      <span>Compile Graphic Card</span>
                    </button>
                  ) : generatingCard ? (
                    <div className="w-full py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center gap-2 text-[10px] font-bold text-slate-500 uppercase font-mono">
                      <div className="w-3.5 h-3.5 border-2 border-slate-550 border-t-transparent rounded-full animate-spin" />
                      <span>Processing pixels...</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          setCustomToast('Downloading Infographic PNG... 📥');
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
                            setCustomToast('Aptitude Resume link copied! 🔗');
                            setTimeout(() => setCustomToast(null), 2000);
                          }}
                          className="py-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 dark:bg-slate-950 dark:border-slate-850 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 font-black text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          <LinkIcon className="w-3 h-3" />
                          <span>Copy Link</span>
                        </button>
                        <button
                          onClick={() => {
                            setCustomToast('Shared to clipboard showcase! 🌐');
                            setTimeout(() => setCustomToast(null), 2000);
                          }}
                          className="py-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 dark:bg-slate-950 dark:border-slate-850 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 font-black text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Share2 className="w-3 h-3" />
                          <span>Share</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Modal 5: View All Achievements Modal */}
        {showAllAchievementsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setShowAllAchievementsModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-left border-b border-slate-100 dark:border-slate-800 pb-3 pr-8">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">Achievements & Prestige Badges</h3>
                <p className="text-[10px] text-slate-400 mt-1">Full list of unlocked achievements and prep milestones.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {achievements.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all relative overflow-hidden group ${
                      item.unlocked
                        ? 'bg-slate-50/50 dark:bg-slate-950/20 border-slate-200 dark:border-slate-800 hover:border-blue-500/55'
                        : 'bg-slate-100/30 dark:bg-slate-950/5 border-slate-200/40 dark:border-slate-900 opacity-60'
                    }`}
                  >
                    <div className="text-2xl pt-0.5 shrink-0 group-hover:scale-105 transition-transform">
                      {item.icon}
                    </div>

                    <div className="flex-1 space-y-1 text-left min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h5 className="text-[10.5px] font-black uppercase text-slate-800 dark:text-white tracking-wide truncate">
                          {item.title}
                        </h5>
                        <span className={`text-[7.5px] font-extrabold px-1.5 py-0.2 rounded border font-mono uppercase shrink-0 ${getRarityStyle(item.rarity)}`}>
                          {item.rarity}
                        </span>
                      </div>

                      <p className="text-[9.5px] font-semibold text-slate-450 dark:text-slate-500 leading-tight">
                        {item.req}
                      </p>

                      <div className="pt-1.5 space-y-1">
                        <div className="flex justify-between text-[8px] font-mono font-bold text-slate-400 uppercase">
                          <span>Progress</span>
                          <span>{item.currentProgress} / {item.targetProgress}</span>
                        </div>
                        <div className="w-full bg-slate-200/50 dark:bg-slate-900 h-1 rounded-full overflow-hidden border border-slate-200/10 dark:border-slate-900">
                          <div className={`h-full rounded-full ${item.unlocked ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${(item.currentProgress / item.targetProgress) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

      </AnimatePresence>

    </div>
  );
}
