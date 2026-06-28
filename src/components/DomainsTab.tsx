'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Target, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProgressRing = ({ progress, size = 96, strokeWidth = 9, color = '#3B82F6' }: { progress: number; size?: number; strokeWidth?: number; color?: string }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const timer = setTimeout(() => {
      const progressOffset = ((100 - progress) / 100) * circumference;
      setOffset(progressOffset);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress, circumference]);

  return (
    <div className="relative flex items-center justify-center select-none animate-fadeIn" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-slate-100 dark:stroke-slate-900 transition-colors duration-300"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-base font-black text-slate-800 dark:text-white tracking-tight font-mono leading-none transition-colors duration-300">{progress}%</span>
        <span className="text-[7px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest mt-0.5 leading-none transition-colors duration-300">done</span>
      </div>
    </div>
  );
};

interface DomainsTabProps {
  searchQuery: string;
  customColor?: string;
}

export default function DomainsTab({ searchQuery, customColor = 'default' }: DomainsTabProps) {
  const router = useRouter();
  const [clickedId, setClickedId] = useState<string | null>(null);

  const isCustomActive = customColor !== 'default';

  // 4 Bento Domain Cards Data
  const domains = [
    {
      id: 'quant',
      title: 'Quantitative Aptitude',
      subtitle: 'Arithmetic, Algebra, Geometry & Mensuration',
      accent: isCustomActive ? 'var(--clr-primary)' : '#3B82F6',
      progress: 75,
      topicsLeft: 3,
      solved: 124,
      bgGlow: isCustomActive
        ? 'hover:shadow-[0_20px_40px_rgba(var(--clr-primary-rgb),0.08)] hover:border-[var(--clr-primary)]/80 dark:hover:border-[var(--clr-primary)]/60 dark:hover:shadow-[0_20px_40px_rgba(var(--clr-primary-rgb),0.12)]'
        : 'hover:shadow-[0_20px_40px_rgba(59,130,246,0.08)] hover:border-blue-200/80 dark:hover:border-blue-900/60 dark:hover:shadow-[0_20px_40px_rgba(59,130,246,0.12)]',
      description: 'Master numbers, mathematical induction, profit & loss, coordinates, and fast calculations.',
      btnColor: isCustomActive
        ? 'bg-[var(--clr-primary)] hover:bg-[var(--clr-primary-dark)] shadow-[var(--clr-primary)]/20 dark:bg-[var(--clr-primary)] dark:hover:bg-[var(--clr-primary-dark)]'
        : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20 dark:bg-blue-500 dark:hover:bg-blue-400',
      icon: (
        <svg className="w-16 h-16 transition-transform duration-500 group-hover:scale-110" style={{ color: isCustomActive ? 'var(--clr-primary)' : '#3B82F6' }} viewBox="0 0 100 100" fill="none">
          <line x1="10" y1="80" x2="90" y2="80" className="stroke-slate-100 dark:stroke-slate-800 transition-colors duration-300" strokeWidth="2" strokeDasharray="3 3" />
          <line x1="20" y1="10" x2="20" y2="90" className="stroke-slate-100 dark:stroke-slate-800 transition-colors duration-300" strokeWidth="2" strokeDasharray="3 3" />
          <line x1="50" y1="10" x2="50" y2="90" className="stroke-slate-55 dark:stroke-slate-900/40 transition-colors duration-300" strokeWidth="1.5" />
          <line x1="10" y1="50" x2="90" y2="50" className="stroke-slate-55 dark:stroke-slate-900/40 transition-colors duration-300" strokeWidth="1.5" />
          <path d="M 20 80 Q 50 15 90 35" stroke="url(#quant-grad)" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="20" cy="80" r="4.5" fill={isCustomActive ? 'var(--clr-primary)' : '#3B82F6'} stroke="#FFFFFF" className="dark:stroke-slate-950" strokeWidth="1.5" />
          <circle cx="50" cy="38" r="4.5" fill={isCustomActive ? 'var(--clr-primary)' : '#3B82F6'} stroke="#FFFFFF" className="dark:stroke-slate-950" strokeWidth="1.5" />
          <circle cx="90" cy="35" r="6.5" fill={isCustomActive ? 'var(--clr-primary)' : '#3B82F6'} stroke="#FFFFFF" className="dark:stroke-slate-950 animate-pulse" strokeWidth="2" />
          <defs>
            <linearGradient id="quant-grad" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor={isCustomActive ? 'var(--clr-primary)' : '#3B82F6'} />
              <stop offset="100%" stopColor={isCustomActive ? 'var(--clr-primary)' : '#3B82F6'} stopOpacity={0.6} />
            </linearGradient>
          </defs>
        </svg>
      )
    },
    {
      id: 'logical',
      title: 'Logical Reasoning',
      subtitle: 'Arrangements, Syllogisms & Logic Puzzles',
      accent: isCustomActive ? 'var(--clr-primary)' : '#8B5CF6',
      progress: 40,
      topicsLeft: 6,
      solved: 68,
      bgGlow: isCustomActive
        ? 'hover:shadow-[0_20px_40px_rgba(var(--clr-primary-rgb),0.08)] hover:border-[var(--clr-primary)]/80 dark:hover:border-[var(--clr-primary)]/60 dark:hover:shadow-[0_20px_40px_rgba(var(--clr-primary-rgb),0.12)]'
        : 'hover:shadow-[0_20px_40px_rgba(139,92,246,0.08)] hover:border-purple-200/80 dark:hover:border-purple-900/60 dark:hover:shadow-[0_20px_40px_rgba(139,92,246,0.12)]',
      description: 'Strengthen spatial matrices, circular deduction paths, syllogistic patterns, and sequences.',
      btnColor: isCustomActive
        ? 'bg-[var(--clr-primary)] hover:bg-[var(--clr-primary-dark)] shadow-[var(--clr-primary)]/20 dark:bg-[var(--clr-primary)] dark:hover:bg-[var(--clr-primary-dark)]'
        : 'bg-purple-600 hover:bg-purple-500 shadow-purple-500/20 dark:bg-purple-500 dark:hover:bg-purple-400',
      icon: (
        <svg className="w-16 h-16 transition-transform duration-500 group-hover:scale-110" style={{ color: isCustomActive ? 'var(--clr-primary)' : '#8B5CF6' }} viewBox="0 0 100 100" fill="none">
          <line x1="25" y1="30" x2="50" y2="50" className="stroke-slate-100 dark:stroke-slate-800 transition-colors duration-300" strokeWidth="2" />
          <line x1="75" y1="30" x2="50" y2="50" className="stroke-slate-100 dark:stroke-slate-800 transition-colors duration-300" strokeWidth="2" />
          <line x1="25" y1="70" x2="50" y2="50" className="stroke-slate-100 dark:stroke-slate-800 transition-colors duration-300" strokeWidth="2" />
          <line x1="75" y1="70" x2="50" y2="50" className="stroke-slate-100 dark:stroke-slate-800 transition-colors duration-300" strokeWidth="2" />
          <line x1="25" y1="30" x2="75" y2="30" className="stroke-slate-55 dark:stroke-slate-900/40 transition-colors duration-300" strokeWidth="1.5" />
          <line x1="25" y1="70" x2="75" y2="70" className="stroke-slate-55 dark:stroke-slate-900/40 transition-colors duration-300" strokeWidth="1.5" />
          <circle cx="50" cy="50" r="9.5" fill="url(#logical-grad)" stroke="#FFFFFF" className="dark:stroke-slate-950" style={{ filter: isCustomActive ? 'drop-shadow(0 0 6px rgba(var(--clr-primary-rgb),0.4))' : 'drop-shadow(0 0 6px rgba(139,92,246,0.4))' }} strokeWidth="2" />
          <circle cx="25" cy="30" r="5" fill={isCustomActive ? 'var(--clr-primary)' : '#8B5CF6'} stroke="#FFFFFF" className="dark:stroke-slate-950" strokeWidth="1.5" />
          <circle cx="75" cy="30" r="5" fill={isCustomActive ? 'var(--clr-primary)' : '#8B5CF6'} stroke="#FFFFFF" className="dark:stroke-slate-950" strokeWidth="1.5" />
          <circle cx="25" cy="70" r="5" fill={isCustomActive ? 'var(--clr-primary)' : '#8B5CF6'} stroke="#FFFFFF" className="dark:stroke-slate-950" strokeWidth="1.5" />
          <circle cx="75" cy="70" r="5" fill={isCustomActive ? 'var(--clr-primary)' : '#8B5CF6'} stroke="#FFFFFF" className="dark:stroke-slate-950" strokeWidth="1.5" />
          <defs>
            <linearGradient id="logical-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={isCustomActive ? 'var(--clr-primary)' : '#8B5CF6'} />
              <stop offset="100%" stopColor={isCustomActive ? 'var(--clr-primary)' : '#A78BFA'} stopOpacity={0.6} />
            </linearGradient>
          </defs>
        </svg>
      )
    },
    {
      id: 'verbal',
      title: 'Verbal Ability',
      subtitle: 'Grammar, Syntax & Reading Comprehension',
      accent: isCustomActive ? 'var(--clr-primary)' : '#10B981',
      progress: 85,
      topicsLeft: 2,
      solved: 194,
      bgGlow: isCustomActive
        ? 'hover:shadow-[0_20px_40px_rgba(var(--clr-primary-rgb),0.08)] hover:border-[var(--clr-primary)]/80 dark:hover:border-[var(--clr-primary)]/60 dark:hover:shadow-[0_20px_40px_rgba(var(--clr-primary-rgb),0.12)]'
        : 'hover:shadow-[0_20px_40px_rgba(16,185,129,0.08)] hover:border-emerald-200/80 dark:hover:border-emerald-900/60 dark:hover:shadow-[0_20px_40px_rgba(16,185,129,0.12)]',
      description: 'Perfect vocabulary context, verbal modifications, textual inferences, and logic correction.',
      btnColor: isCustomActive
        ? 'bg-[var(--clr-primary)] hover:bg-[var(--clr-primary-dark)] shadow-[var(--clr-primary)]/20 dark:bg-[var(--clr-primary)] dark:hover:bg-[var(--clr-primary-dark)]'
        : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20 dark:bg-emerald-500 dark:hover:bg-emerald-400',
      icon: (
        <svg className="w-16 h-16 transition-transform duration-500 group-hover:scale-110" style={{ color: isCustomActive ? 'var(--clr-primary)' : '#10B981' }} viewBox="0 0 100 100" fill="none">
          <rect x="15" y="25" width="50" height="20" rx="7" className={isCustomActive ? 'fill-[var(--clr-primary)]/10' : 'fill-emerald-50 dark:fill-emerald-950/20'} stroke={isCustomActive ? 'var(--clr-primary)' : '#10B981'} strokeWidth="1.8" />
          <text x="24" y="38" className={isCustomActive ? 'fill-[var(--clr-primary)] dark:fill-[var(--clr-primary)] font-extrabold' : 'fill-emerald-800 dark:fill-emerald-300 font-extrabold'} fontSize="9" fontWeight="800" fontFamily="system-ui, sans-serif" letterSpacing="0.5">SYNTAX</text>
          <rect x="35" y="52" width="50" height="20" rx="7" fill="url(#verbal-grad)" className="stroke-white dark:stroke-slate-900" style={{ filter: isCustomActive ? 'drop-shadow(0 4px 8px rgba(var(--clr-primary-rgb),0.2))' : 'drop-shadow(0 4px 8px rgba(16,185,129,0.2))' }} strokeWidth="1.5" />
          <text x="44" y="65" fill="#FFFFFF" fontSize="9" fontWeight="800" fontFamily="system-ui, sans-serif" letterSpacing="0.5">VERBAL</text>
          <defs>
            <linearGradient id="verbal-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={isCustomActive ? 'var(--clr-primary)' : '#10B981'} />
              <stop offset="100%" stopColor={isCustomActive ? 'var(--clr-primary)' : '#34D399'} stopOpacity={0.6} />
            </linearGradient>
          </defs>
        </svg>
      )
    },
    {
      id: 'coding',
      title: 'Coding & DSA',
      subtitle: 'Data Structures, Algorithms & Problem Solving',
      accent: isCustomActive ? 'var(--clr-primary)' : '#F97316',
      progress: 20,
      topicsLeft: 8,
      solved: 32,
      bgGlow: isCustomActive
        ? 'hover:shadow-[0_20px_40px_rgba(var(--clr-primary-rgb),0.08)] hover:border-[var(--clr-primary)]/80 dark:hover:border-[var(--clr-primary)]/60 dark:hover:shadow-[0_20px_40px_rgba(var(--clr-primary-rgb),0.12)]'
        : 'hover:shadow-[0_20px_40px_rgba(249,115,22,0.08)] hover:border-orange-200/80 dark:hover:border-orange-900/60 dark:hover:shadow-[0_20px_40px_rgba(249,115,22,0.12)]',
      description: 'Master binary search trees, search recursion, dynamic array branches, and sorting complexities.',
      btnColor: isCustomActive
        ? 'bg-[var(--clr-primary)] hover:bg-[var(--clr-primary-dark)] shadow-[var(--clr-primary)]/20 dark:bg-[var(--clr-primary)] dark:hover:bg-[var(--clr-primary-dark)]'
        : 'bg-orange-600 hover:bg-orange-500 shadow-orange-500/20 dark:bg-orange-500 dark:hover:bg-orange-400',
      icon: (
        <svg className="w-16 h-16 transition-transform duration-500 group-hover:scale-110" style={{ color: isCustomActive ? 'var(--clr-primary)' : '#F97316' }} viewBox="0 0 100 100" fill="none">
          <path d="M 28 32 L 10 50 L 28 68" stroke={isCustomActive ? 'var(--clr-primary)' : '#F97316'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 72 32 L 90 50 L 72 68" stroke={isCustomActive ? 'var(--clr-primary)' : '#F97316'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="56" y1="26" x2="44" y2="74" stroke={isCustomActive ? 'var(--clr-primary)' : '#F97316'} strokeWidth="3" strokeLinecap="round" />
          <circle cx="50" cy="16" r="3" fill={isCustomActive ? 'var(--clr-primary)' : '#F97316'} />
          <circle cx="15" cy="80" r="3" fill={isCustomActive ? 'var(--clr-primary)' : '#F97316'} />
          <circle cx="85" cy="80" r="3" fill={isCustomActive ? 'var(--clr-primary)' : '#F97316'} />
        </svg>
      )
    }
  ];

  // Filtering based on search query
  const filteredDomains = domains.filter(d => 
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full flex flex-col space-y-4 animate-fadeIn">
      {/* Main Bento Grid layout (2x2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full py-0">
        {filteredDomains.length > 0 ? (
          filteredDomains.map((d) => (
            <div 
              key={d.id}
              onClick={() => {
                if (clickedId) return;
                setClickedId(d.id);
                const slugMap: Record<string, string> = {
                  'quant': 'quantitative-aptitude',
                  'logical': 'logical-reasoning',
                  'verbal': 'verbal-ability',
                  'coding': 'coding-dsa'
                };
                const slug = slugMap[d.id] || d.id;
                router.push(`/domain/${slug}`);
              }}
              className={`group bg-white border border-slate-200/80 dark:bg-slate-900/40 dark:border-slate-900/80 rounded-[24px] p-6 flex flex-col gap-6 transition-all duration-300 ease-out cursor-pointer hover:scale-[1.02] shadow-[0_8px_30px_rgba(0,0,0,0.015)] ${d.bgGlow}`}
            >
              
              {/* Top content slot: Titles */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 pr-2">
                  <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white tracking-tight leading-none uppercase font-heading transition-colors duration-300">
                    {d.title}
                  </h2>
                  <div className="mt-2">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                      {d.subtitle}
                    </p>
                  </div>
                </div>
 
                 <div className="shrink-0 flex items-center justify-center transition-colors duration-300 opacity-80 mix-blend-luminosity">
                   <ProgressRing progress={d.progress} color={d.accent} />
                 </div>
               </div>
 
               {/* Bottom slot: Stats metrics + Button */}
               <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-900/80 pt-4 mt-1 select-none transition-colors duration-300">
                 <div className="flex gap-4">
                   <div className="space-y-1">
                     <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block leading-none transition-colors duration-300">solved</span>
                     <span className="text-xs font-mono font-extrabold text-slate-700 dark:text-slate-300 block leading-none transition-colors duration-300">{d.solved} problems</span>
                   </div>
                   <div className="h-6 w-px bg-slate-100 dark:bg-slate-900" />
                   <div className="space-y-1">
                     <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block leading-none transition-colors duration-300">left</span>
                     <span className="text-xs font-mono font-extrabold text-slate-700 dark:text-slate-300 block leading-none transition-colors duration-300">{d.topicsLeft} topics</span>
                   </div>
                 </div>
 
                 <motion.button 
                   type="button"
                   whileHover={{ scale: clickedId ? 1 : 1.05 }}
                   whileTap={{ scale: clickedId ? 1 : 0.95 }}
                   className={`flex items-center gap-1.5 px-4 py-2.5 text-[10px] font-black text-white uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer min-w-[90px] justify-center ${d.btnColor}`}
                 >
                   <AnimatePresence mode="wait">
                     {clickedId === d.id ? (
                       <motion.div
                         key="loading"
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         exit={{ opacity: 0, y: -10 }}
                         className="flex items-center gap-1.5 justify-center"
                       >
                         <Loader2 className="w-3 h-3 animate-spin" />
                         <span>Loading...</span>
                       </motion.div>
                     ) : (
                       <motion.div
                         key="normal"
                         initial={{ opacity: 0, y: -10 }}
                         animate={{ opacity: 1, y: 0 }}
                         exit={{ opacity: 0, y: 10 }}
                         className="flex items-center gap-1.5 justify-center"
                       >
                         <span>Continue</span>
                         <ChevronRight className="w-3.5 h-3.5 stroke-[3] transition-transform duration-300 group-hover:translate-x-1" />
                       </motion.div>
                     )}
                   </AnimatePresence>
                 </motion.button>
               </div>

            </div>
          ))
        ) : (
          <div className="col-span-1 md:col-span-2 text-center py-16 bg-white dark:bg-slate-900/10 border border-dashed border-slate-200 dark:border-slate-900 rounded-3xl p-8 space-y-3 transition-colors duration-300">
            <Target className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto animate-pulse" />
            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">No Matching Domains Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">We couldn't find any learning domains matching "{searchQuery}". Try editing your search query.</p>
          </div>
        )}
      </div>
    </div>
  );
}
