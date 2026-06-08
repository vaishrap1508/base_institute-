'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Layers, 
  User, 
  GraduationCap, 
  Target, 
  Clock, 
  Calendar, 
  BookOpen, 
  Search, 
  ChevronRight, 
  ChevronDown, 
  Play, 
  Cpu, 
  Award, 
  Bookmark, 
  Flame, 
  Check, 
  X, 
  LogOut,
  Info,
  ExternalLink,
  BookOpenCheck,
  ShieldCheck,
  Sparkles,
  Bell,
  Globe,
  Activity,
  Trophy,
  TrendingUp,
  Compass,
  Briefcase,
  Sun,
  Moon,
  Lock,
  Heart,
  Settings as SettingsIcon,
  Save,
  CheckCircle,
  HelpCircle,
  BookMarked
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { createClient as createAuthClient } from '@/utils/supabase/client';
import { DOMAINS_DATA, SAMPLE_QUESTIONS } from '@/lib/admin/store';
import { Question } from '@/lib/admin/types';

const MOCK_BADGES_DATA = [
  // Standalone Getting Started Badges (Phase 1)
  { id: 'gs_first_step', name: 'First Step', level: 1, description: 'Awarded when you complete your first learning activity, lesson, quiz, or question.', image_url: '/badges/stage1/01.png', category: 'getting_started' },
  { id: 'gs_getting_started', name: 'Getting Started', level: 1, description: 'Awarded when onboarding and profile setup are completed.', image_url: '/badges/stage1/02.png', category: 'getting_started' },
  { id: 'gs_curious_mind', name: 'Curious Mind', level: 1, description: 'Awarded when you explore multiple sections of the platform.', image_url: '/badges/stage1/03.png', category: 'getting_started' },
  { id: 'gs_learning_begins', name: 'Learning Begins', level: 1, description: 'Awarded when your first learning module is completed.', image_url: '/badges/stage1/04.png', category: 'getting_started' },
  { id: 'gs_first_challenge', name: 'First Challenge', level: 1, description: 'Awarded when the first aptitude challenge or practice test is attempted.', image_url: '/badges/stage1/05.png', category: 'getting_started' },
  { id: 'gs_keep_going', name: 'Keep Going', level: 1, description: 'Awarded after completing 5 learning activities.', image_url: '/badges/stage1/06.png', category: 'getting_started' },
  { id: 'gs_early_bird', name: 'Early Bird', level: 1, description: 'Awarded after learning for 3 consecutive days.', image_url: '/badges/stage1/07.png', category: 'getting_started' },
  { id: 'gs_on_track', name: 'On Track', level: 1, description: 'Awarded after reaching 25% completion of the first learning path.', image_url: '/badges/stage1/08.png', category: 'getting_started' },
  { id: 'gs_not_stopping', name: 'Not Stopping', level: 1, description: 'Awarded after completing 10 learning activities.', image_url: '/badges/stage1/09.png', category: 'getting_started' }
];

const getCategoryEmoji = (cat: string) => {
  switch (cat) {
    case 'getting_started': return '🚀';
    case 'learning': return '📚';
    case 'profile': return '⚙️';
    case 'logical': return '🧩';
    case 'quant': return '📐';
    case 'speed': return '⚡';
    case 'streak': return '🔥';
    case 'community': return '💬';
    case 'mock': return '📝';
    default: return '🧠';
  }
};

const getAccentClass = (colorId: string, type: 'bg' | 'border' | 'text' | 'combined' | 'badge' | 'button' | 'ring') => {
  switch (colorId) {
    case 'emerald':
      if (type === 'bg') return 'bg-emerald-500';
      if (type === 'border') return 'border-emerald-500';
      if (type === 'text') return 'text-emerald-600 dark:text-emerald-400';
      if (type === 'badge') return 'bg-emerald-500 border-emerald-400 text-white shadow-emerald-500/20';
      if (type === 'button') return 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg hover:shadow-emerald-500/20';
      if (type === 'ring') return 'stroke-emerald-600 dark:stroke-emerald-400';
      return 'bg-emerald-50 border-emerald-300 text-emerald-600 dark:bg-emerald-955/30 dark:border-emerald-900 dark:text-emerald-400';
    case 'purple':
      if (type === 'bg') return 'bg-purple-500';
      if (type === 'border') return 'border-purple-500';
      if (type === 'text') return 'text-purple-600 dark:text-purple-400';
      if (type === 'badge') return 'bg-purple-600 border-purple-500 text-white shadow-purple-500/20';
      if (type === 'button') return 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg hover:shadow-purple-500/20';
      if (type === 'ring') return 'stroke-purple-600 dark:stroke-purple-400';
      return 'bg-purple-50 border-purple-300 text-purple-600 dark:bg-purple-955/30 dark:border-purple-900 dark:text-purple-400';
    case 'amber':
      if (type === 'bg') return 'bg-amber-500';
      if (type === 'border') return 'border-amber-500';
      if (type === 'text') return 'text-amber-600 dark:text-amber-400';
      if (type === 'badge') return 'bg-amber-500 border-amber-400 text-white shadow-amber-500/20';
      if (type === 'button') return 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg hover:shadow-amber-500/20';
      if (type === 'ring') return 'stroke-amber-600 dark:stroke-amber-400';
      return 'bg-amber-50 border-amber-300 text-amber-600 dark:bg-amber-955/30 dark:border-amber-900 dark:text-amber-400';
    case 'rose':
      if (type === 'bg') return 'bg-rose-500';
      if (type === 'border') return 'border-rose-500';
      if (type === 'text') return 'text-rose-600 dark:text-rose-400';
      if (type === 'badge') return 'bg-rose-500 border-rose-400 text-white shadow-rose-500/20';
      if (type === 'button') return 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg hover:shadow-rose-500/20';
      if (type === 'ring') return 'stroke-rose-600 dark:stroke-rose-400';
      return 'bg-rose-50 border-rose-300 text-rose-600 dark:bg-rose-955/30 dark:border-rose-900 dark:text-rose-400';
    case 'orange':
      if (type === 'bg') return 'bg-orange-500';
      if (type === 'border') return 'border-orange-500';
      if (type === 'text') return 'text-orange-600 dark:text-orange-400';
      if (type === 'badge') return 'bg-orange-500 border-orange-400 text-white shadow-orange-500/20';
      if (type === 'button') return 'bg-orange-600 hover:bg-orange-500 text-white shadow-lg hover:shadow-orange-500/20';
      if (type === 'ring') return 'stroke-orange-600 dark:stroke-orange-400';
      return 'bg-orange-50 border-orange-300 text-orange-600 dark:bg-orange-955/30 dark:border-orange-900 dark:text-orange-400';
    case 'teal':
      if (type === 'bg') return 'bg-teal-500';
      if (type === 'border') return 'border-teal-500';
      if (type === 'text') return 'text-teal-600 dark:text-teal-400';
      if (type === 'badge') return 'bg-teal-500 border-teal-400 text-white shadow-teal-500/20';
      if (type === 'button') return 'bg-teal-600 hover:bg-teal-500 text-white shadow-lg hover:shadow-teal-500/20';
      if (type === 'ring') return 'stroke-teal-600 dark:stroke-teal-400';
      return 'bg-teal-50 border-teal-300 text-teal-600 dark:bg-teal-955/30 dark:border-teal-900 dark:text-teal-400';
    case 'indigo':
      if (type === 'bg') return 'bg-indigo-500';
      if (type === 'border') return 'border-indigo-500';
      if (type === 'text') return 'text-indigo-600 dark:text-indigo-400';
      if (type === 'badge') return 'bg-indigo-605 border-indigo-500 text-white shadow-indigo-500/20';
      if (type === 'button') return 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg hover:shadow-indigo-500/20';
      if (type === 'ring') return 'stroke-indigo-600 dark:stroke-indigo-400';
      return 'bg-indigo-50 border-indigo-300 text-indigo-600 dark:bg-indigo-955/30 dark:border-indigo-900 dark:text-indigo-400';
    case 'blue':
    default:
      if (type === 'bg') return 'bg-blue-500';
      if (type === 'border') return 'border-blue-500';
      if (type === 'text') return 'text-blue-600 dark:text-blue-400';
      if (type === 'badge') return 'bg-blue-600 border-blue-500 text-white shadow-blue-500/20';
      if (type === 'button') return 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg hover:shadow-blue-500/25';
      if (type === 'ring') return 'stroke-blue-600 dark:stroke-blue-400';
      return 'bg-blue-50 border-blue-300 text-blue-600 dark:bg-blue-955/30 dark:border-blue-900 dark:text-blue-400';
  }
};

const getHexColor = (colorId: string) => {
  switch (colorId) {
    case 'emerald': return '#10B981';
    case 'purple': return '#8B5CF6';
    case 'amber': return '#F59E0B';
    case 'rose': return '#F43F5E';
    case 'orange': return '#F97316';
    case 'teal': return '#14B8A6';
    case 'indigo': return '#6366F1';
    case 'blue':
    default: return '#3B82F6';
  }
};


const getBadgeProgress = (badgeName: string, isUnlocked: boolean) => {
  const name = badgeName.toLowerCase();
  
  const hasOnboarding = typeof window !== 'undefined' ? (localStorage.getItem('aptitude_onboarding_completed') === 'true') : false;
  const currentSolved = typeof window !== 'undefined' ? Number(localStorage.getItem('aptitude_solved_count') || 12) : 12;
  const currentStreak = typeof window !== 'undefined' ? Number(localStorage.getItem('aptitude_streak') || 14) : 14;
  const bookmarksCount = typeof window !== 'undefined' ? (() => {
    try {
      const b = localStorage.getItem('aptitude_bookmarks');
      return b ? JSON.parse(b).length : 1;
    } catch (_) { return 1; }
  })() : 1;
  const sectionsVisited = typeof window !== 'undefined' ? Number(localStorage.getItem('aptitude_sections_visited_count') || 2) : 2;

  if (name.includes('first step')) {
    return { current: isUnlocked ? 1 : Math.min(1, currentSolved), target: 1, label: 'Learning Activities' };
  }
  if (name.includes('getting started')) {
    return { current: isUnlocked || hasOnboarding ? 1 : 0, target: 1, label: 'Complete Profile' };
  }
  if (name.includes('curious mind')) {
    return { current: isUnlocked ? 3 : Math.min(3, sectionsVisited), target: 3, label: 'Sections Visited' };
  }
  if (name.includes('learning begins')) {
    return { current: isUnlocked ? 1 : 0, target: 1, label: 'Complete a Concept' };
  }
  if (name.includes('first challenge')) {
    return { current: isUnlocked ? 1 : 0, target: 1, label: 'Attempt a Mock Test' };
  }
  if (name.includes('keep going')) {
    return { current: isUnlocked ? 5 : Math.min(5, currentSolved), target: 5, label: 'Learning Activities' };
  }
  if (name.includes('early bird')) {
    return { current: isUnlocked ? 3 : Math.min(3, Math.min(currentStreak, 2)), target: 3, label: 'Consecutive Days' };
  }
  if (name.includes('on track')) {
    return { current: isUnlocked ? 25 : 0, target: 25, label: 'Path Progress %' };
  }
  if (name.includes('not stopping')) {
    return { current: isUnlocked ? 10 : Math.min(10, currentSolved), target: 10, label: 'Learning Activities' };
  }
  
  return { current: isUnlocked ? 1 : 0, target: 1, label: 'Progress' };
};

const TransparentBadgeImage = ({ src, alt, className, style }: any) => {
  const [processedSrc, setProcessedSrc] = useState<string>(src);

  useEffect(() => {
    if (!src || src.startsWith('data:')) {
      setProcessedSrc(src);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = src;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      const width = canvas.width;
      const height = canvas.height;
      const visited = new Uint8Array(width * height);
      const queue: [number, number][] = [];

      const isNearWhite = (r: number, g: number, b: number) => {
        return r > 240 && g > 240 && b > 240;
      };

      // Push all borders to seed flood fill
      for (let x = 0; x < width; x++) {
        let idx = x;
        if (isNearWhite(data[idx * 4], data[idx * 4 + 1], data[idx * 4 + 2]) && !visited[idx]) {
          queue.push([x, 0]);
          visited[idx] = 1;
        }
        idx = (height - 1) * width + x;
        if (isNearWhite(data[idx * 4], data[idx * 4 + 1], data[idx * 4 + 2]) && !visited[idx]) {
          queue.push([x, height - 1]);
          visited[idx] = 1;
        }
      }

      for (let y = 0; y < height; y++) {
        let idx = y * width;
        if (isNearWhite(data[idx * 4], data[idx * 4 + 1], data[idx * 4 + 2]) && !visited[idx]) {
          queue.push([0, y]);
          visited[idx] = 1;
        }
        idx = y * width + (width - 1);
        if (isNearWhite(data[idx * 4], data[idx * 4 + 1], data[idx * 4 + 2]) && !visited[idx]) {
          queue.push([width - 1, y]);
          visited[idx] = 1;
        }
      }

      while (queue.length > 0) {
        const curr = queue.shift();
        if (!curr) continue;
        const [cx, cy] = curr;
        const idx = cy * width + cx;
        const pixelIdx = idx * 4;

        // Set alpha to transparent
        data[pixelIdx + 3] = 0;

        const dirs = [
          [cx + 1, cy],
          [cx - 1, cy],
          [cx, cy + 1],
          [cx, cy - 1]
        ];

        for (const [nx, ny] of dirs) {
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const nidx = ny * width + nx;
            if (!visited[nidx]) {
              const npixelIdx = nidx * 4;
              if (isNearWhite(data[npixelIdx], data[npixelIdx + 1], data[npixelIdx + 2])) {
                queue.push([nx, ny]);
                visited[nidx] = 1;
              }
            }
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);
      try {
        setProcessedSrc(canvas.toDataURL());
      } catch (e) {
        console.warn('Canvas processing error:', e);
        setProcessedSrc(src);
      }
    };
    img.onerror = () => {
      setProcessedSrc(src);
    };
  }, [src]);

  return (
    <img 
      src={processedSrc} 
      alt={alt} 
      className={className} 
      style={style}
    />
  );
};

const BadgeCard = ({ badge, isUnlocked }: { badge: any, isUnlocked: boolean }) => {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const imageRef = React.useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    const imgContainer = imageRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    
    // Calculate rotation angles (max tilt ~12 degrees for visible 3D effect)
    const rotateX = -(y - yc) / (rect.height / 15);
    const rotateY = (x - xc) / (rect.width / 15);
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.04, 1.04, 1.04)`;
    
    // Parallax Lift on the image container to pop out of the card
    if (imgContainer) {
      imgContainer.style.transform = `translateZ(30px) scale(1.1) rotateX(${-rotateX * 0.2}deg) rotateY(${-rotateY * 0.2}deg)`;
    }
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    const imgContainer = imageRef.current;
    if (!card) return;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    card.style.transition = 'transform 0.4s ease-out';
    
    if (imgContainer) {
      imgContainer.style.transform = 'translateZ(0px) scale(1)';
      imgContainer.style.transition = 'transform 0.4s ease-out';
    }
  };

  const getLevelStyles = (lvl: number) => {
    switch (lvl) {
      case 1:
        return {
          border: 'border-emerald-500/20 dark:border-emerald-500/30',
          bg: 'bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-950/10 dark:to-slate-900',
          glow: 'shadow-emerald-500/5',
          banner: 'bg-emerald-100/70 dark:bg-emerald-955 text-emerald-800 dark:text-emerald-400',
          badgeStyle: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500/20 text-emerald-600',
          emoji: '🌱'
        };
      case 2:
        return {
          border: 'border-blue-500/20 dark:border-blue-500/30',
          bg: 'bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-slate-900',
          glow: 'shadow-blue-500/5',
          banner: 'bg-blue-100 dark:bg-blue-955/60 text-blue-800 dark:text-blue-400',
          badgeStyle: 'bg-blue-50 dark:bg-blue-950/50 border-blue-500/20 text-blue-605',
          emoji: '🛡️'
        };
      case 3:
        return {
          border: 'border-purple-500/20 dark:border-purple-500/30',
          bg: 'bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-slate-900',
          glow: 'shadow-purple-500/5',
          banner: 'bg-purple-100 dark:bg-purple-955/60 text-purple-800 dark:text-purple-400',
          badgeStyle: 'bg-purple-50 dark:bg-purple-950/50 border-purple-500/20 text-purple-600',
          emoji: '🔮'
        };
      case 4:
        return {
          border: 'border-amber-500/30 dark:border-amber-500/40',
          bg: 'bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-slate-900',
          glow: 'shadow-amber-500/10 dark:shadow-amber-500/20',
          banner: 'bg-amber-100 dark:bg-amber-955 text-amber-805 dark:text-amber-400',
          badgeStyle: 'bg-amber-50 dark:bg-amber-950/50 border-amber-500/20 text-amber-600',
          emoji: '👑'
        };
      case 5:
        return {
          border: 'border-indigo-500/40 dark:border-indigo-500/50',
          bg: 'bg-gradient-to-br from-indigo-50 via-white to-pink-50 dark:from-indigo-950/20 dark:via-slate-900 dark:to-pink-950/20',
          glow: 'shadow-indigo-500/15 dark:shadow-indigo-500/30',
          banner: 'bg-indigo-100 dark:bg-indigo-955 text-indigo-805 dark:text-indigo-400',
          badgeStyle: 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500/20 text-indigo-600',
          emoji: '🌌'
        };
      default:
        return {
          border: 'border-slate-205 dark:border-slate-800',
          bg: 'bg-white dark:bg-slate-900',
          glow: '',
          banner: 'bg-slate-100 dark:bg-slate-800',
          badgeStyle: 'bg-slate-50 dark:bg-slate-800 border-slate-205 text-slate-500',
          emoji: '🎓'
        };
    }
  };

  const style = getLevelStyles(badge.level);
  const progress = getBadgeProgress(badge.name, isUnlocked);

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transformStyle: 'preserve-3d', transition: 'transform 0.1s ease-out' }}
      className={`border rounded-2xl p-5 flex flex-col items-center justify-between text-center relative overflow-hidden shadow-sm min-h-[280px] ${
        isUnlocked 
          ? `${style.border} ${style.bg} ${style.glow}` 
          : 'border-slate-250 bg-slate-50/30 dark:border-slate-850/60 dark:bg-slate-900/40 opacity-70 hover:opacity-100 transition-opacity duration-300'
      }`}
    >
      {/* Lock Icon in Top-Right when Locked */}
      {!isUnlocked && (
        <div className="absolute top-3 right-3 text-slate-400 dark:text-slate-555 bg-slate-100/80 dark:bg-slate-800/80 p-1.5 rounded-full border border-slate-200 dark:border-slate-700/50 shadow-sm">
          <Lock className="w-3.5 h-3.5" />
        </div>
      )}


      <div 
        ref={imageRef}
        style={{ transformStyle: 'preserve-3d', transition: 'transform 0.2s ease-out' }}
        className="w-20 h-20 mb-4 relative flex items-center justify-center select-none"
      >
        {badge.image_url ? (
          <TransparentBadgeImage 
            src={badge.image_url} 
            alt={badge.name} 
            className={`w-full h-full object-contain transition-all duration-300 ${
              isUnlocked 
                ? 'scale-100 drop-shadow-[0_4px_10px_rgba(16,185,129,0.25)] dark:drop-shadow-[0_4px_10px_rgba(52,211,153,0.2)]' 
                : 'scale-95 opacity-30 grayscale-[80%]'
            }`} 
          />
        ) : (
          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl border shadow-inner relative ${
            isUnlocked ? style.badgeStyle : 'bg-slate-100 border-slate-300 text-slate-400'
          }`}>
            <span className="z-10">{getCategoryEmoji(badge.category)}</span>
            <span className="absolute bottom-0 right-0 text-xs">{style.emoji}</span>
          </div>
        )}
      </div>

      <div className="space-y-1 w-full flex-grow flex flex-col justify-center">
        <h4 className="text-xs font-black uppercase tracking-tight text-slate-900 dark:text-white font-bold">
          {badge.name}
        </h4>
        <p className="text-[10px] text-slate-500 dark:text-slate-455 leading-normal font-semibold max-w-[150px] mx-auto min-h-[30px]">
          {badge.description}
        </p>
      </div>

      <div className="mt-4 pt-2 border-t border-slate-200/40 dark:border-slate-800/40 w-full">
        {isUnlocked ? (
          <span className="text-emerald-600 dark:text-emerald-450 flex items-center justify-center gap-1 text-[9px] font-extrabold uppercase tracking-widest">
            <Check className="w-3 h-3 stroke-[3]" /> Unlocked
          </span>
        ) : (
          <div className="w-full space-y-1.5">
            <div className="flex justify-between text-[9px] font-black uppercase text-slate-455 dark:text-slate-500 tracking-wider">
              <span>Progress</span>
              <span>{progress.current}/{progress.target}</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
              <div 
                className="bg-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${(progress.current / progress.target) * 100}%` }}
              />
            </div>
            <div className="text-[8px] font-black uppercase text-slate-400 dark:text-slate-550 tracking-widest text-center pt-0.5">
              {progress.label}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};



const CanvasCelebration = ({ confettiStyle }: { confettiStyle: 'confetti' | 'fireworks' | 'none' }) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (canvas) {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);

    interface Particle {
      x: number;
      y: number;
      size: number;
      color: string;
      speedX: number;
      speedY: number;
      rotation: number;
      rotationSpeed: number;
      opacity: number;
    }

    interface Spark {
      x: number;
      y: number;
      color: string;
      angle: number;
      speed: number;
      friction: number;
      gravity: number;
      opacity: number;
      decay: number;
      size: number;
    }

    interface Firework {
      x: number;
      y: number;
      targetY: number;
      speedY: number;
      color: string;
      exploded: boolean;
      sparks: Spark[];
    }

    const particles: Particle[] = [];
    const fireworks: Firework[] = [];

    const colors = ['#FFC107', '#FF5722', '#E91E63', '#9C27B0', '#3F51B5', '#00BCD4', '#4CAF50', '#8BC34A'];

    if (confettiStyle === 'confetti') {
      for (let i = 0; i < 150; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * -height - 20,
          size: Math.random() * 8 + 6,
          color: colors[Math.floor(Math.random() * colors.length)],
          speedX: Math.random() * 4 - 2,
          speedY: Math.random() * 5 + 4,
          rotation: Math.random() * 360,
          rotationSpeed: Math.random() * 4 - 2,
          opacity: 1
        });
      }
    }

    const launchFirework = () => {
      const x = Math.random() * (width - 200) + 100;
      const y = height + 10;
      const targetY = Math.random() * (height * 0.4) + height * 0.15;
      const color = colors[Math.floor(Math.random() * colors.length)];
      fireworks.push({
        x,
        y,
        targetY,
        speedY: -(Math.random() * 6 + 8),
        color,
        exploded: false,
        sparks: []
      });
    };

    if (confettiStyle === 'fireworks') {
      for (let i = 0; i < 4; i++) {
        setTimeout(launchFirework, i * 400);
      }
    }

    const createSparks = (x: number, y: number, color: string) => {
      const sparks: Spark[] = [];
      const count = 60;
      for (let i = 0; i < count; i++) {
        sparks.push({
          x,
          y,
          color,
          angle: Math.random() * Math.PI * 2,
          speed: Math.random() * 6 + 2,
          friction: 0.96,
          gravity: 0.15,
          opacity: 1,
          decay: Math.random() * 0.015 + 0.01,
          size: Math.random() * 2 + 1
        });
      }
      return sparks;
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      if (confettiStyle === 'confetti') {
        let activeParticles = 0;
        particles.forEach((p) => {
          p.y += p.speedY;
          p.x += p.speedX;
          p.rotation += p.rotationSpeed;

          if (p.y > height) {
            p.opacity -= 0.02;
          }

          if (p.opacity > 0) {
            activeParticles++;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.opacity;
            if (p.size % 2 === 0) {
              ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            } else {
              ctx.beginPath();
              ctx.moveTo(0, -p.size / 2);
              ctx.lineTo(p.size / 2, p.size / 2);
              ctx.lineTo(-p.size / 2, p.size / 2);
              ctx.closePath();
              ctx.fill();
            }
            ctx.restore();
          }
        });

        if (activeParticles > 0) {
          animationFrameId = requestAnimationFrame(animate);
        } else {
          ctx.clearRect(0, 0, width, height);
        }
      } else if (confettiStyle === 'fireworks') {
        let activeFireworks = 0;
        
        fireworks.forEach((fw) => {
          if (!fw.exploded) {
            fw.y += fw.speedY;
            
            ctx.beginPath();
            ctx.arc(fw.x, fw.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = '#FFFFFF';
            ctx.fill();
            
            ctx.beginPath();
            ctx.moveTo(fw.x, fw.y);
            ctx.lineTo(fw.x, fw.y - fw.speedY * 2);
            ctx.strokeStyle = fw.color;
            ctx.globalAlpha = 0.5;
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.globalAlpha = 1.0;

            if (fw.y <= fw.targetY) {
              fw.exploded = true;
              fw.sparks = createSparks(fw.x, fw.y, fw.color);
            }
            activeFireworks++;
          } else {
            let activeSparks = 0;
            fw.sparks.forEach((spark) => {
              spark.speed *= spark.friction;
              spark.x += Math.cos(spark.angle) * spark.speed;
              spark.y += Math.sin(spark.angle) * spark.speed + spark.gravity;
              spark.opacity -= spark.decay;

              if (spark.opacity > 0) {
                activeSparks++;
                ctx.beginPath();
                ctx.arc(spark.x, spark.y, spark.size, 0, Math.PI * 2);
                ctx.fillStyle = spark.color;
                ctx.globalAlpha = spark.opacity;
                ctx.fill();
              }
            });
            if (activeSparks > 0) {
              activeFireworks++;
            }
          }
        });

        if (activeFireworks > 0 || fireworks.length < 8) {
          if (fireworks.length < 8 && Math.random() < 0.02) {
            launchFirework();
          }
          animationFrameId = requestAnimationFrame(animate);
        } else {
          ctx.clearRect(0, 0, width, height);
        }
      }
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [confettiStyle]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 w-full h-full"
    />
  );
};

export default function StudentDashboard() {
  const router = useRouter();
  const authSupabase = createAuthClient();

  // Onboarding profile states
  const [profile, setProfile] = useState<any>({
    username: 'Vaishnavi Raparthy',
    country: 'India',
    college: 'Vellore Institute of Technology',
    degree: 'B.Tech',
    branch: 'Computer Science',
    graduation_year: 2026,
    primary_goal: 'Campus Placements',
    target_timeline: 'Within 3 Months',
    weekly_commitment: '5–10 Hours',
    learning_preference: 'Concept + Practice'
  });

  const [currentRole, setCurrentRole] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [themeMounted, setThemeMounted] = useState(false);

  // Profile Save Message state
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setThemeMounted(true);
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');

    // Sync tab from URL parameters to support external routing
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam && ['dashboard', 'learning', 'practice', 'mockTests', 'careerHub', 'leaderboards', 'profile', 'settings'].includes(tabParam)) {
        setActiveSidebarTab(tabParam as any);
      }
    }
  }, []);

  const toggleTheme = () => {
    document.documentElement.classList.add('theme-transitioning');
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 500);
  };

  const [solvedCount, setSolvedCount] = useState(12);
  const [streak, setStreak] = useState(14); // Simulated active streak
  const [bookmarks, setBookmarks] = useState<string[]>(['Q-8029-X']); 
  const [activeSidebarTab, setActiveSidebarTab] = useState<'dashboard' | 'learning' | 'practice' | 'mockTests' | 'careerHub' | 'leaderboards' | 'profile' | 'settings' | 'badges'>('dashboard');

  const [badges, setBadges] = useState<any[]>(MOCK_BADGES_DATA);
  const [unlockedBadgeIds, setUnlockedBadgeIds] = useState<string[]>([]);
  const [justUnlockedBadge, setJustUnlockedBadge] = useState<any | null>(null);

  // Custom Settings States
  const [dailyXpGoal, setDailyXpGoal] = useState<number>(100);
  const [tiltEnabled, setTiltEnabled] = useState<boolean>(true);
  const [confettiStyle, setConfettiStyle] = useState<'confetti' | 'fireworks' | 'none'>('confetti');
  const [soundWaveActive, setSoundWaveActive] = useState<boolean>(false);
  const [accentColor, setAccentColor] = useState<string>('blue');
  const [layoutDensity, setLayoutDensity] = useState<'compact' | 'normal' | 'spacious'>('normal');
  const [celebrationActive, setCelebrationActive] = useState<boolean>(false);

  // Footer state variables
  const [footerBadgeText, setFooterBadgeText] = useState('Operational Clearance: Sandbox Encrypted');
  const [footerCopyright, setFooterCopyright] = useState('© 2026 Aptitude AI platform. All rights reserved.');

  // Opportunities state
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [selectedOpportunityType, setSelectedOpportunityType] = useState<string>('All');
  const [expandedOpportunityId, setExpandedOpportunityId] = useState<string | null>(null);
  const [oppsLoading, setOppsLoading] = useState(true);

  // Announcements state
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);

  // Leaderboard state
  const [activeLeaderboardTab, setActiveLeaderboardTab] = useState<'college' | 'global' | 'friends'>('college');

  // Interactive Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<string, boolean>>({});
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  // Hardcoded premium fallback data
  const DEFAULT_OPPORTUNITIES = [
    { id: 'opt-1', title: 'TCS NQT National Qualifier Test', organization: 'Tata Consultancy Services', type: 'Hiring', deadline: 'July 28', days_remaining: 12, status: 'Closing Soon', details: 'Access the TCS National Qualifier Test for multiple systems roles. Open to 2025/2026 batches.', link: 'https://nextstep.tcs.com/' },
    { id: 'opt-2', title: 'SWE Intern - Product Engineering', organization: 'Microsoft India', type: 'Internship', deadline: 'August 15', days_remaining: 30, status: 'New', details: '3-month summer internship working with the Azure cloud networking tools team in Hyderabad.', link: 'https://careers.microsoft.com/' },
    { id: 'opt-3', title: 'SSC CGL Executive Officers Recruitment', organization: 'Staff Selection Commission', type: 'Government Exam', deadline: 'June 30', days_remaining: 5, status: 'Open', details: 'Staff Selection Commission Combined Graduate Level Examination for assistant audit officers.', link: 'https://ssc.gov.in/' },
    { id: 'opt-4', title: 'Stripe Global FinTech Hackathon', organization: 'Stripe Inc.', type: 'Hackathon', deadline: 'July 10', days_remaining: 18, status: 'Open', details: 'Build next-generation payment interfaces using API integrations. Total prize pool $50,000.', link: 'https://stripe.com/' },
    { id: 'opt-6', title: 'UPSC Civil Services Prelims 2026', organization: 'Union Public Service Commission', type: 'Government Exam', deadline: 'March 15', days_remaining: 0, status: 'Expired', details: 'Union Public Service Commission civil services main stage registration portals.', link: 'https://upsc.gov.in/' }
  ];

  const DEFAULT_ANNOUNCEMENTS = [
    { id: 'ann-1', title: 'Goldman Sachs Mock assessment goes live this Sunday', type: 'Notice', content: 'The weekly simulated mock assessment designed for Goldman Sachs preparation window begins at 10:00 AM on Sunday. Make sure your local sandbox compiler is synced.', publisher: 'Placement Coordinator', priority: 'High', date: 'June 4' },
    { id: 'ann-2', title: 'New Verbal Reasoning modules added to the Practice Arena', type: 'New Course', content: 'We have introduced 15 new high-fidelity sets on grammatical corrections, modifiers, and syntax maps under the Verbal Ability section.', publisher: 'Content Team', priority: 'Medium', date: 'June 2' },
    { id: 'ann-3', title: 'Dynamic Career Opportunities Hub integration completed', type: 'Platform', content: 'You can now view live hiring drives, internships, government exams, hackathons, and webinars directly from your unified Command Center.', publisher: 'Dev Team', priority: 'High', date: 'June 1' }
  ];

  // Load user badges
  const loadBadges = async (userId: string) => {
    try {
      // 1. Fetch all badges
      const { data: dbBadges, error: badgesError } = await supabase
        .from('badges')
        .select('*')
        .order('level', { ascending: true });

      if (badgesError) throw badgesError;

      let mappedBadges = MOCK_BADGES_DATA;
      if (dbBadges && dbBadges.length > 0) {
        mappedBadges = dbBadges
          .filter((b: any) => (b.badge_category || b.category || '').toLowerCase().includes('started'))
          .map((b: any) => ({
            id: b.id,
            name: b.badge_name || b.name,
            category: 'getting_started',
            description: b.description,
            image_url: b.image_url,
            level: b.level
          }));
      }
      setBadges(mappedBadges);

      // 2. Fetch unlocked user badges
      const { data: dbUserBadges, error: userBadgesError } = await supabase
        .from('user_badges')
        .select('badge_id')
        .eq('user_id', userId);

      if (userBadgesError) throw userBadgesError;

      if (dbUserBadges) {
        const ids = dbUserBadges.map((ub: any) => ub.badge_id);
        
        // Retrospectively unlock Getting Started if onboarding is completed
        const hasOnboarding = localStorage.getItem('aptitude_onboarding_completed') === 'true';
        const gettingStartedBadge = mappedBadges.find(b => b.name === 'Getting Started');
        if (hasOnboarding && gettingStartedBadge && !ids.includes(gettingStartedBadge.id)) {
          ids.push(gettingStartedBadge.id);
          try {
            await supabase.from('user_badges').insert({
              user_id: userId,
              badge_id: gettingStartedBadge.id,
              unlocked_at: new Date().toISOString()
            });
          } catch (e) {}
        }

        setUnlockedBadgeIds(ids);
        localStorage.setItem('aptitude_unlocked_badges', JSON.stringify(ids));
      }
    } catch (err) {
      console.warn("Could not load badges from database, checking local storage:", err);
      const stored = localStorage.getItem('aptitude_unlocked_badges');
      if (stored) {
        try {
          setUnlockedBadgeIds(JSON.parse(stored));
        } catch (e) {}
      } else {
        const initialUnlocked = [];
        if (localStorage.getItem('aptitude_onboarding_completed') === 'true') {
          initialUnlocked.push('gs_getting_started');
        }
        const currentSolved = Number(localStorage.getItem('aptitude_solved_count') || solvedCount);
        const currentStreak = Number(localStorage.getItem('aptitude_streak') || streak);
        if (currentSolved >= 1) initialUnlocked.push('gs_first_step');
        if (currentSolved >= 10) initialUnlocked.push('gs_keep_going');
        if (currentStreak >= 3) initialUnlocked.push('gs_on_track');
        if (currentStreak >= 5) initialUnlocked.push('gs_not_stopping');

        setUnlockedBadgeIds(initialUnlocked);
        localStorage.setItem('aptitude_unlocked_badges', JSON.stringify(initialUnlocked));
      }
    }
  };

  // Unlock / Award badge
  const awardBadge = async (badgeId: string) => {
    // 1. Map client-side string ID to real database UUID or name
    const BADGE_ID_NAME_MAP: Record<string, string> = {
      'gs_first_step': 'First Step',
      'gs_getting_started': 'Getting Started',
      'gs_curious_mind': 'Curious Mind',
      'gs_learning_begins': 'Learning Begins',
      'gs_first_challenge': 'First Challenge',
      'gs_keep_going': 'Keep Going',
      'gs_early_bird': 'Early Bird',
      'gs_on_track': 'On Track',
      'gs_not_stopping': 'Not Stopping',
    };

    const targetName = BADGE_ID_NAME_MAP[badgeId] || badgeId;
    const badgeDetails = badges.find(b => b.name === targetName || b.id === badgeId) || MOCK_BADGES_DATA.find(b => b.id === badgeId);

    if (!badgeDetails) return;

    // Use the badge's actual ID (which will be UUID from db, or gs_ string ID from mock fallback)
    const dbBadgeId = badgeDetails.id;

    if (unlockedBadgeIds.includes(dbBadgeId)) return;

    console.log(`Unlocking Badge: ${badgeDetails.name} (${dbBadgeId})`);
    const updated = [...unlockedBadgeIds, dbBadgeId];
    setUnlockedBadgeIds(updated);
    localStorage.setItem('aptitude_unlocked_badges', JSON.stringify(updated));

    setJustUnlockedBadge(badgeDetails);
    // Trigger chime & celebration
    playPreviewChime();
    triggerCelebration();

    try {
      const { data: { session } } = await authSupabase.auth.getSession();
      if (session?.user) {
        await supabase.from('user_badges').insert({
          user_id: session.user.id,
          badge_id: dbBadgeId,
          unlocked_at: new Date().toISOString()
        });
      }
    } catch (err) {
      console.warn("Could not save unlocked badge in database:", err);
    }
  };

  const triggerCelebration = () => {
    if (confettiStyle === 'none') return;
    setCelebrationActive(true);
    setTimeout(() => {
      setCelebrationActive(false);
    }, 6000);
  };

  const playPreviewChime = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const now = ctx.currentTime;
      
      // Note 1 (E5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.15, now + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.6);

      // Note 2 (A5)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880.00, now + 0.1);
      gain2.gain.setValueAtTime(0, now + 0.1);
      gain2.gain.linearRampToValueAtTime(0.2, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.9);

      // Note 3 (C#6)
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(1109.73, now + 0.2);
      gain3.gain.setValueAtTime(0, now + 0.2);
      gain3.gain.linearRampToValueAtTime(0.25, now + 0.25);
      gain3.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.start(now + 0.2);
      osc3.stop(now + 1.2);
      
      setSoundWaveActive(true);
      setTimeout(() => {
        setSoundWaveActive(false);
      }, 1200);
    } catch (e) {
      console.warn("Audio blocked or not supported:", e);
    }
  };

  const handleAccentColorChange = (color: string) => {
    setAccentColor(color);
    localStorage.setItem('aptitude_accent_color', color);
  };

  const handleDensityChange = (density: 'compact' | 'normal' | 'spacious') => {
    setLayoutDensity(density);
    localStorage.setItem('aptitude_layout_density', density);
  };

  const handleMouseMove3D = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tiltEnabled) return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    const rotateX = -(y - yc) / (rect.height / 10);
    const rotateY = (x - xc) / (rect.width / 10);
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    card.style.transition = 'transform 0.05s ease-out';
  };

  const handleMouseLeave3D = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    card.style.transition = 'transform 0.5s ease-out';
  };

  // Sync profile details
  useEffect(() => {
    // Load footer settings from localStorage
    const savedFooterBadge = localStorage.getItem('aptitude_footer_badge_text');
    if (savedFooterBadge) setFooterBadgeText(savedFooterBadge);
    
    const savedFooterCopyright = localStorage.getItem('aptitude_footer_copyright');
    if (savedFooterCopyright) setFooterCopyright(savedFooterCopyright);

    // Load custom settings
    const savedDailyXp = localStorage.getItem('aptitude_daily_xp_goal');
    if (savedDailyXp) setDailyXpGoal(Number(savedDailyXp));

    const savedTiltEnabled = localStorage.getItem('aptitude_tilt_enabled');
    if (savedTiltEnabled !== null) setTiltEnabled(savedTiltEnabled === 'true');

    const savedConfettiStyle = localStorage.getItem('aptitude_confetti_style');
    if (savedConfettiStyle) setConfettiStyle(savedConfettiStyle as any);

    const savedAccentColor = localStorage.getItem('aptitude_accent_color');
    if (savedAccentColor) setAccentColor(savedAccentColor);

    const savedDensity = localStorage.getItem('aptitude_layout_density');
    if (savedDensity) setLayoutDensity(savedDensity as any);

    // 1. Sync active account credentials
    const roleStored = localStorage.getItem('aptitude_current_role');
    if (roleStored) {
      try {
        const parsed = JSON.parse(roleStored);
        setCurrentRole(parsed);
      } catch (e) {
        console.warn(e);
      }
    }

    const syncSession = async () => {
      const { data: { session } } = await authSupabase.auth.getSession();
      if (session?.user) {
        // Load badges for active user
        loadBadges(session.user.id);

        const { data: profileObj } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle();

        const isSarah = session.user.email === 'sarah.c@aptitude-ai.com';
        const isMarcus = session.user.email === 'marcus.w@aptitude-ai.com';
        const userRole = (profileObj?.role === 'ADMIN' || isSarah || isMarcus) ? 'admin' : 'STUDENT';
        
        const roleObj = {
          role: userRole === 'admin' ? (isMarcus ? 'editor' : 'admin') : 'STUDENT',
          name: session.user.email?.split('@')[0].toUpperCase() || 'STUDENT',
          email: session.user.email,
          avatar: session.user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
        };

        // Preserve manually toggled admin/preview role across reloads
        const roleStored = localStorage.getItem('aptitude_current_role');
        if (roleStored) {
          try {
            const parsed = JSON.parse(roleStored);
            roleObj.role = parsed.role;
            roleObj.name = parsed.name || roleObj.name;
          } catch (_) {}
        }

        localStorage.setItem('aptitude_current_role', JSON.stringify(roleObj));
        setCurrentRole(roleObj);

        if (!localStorage.getItem('aptitude_onboarding_data')) {
          const { data: onboardingData } = await supabase
            .from('onboarding_profile')
            .select('*')
            .eq('user_id', session.user.id)
            .maybeSingle();

          if (onboardingData) {
            localStorage.setItem('aptitude_onboarding_completed', 'true');
            localStorage.setItem('aptitude_onboarding_data', JSON.stringify(onboardingData));
            setProfile(onboardingData);
          }
        }
      } else {
        // Guest mode fallback
        loadBadges('guest');
      }
    };
    syncSession();

    // 2. Sync onboarding variables
    const onboardingStored = localStorage.getItem('aptitude_onboarding_data');
    if (onboardingStored) {
      try {
        const data = JSON.parse(onboardingStored);
        setProfile((prev: any) => ({
          ...prev,
          username: data.username || prev.username,
          college: data.college || prev.college,
          degree: data.degree || prev.degree,
          branch: data.branch || prev.branch,
          primary_goal: data.primary_goal || prev.primary_goal,
          target_timeline: data.target_timeline || prev.target_timeline,
          weekly_commitment: data.weekly_commitment || prev.weekly_commitment,
          learning_preference: data.learning_preference || prev.learning_preference
        }));
      } catch (e) {
        console.warn(e);
      }
    }

    // 3. Load catalog questions
    const loadCatalog = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('questions')
          .select(`
            id,
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
            )
          `);

        if (error) throw error;

        if (data && data.length > 0) {
          const mapped: Question[] = data.map((q: any) => {
            const domainName = q.concept?.sub_topic?.domain?.name || 'Quantitative Aptitude';
            let resolvedDomainId = 'quant';
            if (domainName.toLowerCase().includes('logical')) resolvedDomainId = 'logical';
            if (domainName.toLowerCase().includes('verbal')) resolvedDomainId = 'verbal';

            return {
              id: q.id,
              domainId: resolvedDomainId,
              subTopicId: q.concept?.sub_topic?.id || 'arithmetic',
              conceptId: q.concept?.id || 'percentages',
              difficulty: q.difficulty || 'MEDIUM',
              companyTags: [],
              shuffleOptions: false,
              questionStem: q.question_text || '',
              hintText: q.explanation || '',
              options: Array.isArray(q.options) 
                ? q.options.map((opt: any, index: number) => ({
                    id: opt.id || String.fromCharCode(65 + index),
                    text: opt.text || '',
                    isCorrect: opt.isCorrect || false,
                    metadata: opt.metadata || ''
                  }))
                : [],
              videoUrl: q.video_url || '',
              status: q.is_active ? 'Published' : 'Draft',
              createdAt: 'Today'
            };
          });
          setQuestions(mapped);
        } else {
          // Local storage fallback
          const stored = localStorage.getItem('aptitude_questions');
          if (stored) {
            setQuestions(JSON.parse(stored));
          } else {
            setQuestions(SAMPLE_QUESTIONS);
          }
        }
      } catch (err) {
        console.warn('Student Dashboard Supabase Sync error:', err);
        const stored = localStorage.getItem('aptitude_questions');
        if (stored) {
          setQuestions(JSON.parse(stored));
        } else {
          setQuestions(SAMPLE_QUESTIONS);
        }
      } finally {
        setIsLoading(false);
      }
    };

    // 4. Fetch Opportunities from Supabase
    const fetchOpportunities = async () => {
      setOppsLoading(true);
      try {
        const { data, error } = await supabase
          .from('opportunities')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data && data.length > 0) {
          setOpportunities(data);
        } else {
          setOpportunities(DEFAULT_OPPORTUNITIES);
        }
      } catch (e) {
        console.warn('Opportunities fetch failed, loading presets:', e);
        setOpportunities(DEFAULT_OPPORTUNITIES);
      } finally {
        setOppsLoading(false);
      }
    };

    // 5. Fetch Announcements from Supabase
    const fetchAnnouncements = async () => {
      setAnnouncementsLoading(true);
      try {
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data && data.length > 0) {
          setAnnouncements(data);
        } else {
          setAnnouncements(DEFAULT_ANNOUNCEMENTS);
        }
      } catch (e) {
        console.warn('Announcements fetch failed, loading presets:', e);
        setAnnouncements(DEFAULT_ANNOUNCEMENTS);
      } finally {
        setAnnouncementsLoading(false);
      }
    };

    loadCatalog();
    fetchOpportunities();
    fetchAnnouncements();
  }, []);

  // Filter logic
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      // Status must be published to show to students
      if (q.status && q.status !== 'Published') return false;

      // 1. Text Search Filter
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesStem = q.questionStem.toLowerCase().includes(query);
        const matchesId = q.id.toLowerCase().includes(query);
        if (!matchesStem && !matchesId) return false;
      }

      // 2. Domain Filter
      if (selectedDomain !== 'All' && q.domainId !== selectedDomain) {
        return false;
      }

      // 3. Difficulty Filter
      if (selectedDifficulty !== 'All' && q.difficulty !== selectedDifficulty) {
        return false;
      }

      return true;
    });
  }, [questions, searchQuery, selectedDomain, selectedDifficulty]);

  // Filtered Opportunities (for Career Hub view and dashboard preview)
  const filteredOpportunities = useMemo(() => {
    if (selectedOpportunityType === 'All') return opportunities;
    // Map custom sub-tabs in career hub to opportunity types
    const mappedType = 
      selectedOpportunityType === 'Hiring Drives' ? 'Hiring' :
      selectedOpportunityType === 'Internships' ? 'Internship' :
      selectedOpportunityType === 'Government Exams' ? 'Government Exam' :
      selectedOpportunityType === 'Hackathons' ? 'Hackathon' :
      selectedOpportunityType;
    return opportunities.filter(o => o.type === mappedType);
  }, [opportunities, selectedOpportunityType]);

  // Handle bookmarks
  const toggleBookmark = (id: string) => {
    setBookmarks(prev => {
      const next = prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id];
      const count = next.length;
      if (count >= 1) {
        awardBadge('gs_curious_mind');
      }
      if (count >= 5) {
        awardBadge('gs_learning_begins');
      }
      return next;
    });
  };

  // Submit Answer validation
  const handleAnswerSelect = (questionId: string, optionId: string) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionId }));
    setSubmittedAnswers(prev => ({ ...prev, [questionId]: true }));

    // Increment solvedCount if correct
    const targetQ = questions.find(q => q.id === questionId);
    const targetOpt = targetQ?.options.find(o => o.id === optionId);
    if (targetOpt?.isCorrect && !submittedAnswers[questionId]) {
      const newSolvedCount = solvedCount + 1;
      const newStreak = streak + 1;
      setSolvedCount(newSolvedCount);
      setStreak(newStreak);

      localStorage.setItem('aptitude_solved_count', String(newSolvedCount));
      localStorage.setItem('aptitude_streak', String(newStreak));

      // Save user progress row to Supabase
      const saveProgress = async () => {
        try {
          const { data: { session } } = await authSupabase.auth.getSession();
          if (session?.user) {
            await supabase
              .from('user_progress')
              .upsert({
                user_id: session.user.id,
                question_id: questionId,
                is_solved: true,
                solved_at: new Date().toISOString()
              }, { onConflict: 'user_id,question_id' });
          }
        } catch (e) {
          console.warn("Could not save user progress to database:", e);
        }
      };
      saveProgress();

      // Award Standalone Getting Started Badges (Phase 1)
      if (newSolvedCount >= 1) {
        awardBadge('gs_first_step');
      }
      if (newSolvedCount >= 10) {
        awardBadge('gs_keep_going');
      }
      if (newStreak >= 3) {
        awardBadge('gs_on_track');
      }
      if (newStreak >= 5) {
        awardBadge('gs_not_stopping');
      }
      const currentHour = new Date().getHours();
      if (currentHour >= 4 && currentHour < 7) {
        awardBadge('gs_early_bird');
      }

    }
  };

  // Solution drawer toggle
  const toggleSolution = (id: string) => {
    setRevealedSolutions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleLogout = async () => {
    await authSupabase.auth.signOut();
    localStorage.removeItem('aptitude_current_role');
    
    // Clear mock session cookies
    document.cookie = 'aptitude_mock_auth=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax';
    document.cookie = 'aptitude_onboarding_completed=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax';
    
    router.push('/');
  };

  // Save profile updates
  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('aptitude_onboarding_data', JSON.stringify(profile));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Calculate dynamic daily challenge progress (Starts at 8, increments up to 15)
  const challengeCompletedCount = useMemo(() => {
    return Math.min(15, 8 + (solvedCount - 12));
  }, [solvedCount]);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 dark:bg-[#030712] dark:text-slate-100 font-sans overflow-hidden antialiased relative transition-colors duration-300">
      
      {/* Glow Backdrops */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-blue-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full bg-indigo-600/5 blur-[140px] pointer-events-none" />

      {/* 1. Left Navigation Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-950/80 border-r border-slate-200 dark:border-slate-900 flex flex-col h-screen shrink-0 z-20 relative backdrop-blur-xl transition-colors duration-300">
        <div className="p-6 border-b border-slate-100 dark:border-slate-900/60 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-650 flex items-center justify-center text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]">
            <Layers className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-slate-900 dark:text-white tracking-tight text-sm leading-tight">
              KINETIC HUB
            </span>
            <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 tracking-widest uppercase mt-0.5">
              Command Center
            </span>
          </div>
        </div>

        {/* Sidebar Tabs */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          
          {/* Dashboard Tab */}
          <button 
            onClick={() => setActiveSidebarTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              activeSidebarTab === 'dashboard'
                ? `${getAccentClass(accentColor, 'combined')} shadow-xs`
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border-transparent dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900'
            }`}
          >
            <Compass className="w-4.5 h-4.5" />
            <span>Dashboard</span>
          </button>
          
          {/* Domains Tab */}
          <button 
            onClick={() => router.push('/student/domains')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900"
          >
            <Layers className="w-4.5 h-4.5" />
            <span>Domains</span>
          </button>
          
          {/* Learning Tab */}
          <button 
            onClick={() => setActiveSidebarTab('learning')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              activeSidebarTab === 'learning'
                ? `${getAccentClass(accentColor, 'combined')} shadow-xs`
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border-transparent dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900'
            }`}
          >
            <BookOpen className="w-4.5 h-4.5" />
            <span>Learning</span>
          </button>

          {/* Practice Arena Tab */}
          <button 
            onClick={() => setActiveSidebarTab('practice')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              activeSidebarTab === 'practice'
                ? `${getAccentClass(accentColor, 'combined')} shadow-xs`
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border-transparent dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900'
            }`}
          >
            <BookOpenCheck className="w-4.5 h-4.5" />
            <span>Practice Arena</span>
          </button>

          {/* Mock Tests Tab */}
          <button 
            onClick={() => setActiveSidebarTab('mockTests')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              activeSidebarTab === 'mockTests'
                ? `${getAccentClass(accentColor, 'combined')} shadow-xs`
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border-transparent dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900'
            }`}
          >
            <Award className="w-4.5 h-4.5" />
            <span>Mock Tests</span>
          </button>

          {/* Career Hub Tab */}
          <button 
            onClick={() => {
              setActiveSidebarTab('careerHub');
              setSelectedOpportunityType('All');
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              activeSidebarTab === 'careerHub'
                ? `${getAccentClass(accentColor, 'combined')} shadow-xs`
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border-transparent dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900'
            }`}
          >
            <Briefcase className="w-4.5 h-4.5" />
            <span>Career Hub</span>
          </button>

          {/* Leaderboards Tab */}
          <button 
            onClick={() => setActiveSidebarTab('leaderboards')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              activeSidebarTab === 'leaderboards'
                ? `${getAccentClass(accentColor, 'combined')} shadow-xs`
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border-transparent dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900'
            }`}
          >
            <Trophy className="w-4.5 h-4.5" />
            <span>Leaderboards</span>
          </button>

          {/* Achievements Tab */}
          <button 
            onClick={() => setActiveSidebarTab('badges')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              activeSidebarTab === 'badges'
                ? `${getAccentClass(accentColor, 'combined')} shadow-xs`
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border-transparent dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900'
            }`}
          >
            <Award className="w-4.5 h-4.5" />
            <span>Achievements</span>
          </button>

          {/* Profile Tab */}
          <button 
            onClick={() => setActiveSidebarTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              activeSidebarTab === 'profile'
                ? `${getAccentClass(accentColor, 'combined')} shadow-xs`
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border-transparent dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900'
            }`}
          >
            <User className="w-4.5 h-4.5" />
            <span>Profile</span>
          </button>

          {/* Settings Tab */}
          <button 
            onClick={() => setActiveSidebarTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              activeSidebarTab === 'settings'
                ? `${getAccentClass(accentColor, 'combined')} shadow-xs`
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border-transparent dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900'
            }`}
          >
            <SettingsIcon className="w-4.5 h-4.5" />
            <span>Settings</span>
          </button>

          {/* Admin Tools Section */}
          {currentRole?.role === 'admin' && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-900 mt-4 space-y-1 select-none animate-fadeIn">
              <span className="px-4 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">Admin Tools</span>
              <button 
                onClick={() => router.push('/admin/editor')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900 cursor-pointer text-left"
              >
                <SettingsIcon className="w-4.5 h-4.5 text-blue-600 dark:text-blue-450" />
                <span>Content Creator</span>
              </button>
              <button 
                onClick={() => router.push('/admin/dashboard')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900 cursor-pointer text-left"
              >
                <Layers className="w-4.5 h-4.5 text-blue-600 dark:text-blue-450" />
                <span>Admin Dashboard</span>
              </button>
            </div>
          )}

          {/* Core User Stats inside Sidebar */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-900 mt-4 space-y-2.5">
            <div className="px-4 py-2 bg-slate-50/80 rounded-xl border border-slate-200 dark:bg-slate-900/40 dark:border-slate-900 flex items-center justify-between text-[11px] font-bold">
              <span className="text-slate-500 dark:text-slate-400">Solved Count</span>
              <span className="text-blue-600 dark:text-blue-400 font-mono">{solvedCount} items</span>
            </div>
            <div className="px-4 py-2 bg-slate-50/80 rounded-xl border border-slate-200 dark:bg-slate-900/40 dark:border-slate-900 flex items-center justify-between text-[11px] font-bold">
              <span className="text-slate-500 dark:text-slate-400">Active Streak</span>
              <span className="text-amber-600 dark:text-amber-400 font-mono flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-pulse" /> {streak} Days
              </span>
            </div>
          </div>
        </nav>

        {/* User profile & Logout */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-900/85 space-y-3 shrink-0">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent transition-colors cursor-pointer text-left dark:text-rose-400 dark:hover:text-rose-300 dark:hover:bg-rose-950/20"
          >
            <LogOut className="w-4.5 h-4.5" />
            <span>Sign Out Profile</span>
          </button>
          <div className="flex items-center justify-center gap-1.5 text-[9px] text-slate-400 dark:text-slate-500 font-semibold select-none">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Operational SSL sandbox</span>
          </div>
        </div>
      </aside>

      {/* 2. Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-900 px-8 flex items-center justify-between bg-white/70 dark:bg-slate-950/50 backdrop-blur-xl transition-colors duration-300 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest">Active goal:</span>
            <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider border transition-all duration-300 ${getAccentClass(accentColor, 'combined')}`}>
              {profile.primary_goal}
            </span>
          </div>
          <div className="flex items-center gap-5">
            
            {/* Preview/Edit Switcher */}
            <div className="flex bg-slate-105 dark:bg-slate-900 p-0.5 rounded-full border border-slate-200 dark:border-slate-800 shadow-inner select-none mr-2">
              <button
                type="button"
                onClick={() => {
                  const studentRole = {
                    role: 'STUDENT',
                    name: 'Vaishnavi Raparthy',
                    email: 'student@aptitude-ai.com',
                    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                  };
                  localStorage.setItem('aptitude_current_role', JSON.stringify(studentRole));
                  setCurrentRole(studentRole);
                }}
                className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  currentRole?.role !== 'admin'
                    ? 'bg-white dark:bg-slate-950 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/5 dark:border-white/5 font-extrabold'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Preview
              </button>
              <button
                type="button"
                onClick={() => {
                  const adminRole = {
                    role: 'admin',
                    name: 'SARAH CONNOR',
                    email: 'sarah.c@aptitude-ai.com',
                    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                  };
                  localStorage.setItem('aptitude_current_role', JSON.stringify(adminRole));
                  setCurrentRole(adminRole);
                  router.push('/admin/editor');
                }}
                className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  currentRole?.role === 'admin'
                    ? 'bg-white dark:bg-slate-950 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/5 dark:border-white/5 font-extrabold'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Edit / Admin
              </button>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-450 dark:hover:text-white hover:scale-110 hover:shadow-[0_0_12px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_0_12px_rgba(255,255,255,0.15)] transition-all duration-300 cursor-pointer select-none"
              title="Toggle theme"
              suppressHydrationWarning
            >
              {themeMounted && theme === 'light' ? (
                <Sun className="w-[18px] h-[18px] text-amber-500 animate-fadeIn" />
              ) : (
                <Moon className="w-[18px] h-[18px] text-indigo-400 animate-fadeIn" />
              )}
            </button>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

            <div className="flex items-center gap-3.5">
              <div className="text-right flex flex-col">
                <span className="text-[11.5px] font-black text-slate-900 dark:text-white">{profile.username}</span>
                <span className="text-[9px] text-slate-500 dark:text-slate-500 font-bold uppercase tracking-wider">{profile.degree} · {profile.branch}</span>
              </div>
              <div className="w-8.5 h-8.5 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-650 flex items-center justify-center font-black text-xs text-white uppercase shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                {profile.username ? profile.username[0] : 'V'}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Panel Area */}
        <div className={`flex-1 overflow-y-auto custom-scrollbar flex flex-col justify-between ${
          layoutDensity === 'compact' ? 'p-4' : layoutDensity === 'spacious' ? 'p-10' : 'p-6 sm:p-8'
        }`}>


          {/* ====================================================================
              1. TAB: DASHBOARD (Duolingo Redesign Layout)
              ==================================================================== */}
          {activeSidebarTab === 'dashboard' && (
            <div className="w-full space-y-8 animate-fadeIn">
              
              {/* Admin Banner Alert */}
              {currentRole?.role === 'admin' && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-blue-50/80 border border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/40 text-blue-800 dark:text-blue-400 animate-fadeIn shadow-xs select-none">
                  <div className="flex items-center gap-3">
                    <span className="p-2 rounded-lg bg-blue-650 text-white shadow-xs">
                      <SettingsIcon className="w-4 h-4 animate-pulse" />
                    </span>
                    <div className="text-left">
                      <h4 className="text-xs font-black uppercase tracking-wider leading-none">Editor Mode Activated</h4>
                      <p className="text-[10px] font-semibold text-slate-550 dark:text-slate-400 mt-1.5 leading-relaxed">
                        You are now modifying student view elements. You can edit footer copyright credentials directly in-place or manage platform questions in the editor.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push('/admin/editor')}
                    className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black text-[9px] uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 cursor-pointer whitespace-nowrap"
                  >
                    <span>Open Content Creator</span>
                    <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              )}
              
              {/* Hero Progress Card */}
              <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/20 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-300 shadow-md hover:shadow-lg">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.06),transparent_50%)] pointer-events-none" />
                
                {/* Hero Info (Left) */}
                <div className="space-y-4 text-center md:text-left relative z-10">
                  <div className="space-y-1">
                    <span className={`text-xs font-extrabold uppercase tracking-widest ${getAccentClass(accentColor, 'text')}`}>
                      Welcome back, {profile.username.split(' ')[0]} 👋
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-tight font-heading">
                      Continue Your Journey
                    </h1>
                    <p className="text-base font-bold text-slate-600 dark:text-slate-350 tracking-tight bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/40 px-3 py-1.5 rounded-xl inline-block">
                      Percentages → Profit & Loss
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <button 
                      onClick={() => setActiveSidebarTab('learning')}
                      className={`py-3 px-6 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 duration-200 ${getAccentClass(accentColor, 'button')}`}
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Resume Learning</span>
                    </button>
                    <button 
                      onClick={() => setActiveSidebarTab('practice')}
                      className="py-3 px-5 border border-slate-200 hover:border-slate-300 text-slate-650 hover:text-slate-900 dark:border-slate-800 dark:hover:border-slate-700 dark:text-slate-300 dark:hover:text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 bg-white/50 dark:bg-transparent"
                    >
                      <BookOpenCheck className="w-4 h-4" />
                      <span>Practice Arena</span>
                    </button>
                  </div>
                </div>

                {/* Progress Indicators & Mascot (Right) */}
                <div className="flex items-center gap-8 z-10 shrink-0 select-none flex-col sm:flex-row">
                  
                  {/* Mascot SVG */}
                  <div className="w-24 h-24 hover:scale-105 transition-all duration-300 relative">
                    <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_4px_12px_rgba(59,130,246,0.2)]">
                      {/* Mascot body */}
                      <circle cx="50" cy="50" r="40" fill="url(#gradMascot)" stroke={getHexColor(accentColor)} strokeWidth="2.5" />
                      
                      {/* Mascot eyes */}
                      <ellipse cx="38" cy="42" rx="7" ry="10" fill="#FFFFFF" />
                      <ellipse cx="62" cy="42" rx="7" ry="10" fill="#FFFFFF" />
                      
                      {/* Mascot pupils */}
                      <ellipse cx="38" cy="42" rx="3" ry="5" fill="#0F172A" />
                      <ellipse cx="62" cy="42" rx="3" ry="5" fill="#0F172A" />
                      
                      {/* Pupil shines */}
                      <circle cx="36" cy="39" r="1.5" fill="#FFFFFF" />
                      <circle cx="60" cy="39" r="1.5" fill="#FFFFFF" />

                      {/* Cheek blush */}
                      <circle cx="28" cy="54" r="3" fill="#F87171" opacity="0.6" />
                      <circle cx="72" cy="54" r="3" fill="#F87171" opacity="0.6" />
                      
                      {/* Mascot friendly smile */}
                      <path d="M 42 56 Q 50 63 58 56" stroke="#0F172A" strokeWidth="3" fill="transparent" strokeLinecap="round" />
                      
                      {/* Graduation Cap */}
                      <path d="M 22 26 L 50 14 L 78 26 L 50 38 Z" fill={getHexColor(accentColor)} stroke={getHexColor(accentColor)} strokeWidth="1.5" />
                      <path d="M 36 30 L 36 44 Q 50 48 64 44 L 64 30" fill="transparent" stroke={getHexColor(accentColor)} strokeWidth="2" />
                      {/* Tassel */}
                      <path d="M 50 24 L 76 34 L 78 40" fill="transparent" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
                      <circle cx="78" cy="41" r="1.5" fill="#F59E0B" />

                      {/* Sparkles */}
                      <path d="M 85 20 L 88 23 L 85 26 L 82 23 Z" fill="#F59E0B" className="animate-pulse" />

                      <defs>
                        <linearGradient id="gradMascot" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor={getHexColor(accentColor) + '88'} />
                          <stop offset="100%" stopColor={getHexColor(accentColor)} />
                        </linearGradient>
                      </defs>
                    </svg>
                    
                    <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white rounded-full p-1 border-2 border-white dark:border-[#030712] animate-bounce">
                      <Sparkles className="w-3.5 h-3.5 fill-white text-white" />
                    </div>
                  </div>

                  {/* Ring Progress Indicator */}
                  <div className="relative w-24 h-24 shrink-0 flex items-center justify-center bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <svg className="w-20 h-20 transform -rotate-90">
                      <circle cx="40" cy="40" r="32" stroke="rgba(226, 232, 240, 0.4)" strokeWidth="5" fill="transparent" className="dark:stroke-slate-850/50" />
                      <circle cx="40" cy="40" r="32" stroke={getHexColor(accentColor)} strokeWidth="5.5" fill="transparent" strokeDasharray="201" strokeDashoffset={201 - (201 * Math.min(120, dailyXpGoal)) / dailyXpGoal} strokeLinecap="round" className={`transition-all duration-1000 ${getAccentClass(accentColor, 'ring')}`} />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-base font-black font-mono text-slate-800 dark:text-white">{Math.min(100, Math.round((120 / dailyXpGoal) * 100))}%</span>
                      <span className="text-[7.5px] font-extrabold text-slate-400 uppercase tracking-wider">Done</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Quick Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                
                {/* Daily XP */}
                <div className="bg-white border border-slate-200 dark:bg-slate-900/10 dark:border-slate-900/60 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs hover:border-amber-500/20 transition-all duration-200 group">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-500 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Sparkles className="w-5 h-5 fill-current" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Daily XP</span>
                    <span className="text-base font-black text-slate-800 dark:text-white font-mono leading-tight">120 / {dailyXpGoal} XP</span>
                  </div>
                </div>

                {/* Streak */}
                <div className="bg-white border border-slate-200 dark:bg-slate-900/10 dark:border-slate-900/60 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs hover:border-orange-500/20 transition-all duration-200 group">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/20 text-orange-500 dark:text-orange-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Flame className="w-5 h-5 fill-current animate-pulse" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Streak</span>
                    <span className="text-base font-black text-slate-800 dark:text-white font-mono leading-tight">{streak} Days</span>
                  </div>
                </div>

                {/* Level */}
                <div className="bg-white border border-slate-200 dark:bg-slate-900/10 dark:border-slate-900/60 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs hover:border-current/20 transition-all duration-200 group">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border ${getAccentClass(accentColor, 'combined')}`}>
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Level</span>
                    <span className="text-base font-black text-slate-800 dark:text-white font-mono leading-tight">Lvl 12</span>
                  </div>
                </div>

                {/* Rank */}
                <div className="bg-white border border-slate-200 dark:bg-slate-900/10 dark:border-slate-900/60 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs hover:border-indigo-500/20 transition-all duration-200 group">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Trophy className="w-5 h-5 fill-current" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">College Rank</span>
                    <span className="text-base font-black text-slate-800 dark:text-white font-mono leading-tight">#14</span>
                  </div>
                </div>

              </div>

              {/* Grid Layout: Subjects (Left) and Daily Challenge / Career Hub Preview (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* 4 Major Subject Tracks (Left Column - 7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900/80 pb-3">
                    <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <GraduationCap className={`w-4.5 h-4.5 ${getAccentClass(accentColor, 'text')}`} />
                      <span>Subject Learning Tracks</span>
                    </h2>
                    <span className="text-[10px] text-slate-450 dark:text-slate-500 font-extrabold uppercase">4 categories active</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Quant Aptitude */}
                    <div className="bg-white border border-slate-200 dark:bg-slate-900/10 dark:border-slate-900/50 rounded-2xl p-5 hover:shadow-md transition-all duration-200 flex flex-col justify-between h-36">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">Quant Aptitude</span>
                        <span className={`text-[10px] border px-2 py-0.5 rounded-lg font-bold font-mono ${getAccentClass(accentColor, 'combined')}`}>Accuracy: 84%</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-450">
                          <span>Overall Progress</span>
                          <span className="font-mono text-slate-800 dark:text-white font-black">75%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-2.5 overflow-hidden">
                          <div className={`h-2.5 rounded-full ${getAccentClass(accentColor, 'bg')}`} style={{ width: '75%' }} />
                        </div>
                      </div>
                    </div>

                    {/* Logical Reasoning */}
                    <div className="bg-white border border-slate-200 dark:bg-slate-900/10 dark:border-slate-900/50 rounded-2xl p-5 hover:shadow-md transition-all duration-200 flex flex-col justify-between h-36">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">Logical Reasoning</span>
                        <span className="text-[10px] text-indigo-650 bg-indigo-50 border border-indigo-100 dark:text-indigo-400 dark:bg-indigo-950/40 dark:border-indigo-900/30 px-2 py-0.5 rounded-lg font-bold font-mono">Accuracy: 92%</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-450">
                          <span>Overall Progress</span>
                          <span className="font-mono text-slate-800 dark:text-white font-black">40%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-2.5 overflow-hidden">
                          <div className="bg-indigo-600 dark:bg-indigo-500 h-2.5 rounded-full" style={{ width: '40%' }} />
                        </div>
                      </div>
                    </div>

                    {/* Verbal Ability */}
                    <div className="bg-white border border-slate-200 dark:bg-slate-900/10 dark:border-slate-900/50 rounded-2xl p-5 hover:shadow-md transition-all duration-200 flex flex-col justify-between h-36">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">Verbal Ability</span>
                        <span className="text-[10px] text-purple-650 bg-purple-50 border border-purple-100 dark:text-purple-400 dark:bg-purple-950/40 dark:border-purple-900/30 px-2 py-0.5 rounded-lg font-bold font-mono">Accuracy: 78%</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-450">
                          <span>Overall Progress</span>
                          <span className="font-mono text-slate-800 dark:text-white font-black">85%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-2.5 overflow-hidden">
                          <div className="bg-purple-600 dark:bg-purple-500 h-2.5 rounded-full" style={{ width: '85%' }} />
                        </div>
                      </div>
                    </div>

                    {/* Coding & DSA */}
                    <div className="bg-white border border-slate-200 dark:bg-slate-900/10 dark:border-slate-900/50 rounded-2xl p-5 hover:shadow-md transition-all duration-200 flex flex-col justify-between h-36">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">Coding & DSA</span>
                        <span className="text-[10px] text-emerald-650 bg-emerald-50 border border-emerald-100 dark:text-emerald-400 dark:bg-emerald-950/40 dark:border-emerald-900/30 px-2 py-0.5 rounded-lg font-bold font-mono">Accuracy: 64%</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-450">
                          <span>Overall Progress</span>
                          <span className="font-mono text-slate-800 dark:text-white font-black">20%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-2.5 overflow-hidden">
                          <div className="bg-emerald-600 dark:bg-emerald-500 h-2.5 rounded-full" style={{ width: '20%' }} />
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Daily Challenge & Career Hub (Right Column - 5 cols) */}
                <div className="lg:col-span-5 space-y-8">
                  
                  {/* Daily Challenge Card */}
                  <div className="bg-white border border-slate-200 dark:bg-slate-900/10 dark:border-slate-900/60 rounded-3xl p-5 shadow-xs relative overflow-hidden group hover:border-current/20 transition-all duration-300">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.04),transparent_50%)] pointer-events-none" />
                    
                    <div className="flex items-center gap-2 border-b border-slate-105 dark:border-slate-900/60 pb-3 mb-4">
                      <Target className={`w-4.5 h-4.5 ${getAccentClass(accentColor, 'text')}`} />
                      <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Today's Challenge</h3>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white">Solve 15 Quant Questions</h4>
                        <span className="text-[10.5px] font-bold text-slate-500 dark:text-slate-400">Streak booster: Earn double XP milestones today</span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-slate-500">
                          <span>Progress Tracker</span>
                          <span className="font-mono font-black text-slate-900 dark:text-white">{challengeCompletedCount} / 15 Solved</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-2 overflow-hidden">
                          <div className={`h-2 rounded-full transition-all duration-500 ${getAccentClass(accentColor, 'bg')}`} style={{ width: `${(challengeCompletedCount / 15) * 100}%` }} />
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setActiveSidebarTab('practice');
                          setSelectedDomain('quant');
                        }}
                        className={`w-full py-2.5 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98 ${getAccentClass(accentColor, 'button')}`}
                      >
                        <span>Start Challenge</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Opportunities Section (Career Hub Preview - Max 3) */}
                  <div className="bg-white border border-slate-200 dark:bg-slate-900/10 dark:border-slate-900/60 rounded-3xl p-5 shadow-xs relative overflow-hidden group hover:border-indigo-500/20 transition-all duration-300">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900/60 pb-3 mb-4">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4.5 h-4.5 text-indigo-500 dark:text-indigo-400" />
                        <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Active Placements</h3>
                      </div>
                      <button 
                        onClick={() => setActiveSidebarTab('careerHub')}
                        className="text-[9.5px] font-black text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 uppercase flex items-center gap-0.5 cursor-pointer transition-colors"
                      >
                        <span>View All</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>

                    {oppsLoading ? (
                      <div className="py-6 flex flex-col items-center justify-center text-center">
                        <div className="w-6 h-6 rounded-full border border-indigo-650 border-t-transparent animate-spin mb-2" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loading...</span>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {opportunities.slice(0, 3).map((o) => {
                          const statusColor = 
                            o.status === 'Open' ? 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/20 dark:border-emerald-900/25' :
                            o.status === 'Closing Soon' ? 'text-amber-700 bg-amber-55/60 border-amber-200 dark:text-amber-400 dark:bg-amber-950/20 dark:border-amber-900/25' :
                            o.status === 'New' ? 'text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/20 dark:border-blue-900/25' :
                            'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950/20 dark:border-rose-900/25';

                          const typeBadge = 
                            o.type === 'Hiring' ? 'Hiring' :
                            o.type === 'Internship' ? 'Intern' :
                            o.type === 'Government Exam' ? 'Gov Exam' :
                            o.type === 'Hackathon' ? 'Hackathon' : o.type;

                          const isExpanded = expandedOpportunityId === o.id;

                          return (
                            <div key={o.id} className="p-3 bg-slate-50/50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-900/80 space-y-2 hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors">
                              <div className="flex items-center justify-between gap-1 flex-wrap">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[8.5px] font-black bg-indigo-50 border border-indigo-150 text-indigo-700 dark:bg-indigo-950/30 dark:border-indigo-900/30 dark:text-indigo-400 px-1.5 py-0.2 rounded uppercase">
                                    {typeBadge}
                                  </span>
                                  <span className={`text-[8.5px] font-black px-1.5 py-0.2 rounded border uppercase font-mono ${statusColor}`}>
                                    {o.status}
                                  </span>
                                </div>
                                <span className="text-[8.5px] font-bold text-slate-500">Till {o.deadline}</span>
                              </div>

                              <div className="space-y-0.5">
                                <h4 className="text-[11.5px] font-black text-slate-900 dark:text-white leading-tight uppercase">{o.title}</h4>
                                <span className="text-[10px] text-slate-450 block font-semibold">{o.organization}</span>
                              </div>

                              {isExpanded && o.details && (
                                <p className="text-[10.5px] leading-relaxed text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-100 dark:border-slate-850 animate-fadeIn">
                                  {o.details}
                                </p>
                              )}

                              <div className="flex gap-2 pt-1">
                                <button
                                  onClick={() => setExpandedOpportunityId(isExpanded ? null : o.id)}
                                  className="flex-1 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold text-[9px] uppercase rounded-lg border border-slate-200 dark:bg-slate-900 dark:hover:bg-slate-850 dark:text-slate-300 dark:border-slate-850 transition-colors cursor-pointer text-center"
                                >
                                  {isExpanded ? 'Hide' : 'Details'}
                                </button>
                                <a 
                                  href={o.link} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[9px] uppercase rounded-lg shadow-sm flex items-center justify-center gap-0.5 cursor-pointer transition-all"
                                >
                                  <span>Apply</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* ====================================================================
              2. TAB: LEARNING PATHWAY (Duolingo Style roadmap path map)
              ==================================================================== */}
          {activeSidebarTab === 'learning' && (
            <div className="w-full space-y-8 animate-fadeIn">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-black uppercase text-slate-900 dark:text-white font-heading">Your learning roadmap</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">Click on the active lesson nodes to solve matching assessment questions.</p>
              </div>

              {/* Duolingo Winding Roadmap Map */}
              <div className="relative flex flex-col items-center py-10 space-y-12">
                
                {/* Winding Vertical Connector line */}
                <div className="absolute top-10 bottom-10 w-1 bg-gradient-to-b from-emerald-500 via-blue-500 to-slate-250 dark:to-slate-800 rounded-full z-0" />

                {/* Path Nodes */}
                {[
                  { id: 1, title: 'Percentages', desc: 'Core fractional relationships', status: 'completed', symbol: '%', color: 'emerald' },
                  { id: 2, title: 'Ratios & Proportions', desc: 'Comparative scale models', status: 'completed', symbol: '1:2', color: 'emerald' },
                  { id: 3, title: 'Profit & Loss', desc: 'Commerce margins & calculations', status: 'active', symbol: '₹', color: 'blue' },
                  { id: 4, title: 'Time & Work', desc: 'Rate equations & tasks efficiency', status: 'locked', symbol: '⏳', color: 'slate' },
                  { id: 5, title: 'Syllogisms', desc: 'Boolean Venn diagrams deductions', status: 'locked', symbol: 'V', color: 'slate' },
                  { id: 6, title: 'Blood Relations', desc: 'Structured family maps trees', status: 'locked', symbol: '👪', color: 'slate' },
                  { id: 7, title: 'Coding: Arrays', desc: 'Linear memory indexing logic', status: 'locked', symbol: '[]', color: 'slate' },
                  { id: 8, title: 'Coding: Recursion', desc: 'Call stacks and induction checks', status: 'locked', symbol: '()', color: 'slate' }
                ].map((node, index) => {
                  
                  // Winding left/right positioning classes
                  const offsetClass = 
                    index % 3 === 0 ? 'translate-x-0' :
                    index % 3 === 1 ? 'translate-x-12 sm:translate-x-20' :
                    '-translate-x-12 sm:-translate-x-20';

                  const isCompleted = node.status === 'completed';
                  const isActive = node.status === 'active';

                  return (
                    <div key={node.id} className={`flex flex-col items-center relative z-10 transition-all ${offsetClass}`}>
                      
                      {/* Active floating indicator badge */}
                      {isActive && (
                        <div className="absolute -top-8 bg-blue-600 text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-lg animate-bounce flex items-center gap-1 border border-blue-400">
                          <Play className="w-2 h-2 fill-current" />
                          <span>Active Unit</span>
                        </div>
                      )}

                      {/* Circular Lesson Node */}
                      <button
                        onClick={() => {
                          if (!node.status.includes('locked')) {
                            setActiveSidebarTab('practice');
                            setSelectedDomain('quant');
                          }
                        }}
                        disabled={node.status === 'locked'}
                        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg border-b-4 hover:scale-105 active:scale-95 transition-all select-none cursor-pointer ${
                          isCompleted 
                            ? 'bg-emerald-500 border-emerald-700 text-white hover:bg-emerald-400' 
                            : isActive 
                            ? 'bg-blue-600 border-blue-800 text-white animate-pulse-glow hover:bg-blue-500 shadow-blue-500/20' 
                            : 'bg-slate-200 border-slate-350 dark:bg-slate-900 dark:border-slate-950 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-8 h-8 stroke-[3.5]" />
                        ) : node.status === 'locked' ? (
                          <Lock className="w-5 h-5" />
                        ) : (
                          <span className="text-lg font-black font-mono">{node.symbol}</span>
                        )}
                      </button>

                      {/* Node Label card popup on hover */}
                      <div className="mt-3 text-center bg-white dark:bg-slate-950 p-2.5 rounded-xl border border-slate-150 dark:border-slate-900 shadow-md w-36 max-w-xs transition-colors">
                        <span className="text-[10px] font-black text-slate-800 dark:text-white block truncate uppercase">{node.title}</span>
                        <span className="text-[8.5px] text-slate-500 font-semibold block leading-tight mt-0.5">{node.desc}</span>
                        {isActive && (
                          <span className="text-[8.5px] text-blue-600 dark:text-blue-400 font-black block mt-1">75% Complete</span>
                        )}
                      </div>

                    </div>
                  );
                })}

              </div>
            </div>
          )}

          {/* ====================================================================
              3. TAB: PRACTICE ARENA (Interactive Feed)
              ==================================================================== */}
          {activeSidebarTab === 'practice' && (
            <div className="space-y-6 pt-2 animate-fadeIn w-full">
              
              {/* Section Title & Filter Tabs */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-900 pb-5 transition-colors duration-300">
                <div>
                  <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight uppercase font-sans flex items-center gap-2">
                    <BookOpenCheck className="w-5 h-5 text-blue-600" />
                    <span>Practice Arena Feed</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Real-time Aptitude and Verbal solving sheets updated by editors.</p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Search question stems..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-600 transition-colors"
                  />
                </div>
              </div>

              {/* Filters Row */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Domain Switcher */}
                <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-900 shadow-2xs transition-colors duration-300">
                  {['All', 'quant', 'logical', 'verbal'].map((domain) => (
                    <button
                      key={domain}
                      onClick={() => setSelectedDomain(domain)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                        selectedDomain === domain 
                          ? 'bg-blue-600 text-white shadow-sm' 
                          : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                      }`}
                    >
                      {domain === 'All' ? 'All Domains' : domain === 'quant' ? 'Quantitative' : domain === 'logical' ? 'Logical' : 'Verbal'}
                    </button>
                  ))}
                </div>

                {/* Difficulty pills */}
                <div className="flex items-center gap-2 bg-slate-50/60 p-1 rounded-xl border border-slate-200 dark:bg-slate-900/60 dark:border-slate-900 transition-colors duration-300">
                  {['All', 'EASY', 'MEDIUM', 'HARD'].map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${
                        selectedDifficulty === diff 
                          ? 'bg-slate-200 text-slate-850 dark:bg-slate-800 dark:text-slate-100 shadow-xs' 
                          : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scalable Practice Question Feed */}
              {isLoading ? (
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-2xl py-14 flex flex-col items-center justify-center text-center transition-colors duration-300">
                  <div className="w-10 h-10 rounded-full border border-blue-600 border-t-transparent animate-spin mb-3" />
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Compiling question catalog...</span>
                </div>
              ) : filteredQuestions.length === 0 ? (
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-2xl py-14 flex flex-col items-center justify-center text-center p-6 transition-colors duration-300">
                  <Info className="w-8 h-8 text-slate-400 dark:text-slate-500 mb-2.5" />
                  <span className="text-xs font-bold text-slate-655 dark:text-slate-400 uppercase tracking-widest">No matching questions cataloged</span>
                  <span className="text-[10px] text-slate-500 mt-1 leading-normal">Try clearing domain or difficulty selections.</span>
                </div>
              ) : (
                <div className="space-y-5">
                  {filteredQuestions.map((q) => {
                    const isBookmarked = bookmarks.includes(q.id);
                    const isSubmitted = submittedAnswers[q.id];
                    const selectedOption = selectedAnswers[q.id];
                    const showSolution = revealedSolutions[q.id];

                    const domainLabel = q.domainId === 'quant' ? 'QUANT' : q.domainId === 'logical' ? 'LOGICAL' : 'VERBAL';

                    return (
                      <div 
                        key={q.id}
                        className="bg-white border border-slate-200 dark:bg-slate-950/40 dark:border-slate-900 rounded-2xl p-6 space-y-4 hover:border-slate-350 dark:hover:border-slate-800 transition-all duration-150 shadow-xs relative overflow-hidden"
                      >
                        {/* Top banner tag info */}
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900/60 pb-3 flex-wrap gap-2 transition-colors duration-300">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/35 px-2 py-0.5 rounded tracking-wide uppercase transition-colors duration-300">
                              {domainLabel}
                            </span>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded border transition-colors duration-300 ${
                              q.difficulty === 'EASY' 
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900/30 dark:text-emerald-450'
                                : q.difficulty === 'HARD'
                                ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/30 dark:border-rose-900/30 dark:text-rose-455'
                                : 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/30 dark:border-amber-900/30 dark:text-amber-455'
                            }`}>
                              {q.difficulty}
                            </span>
                            <span className="font-mono text-[9.5px] text-slate-500 font-bold uppercase tracking-wider">#{q.id}</span>
                          </div>

                          {/* Interactive actions */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleBookmark(q.id)}
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                isBookmarked 
                                  ? 'bg-amber-50 border-amber-300 text-amber-600 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-500' 
                                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-400 hover:text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800 dark:text-slate-450'
                              }`}
                            >
                              <Bookmark className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>
                          </div>
                        </div>

                        {/* Question Stem Text Area */}
                        <div className="space-y-3 leading-relaxed">
                          <div className="text-[12.5px] font-bold text-slate-850 dark:text-slate-100 whitespace-pre-wrap leading-normal font-sans transition-colors duration-300">
                            {q.questionStem}
                          </div>
                        </div>

                        {/* Selectable Options List */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                          {q.options.map((opt) => {
                            const isOptionSelected = selectedOption === opt.id;
                            const showCorrectness = isSubmitted && opt.isCorrect;
                            const showIncorrectness = isSubmitted && isOptionSelected && !opt.isCorrect;

                            return (
                              <button
                                key={opt.id}
                                onClick={() => !isSubmitted && handleAnswerSelect(q.id, opt.id)}
                                disabled={isSubmitted}
                                className={`p-3 rounded-xl border text-left flex items-start justify-between gap-3 text-[11.5px] transition-all duration-155 ${
                                  showCorrectness
                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-2xs dark:border-emerald-500 dark:bg-emerald-950/20 dark:text-emerald-300'
                                    : showIncorrectness
                                    ? 'border-rose-500 bg-rose-50 text-rose-800 shadow-2xs dark:border-rose-500 dark:bg-rose-950/20 dark:text-rose-300'
                                    : isOptionSelected
                                    ? 'border-blue-600 bg-blue-50/30 text-slate-900 dark:border-blue-600 dark:bg-blue-950/30 dark:text-white'
                                    : 'border-slate-200 bg-slate-50/55 hover:border-slate-350 hover:bg-slate-50 text-slate-700 dark:border-slate-900 dark:bg-slate-950/20 dark:hover:border-slate-800 dark:hover:bg-slate-900/30 dark:text-slate-300 disabled:opacity-60 disabled:hover:border-slate-900'
                                }`}
                              >
                                <div className="flex items-start gap-2.5 min-w-0">
                                  <span className={`w-5 h-5 rounded-md flex items-center justify-center font-mono font-black text-[10px] shrink-0 border transition-colors duration-300 ${
                                    showCorrectness 
                                      ? 'border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-900/35 dark:text-emerald-450' 
                                      : showIncorrectness 
                                      ? 'border-rose-250 bg-rose-100 text-rose-700 dark:border-rose-800/40 dark:bg-rose-900/35 dark:text-rose-455'
                                      : 'border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400'
                                  }`}>
                                    {opt.id}
                                  </span>
                                  <span className="font-semibold leading-normal break-words mt-0.5">{opt.text}</span>
                                </div>

                                {/* Correctness indicators */}
                                <div className="shrink-0 flex items-center">
                                  {showCorrectness && (
                                    <div className="w-4.5 h-4.5 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-inner">
                                      <Check className="w-3 h-3 stroke-[3]" />
                                    </div>
                                  )}
                                  {showIncorrectness && (
                                    <div className="w-4.5 h-4.5 rounded-full bg-rose-600 flex items-center justify-center text-white shadow-inner">
                                      <X className="w-3 h-3 stroke-[3]" />
                                    </div>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        {/* Interactive Explanation & Video solver toggler */}
                        {isSubmitted && (
                          <div className="border-t border-slate-100 dark:border-slate-900/80 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors duration-300">
                            <button
                              onClick={() => toggleSolution(q.id)}
                              className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 transition-colors cursor-pointer select-none"
                            >
                              <span>{showSolution ? 'Hide' : 'Show'} Step-by-Step Explanation</span>
                              {showSolution ? <ChevronDown className="w-4 h-4 shrink-0" /> : <ChevronRight className="w-4 h-4 shrink-0" />}
                            </button>
                            
                            {q.videoUrl && (
                              <a 
                                href={q.videoUrl} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-[10px] font-black uppercase text-slate-450 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-450 flex items-center gap-1 transition-colors select-none"
                              >
                                <Play className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>Watch video solution</span>
                                <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                              </a>
                            )}
                          </div>
                        )}

                        {/* Solved Explanation drawer */}
                        {isSubmitted && showSolution && q.hintText && (
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4.5 text-xs text-slate-650 dark:bg-slate-900/40 dark:border-slate-900 dark:text-slate-400 leading-normal whitespace-pre-wrap font-medium animate-fadeIn transition-colors duration-300">
                            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block border-b border-slate-200 dark:border-slate-900 pb-1.5 mb-2 select-none">LaTeX Mathematical Solver Output</span>
                            {q.hintText.replace(/\\frac/g, '').replace(/\\text/g, '').replace(/[\{\}]/g, ' ')}
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

          {/* ====================================================================
              4. TAB: MOCK TESTS (Assessments center)
              ==================================================================== */}
          {activeSidebarTab === 'mockTests' && (
            <div className="w-full space-y-8 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900 pb-4">
                <div>
                  <h1 className="text-xl font-black uppercase text-slate-900 dark:text-white font-heading">Placement Mock Arena</h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Prepare under simulated company timeline checks.</p>
                </div>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 px-3 py-1 rounded-full uppercase">3 scheduled tests</span>
              </div>

              <div className="space-y-4">
                {[
                  { title: 'TCS Aptitude Mock Test #4', difficulty: 'MEDIUM', duration: '90 mins', questions: '60 Questions', participants: '1.4k candidates registered', date: 'Starts today, 2:00 PM', status: 'Live Soon' },
                  { title: 'Goldman Sachs Simulation Staging', difficulty: 'HARD', duration: '120 mins', questions: '45 Questions', participants: '820 candidates registered', date: 'Scheduled: June 8, 10:00 AM', status: 'Register Open' },
                  { title: 'Daily Logic Challenge - Arrays & Matrices', difficulty: 'HARD', duration: '20 mins', questions: '10 Questions', participants: '450 candidates completed', date: 'Daily Challenge Topic', status: 'Completed' }
                ].map((test, idx) => {
                  const statusBg = 
                    test.status === 'Completed' ? 'bg-slate-100 text-slate-500 dark:bg-slate-900 border-slate-200' :
                    test.status === 'Live Soon' ? 'bg-emerald-50 text-emerald-700 border-emerald-250 dark:bg-emerald-950/20 dark:text-emerald-400' :
                    'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400';

                  return (
                    <div key={idx} className="bg-white border border-slate-200 dark:bg-slate-900/10 dark:border-slate-900/50 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-all">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[8.5px] font-black px-2 py-0.5 rounded border uppercase tracking-wide font-mono ${statusBg}`}>
                            {test.status}
                          </span>
                          <span className={`text-[8.5px] font-black px-2 py-0.5 rounded border uppercase tracking-wide ${
                            test.difficulty === 'HARD' ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/10 dark:text-rose-400' : 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/10 dark:text-amber-400'
                          }`}>
                            {test.difficulty}
                          </span>
                        </div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase leading-snug">{test.title}</h3>
                        
                        <div className="flex flex-wrap gap-4 text-[10.5px] text-slate-500 font-semibold">
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {test.duration}</span>
                          <span>•</span>
                          <span>{test.questions}</span>
                          <span>•</span>
                          <span>{test.participants}</span>
                        </div>
                      </div>

                      <div className="text-left md:text-right flex flex-col items-start md:items-end justify-between shrink-0 gap-3">
                        <span className="text-[10px] font-bold text-slate-500 font-mono">{test.date}</span>
                        <button 
                          disabled={test.status === 'Completed'}
                          className={`py-2 px-5 font-bold text-xs rounded-xl shadow-xs cursor-pointer select-none transition-all ${
                            test.status === 'Completed'
                              ? 'bg-slate-100 text-slate-450 border border-slate-200 dark:bg-slate-900 dark:text-slate-655 dark:border-slate-950 cursor-not-allowed shadow-none'
                              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/10'
                          }`}
                        >
                          {test.status === 'Completed' ? 'Challenge Done' : 'Enter Staging'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ====================================================================
              5. TAB: CAREER HUB (Dedicated page with sub-filters)
              ==================================================================== */}
          {activeSidebarTab === 'careerHub' && (
            <div className="w-full space-y-8 animate-fadeIn">
              
              {/* Header */}
              <div className="border-b border-slate-200 dark:border-slate-900 pb-5">
                <h1 className="text-xl font-black uppercase text-slate-900 dark:text-white font-heading flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  <span>Dedicated Career Hub Center</span>
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Live portal access drives, internships, government exams, hackathons, and placement updates.</p>
              </div>

              {/* Category sub-filters tabs */}
              <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-900 overflow-x-auto scrollbar-none whitespace-nowrap gap-1">
                {['All', 'Hiring Drives', 'Internships', 'Government Exams', 'Hackathons', 'Placement Updates'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedOpportunityType(type)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                      selectedOpportunityType === type 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Feed Grid */}
              {oppsLoading || announcementsLoading ? (
                <div className="py-14 flex flex-col items-center justify-center text-center">
                  <div className="w-8 h-8 rounded-full border border-blue-650 border-t-transparent animate-spin mb-3" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Compiling opportunities files...</span>
                </div>
              ) : selectedOpportunityType === 'Placement Updates' ? (
                // Display Placement Updates Announcements
                <div className="space-y-4">
                  {announcements.map((a) => (
                    <div key={a.id} className="bg-white border border-slate-200 dark:bg-slate-900/15 dark:border-slate-900 p-5 rounded-2xl space-y-2.5 hover:border-slate-350 transition-colors">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black text-indigo-650 bg-indigo-50 border border-indigo-200 dark:text-indigo-400 dark:bg-indigo-950/20 dark:border-indigo-900/30 px-2 py-0.5 rounded-lg uppercase">
                            {a.type}
                          </span>
                          {a.priority === 'High' && (
                            <span className="text-[8px] font-black bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/30 dark:border-rose-900/30 dark:text-rose-455 px-1.5 py-0.2 rounded uppercase animate-pulse">
                              High Priority
                            </span>
                          )}
                        </div>
                        <span className="text-[9.5px] text-slate-500 font-semibold">{a.publisher} · {a.date || 'June 4'}</span>
                      </div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase leading-snug">{a.title}</h4>
                      <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed font-medium">{a.content}</p>
                    </div>
                  ))}
                </div>
              ) : filteredOpportunities.length === 0 ? (
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-2xl py-14 flex flex-col items-center justify-center text-center p-6">
                  <Info className="w-8 h-8 text-slate-400 dark:text-slate-500 mb-2.5" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">No Active Opportunities in this Category</span>
                  <p className="text-[10px] text-slate-450 mt-1 leading-normal">Check back later for active portal drives.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredOpportunities.map((o) => {
                    const isExpanded = expandedOpportunityId === o.id;
                    const statusColor = 
                      o.status === 'Open' ? 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/20 dark:border-emerald-900/25' :
                      o.status === 'Closing Soon' ? 'text-amber-700 bg-amber-55/65 border-amber-250 dark:text-amber-400 dark:bg-amber-950/20 dark:border-amber-900/25' :
                      o.status === 'New' ? 'text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/20 dark:border-blue-900/25' :
                      'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-455 dark:bg-rose-950/20 dark:border-rose-900/25';

                    const typeBadge = 
                      o.type === 'Hiring' ? 'Hiring Drive' :
                      o.type === 'Internship' ? 'Internship' :
                      o.type === 'Government Exam' ? 'Government Exam' :
                      o.type === 'Hackathon' ? 'Hackathon' : o.type;

                    return (
                      <div 
                        key={o.id}
                        className="bg-white border border-slate-200 hover:border-slate-350 dark:bg-slate-900/10 dark:border-slate-900 dark:hover:border-slate-800 rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all duration-200"
                      >
                        <div className="space-y-3.5">
                          <div className="flex items-center justify-between gap-1 flex-wrap">
                            <span className="text-[8.5px] font-black px-2 py-0.5 rounded border bg-indigo-50 border-indigo-150 text-indigo-700 dark:bg-indigo-950/30 dark:border-indigo-900/30 dark:text-indigo-400 uppercase font-mono">
                              {typeBadge}
                            </span>
                            <span className={`text-[8.5px] font-black px-2 py-0.5 rounded border uppercase font-mono ${statusColor}`}>
                              {o.status}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight uppercase leading-snug">{o.title}</h3>
                            <span className="text-xs text-slate-500 font-bold tracking-tight block">{o.organization}</span>
                          </div>
                        </div>

                        <div className="border-t border-slate-100 dark:border-slate-900/60 pt-3 space-y-3 transition-colors duration-300">
                          <div className="flex items-center justify-between text-[10.5px]">
                            <div className="flex items-center gap-1 text-slate-500 font-semibold">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>Till {o.deadline}</span>
                            </div>
                            {o.days_remaining > 0 ? (
                              <span className="text-amber-600 dark:text-amber-400 font-bold font-mono">{o.days_remaining} Days Left</span>
                            ) : (
                              <span className="text-slate-450 dark:text-slate-550 font-bold uppercase font-mono">Closed</span>
                            )}
                          </div>

                          {isExpanded && o.details && (
                            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 text-[10.5px] text-slate-655 dark:text-slate-400 leading-relaxed border border-slate-250 dark:border-slate-850 animate-fadeIn font-medium">
                              {o.details}
                            </div>
                          )}

                          <div className="flex gap-2">
                            <button
                              onClick={() => setExpandedOpportunityId(isExpanded ? null : o.id)}
                              className="flex-1 py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 font-bold text-[10px] uppercase rounded-lg border border-slate-200 dark:bg-slate-900 dark:hover:bg-slate-850 dark:text-slate-300 dark:border-slate-850 transition-colors cursor-pointer text-center"
                            >
                              {isExpanded ? 'Hide' : 'Details'}
                            </button>
                            <a 
                              href={o.link} 
                              target="_blank" 
                              rel="noreferrer"
                              className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] uppercase rounded-lg shadow-sm flex items-center justify-center gap-1 cursor-pointer transition-all"
                            >
                              <span>Apply</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ====================================================================
              6. TAB: LEADERBOARD (College/Global/Friends)
              ==================================================================== */}
          {activeSidebarTab === 'leaderboards' && (
            <div className="w-full space-y-6 animate-fadeIn">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900 pb-3">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Active Rankings</h1>
                </div>
                
                {/* Leaderboard sub-tabs */}
                <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-900">
                  {['college', 'global', 'friends'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveLeaderboardTab(tab as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                        activeLeaderboardTab === tab
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Leaderboard lists */}
              <div className="space-y-3">
                {[
                  { rank: 1, name: 'Sriram Neppalli', xp: '18,920 XP', progress: '94%', self: false },
                  { rank: 2, name: 'Aditya Sen', xp: '16,400 XP', progress: '88%', self: false },
                  { rank: 3, name: 'Rohan Sharma', xp: '14,200 XP', progress: '85%', self: false },
                  { rank: 4, name: 'Ananya Roy', xp: '13,900 XP', progress: '82%', self: false },
                  { rank: 5, name: 'Kunal Kapoor', xp: '13,500 XP', progress: '80%', self: false },
                  { rank: 14, name: 'Vaishnavi Raparthy (You)', xp: '12,450 XP', progress: '72%', self: true }
                ].map((item, idx) => (
                  <div 
                    key={idx}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      item.self 
                        ? 'bg-blue-50/50 border-blue-200 text-blue-800 dark:bg-blue-900/10 dark:border-blue-950 dark:text-blue-400 shadow-sm' 
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 dark:bg-slate-950/20 dark:border-slate-900/60 dark:hover:bg-slate-900/40 dark:text-slate-350'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-black text-xs ${
                        item.rank === 1 ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400' :
                        item.rank === 2 ? 'bg-slate-200 text-slate-700 dark:bg-slate-400/20 dark:text-slate-450' :
                        item.rank === 3 ? 'bg-amber-50 text-amber-900 dark:bg-amber-700/20 dark:text-amber-700' :
                        'bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400'
                      }`}>
                        {item.rank}
                      </span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{item.name}</span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-slate-500 font-semibold font-mono">{item.xp}</span>
                      <span className="font-mono font-black text-blue-600 dark:text-blue-400">{item.progress}</span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* ====================================================================
              7. TAB: PROFILE (Editable settings form)
              ==================================================================== */}
          {activeSidebarTab === 'profile' && (
            <div className="w-full space-y-8 animate-fadeIn">
              
              <div className="border-b border-slate-250 dark:border-slate-900 pb-4">
                <h1 className="text-xl font-black uppercase text-slate-900 dark:text-white font-heading">Student credentials</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Review onboarding selections and active prep goals.</p>
              </div>

              {saveSuccess && (
                <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-450 rounded-2xl p-4 flex items-center gap-3 animate-fadeIn">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="text-xs font-bold">Profile onboarding configurations saved successfully!</span>
                </div>
              )}

              <form onSubmit={handleProfileSave} className="bg-white border border-slate-200 dark:bg-slate-900/10 dark:border-slate-900/60 p-6 rounded-3xl space-y-5">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Student Name */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Student Name</label>
                    <input 
                      type="text" 
                      value={profile.username}
                      onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                      required
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 transition-colors"
                    />
                  </div>

                  {/* College */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">College Name</label>
                    <input 
                      type="text" 
                      value={profile.college}
                      onChange={(e) => setProfile({ ...profile, college: e.target.value })}
                      required
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 transition-colors"
                    />
                  </div>

                  {/* Degree */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Degree</label>
                    <input 
                      type="text" 
                      value={profile.degree}
                      onChange={(e) => setProfile({ ...profile, degree: e.target.value })}
                      required
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 transition-colors"
                    />
                  </div>

                  {/* Branch */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Branch</label>
                    <input 
                      type="text" 
                      value={profile.branch}
                      onChange={(e) => setProfile({ ...profile, branch: e.target.value })}
                      required
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 transition-colors"
                    />
                  </div>

                  {/* Graduation Year */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Graduation Year</label>
                    <input 
                      type="number" 
                      value={profile.graduation_year}
                      onChange={(e) => setProfile({ ...profile, graduation_year: parseInt(e.target.value) || 2026 })}
                      required
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 transition-colors"
                    />
                  </div>

                  {/* Primary Goal */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Preparation Goal</label>
                    <select 
                      value={profile.primary_goal}
                      onChange={(e) => setProfile({ ...profile, primary_goal: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 transition-colors"
                    >
                      <option value="Campus Placements">Campus Placements</option>
                      <option value="Government Exam Prep">Government Exam Prep</option>
                      <option value="Software Engineer Roles">Software Engineer Roles</option>
                      <option value="Higher Education Studies">Higher Education Studies</option>
                    </select>
                  </div>

                  {/* Commit Commitment */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Weekly Commitment</label>
                    <select 
                      value={profile.weekly_commitment}
                      onChange={(e) => setProfile({ ...profile, weekly_commitment: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 transition-colors"
                    >
                      <option value="3–5 Hours">3–5 Hours</option>
                      <option value="5–10 Hours">5–10 Hours</option>
                      <option value="10–20 Hours">10–20 Hours</option>
                      <option value="20+ Hours">20+ Hours</option>
                    </select>
                  </div>

                  {/* Preferences */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Learning Preference</label>
                    <select 
                      value={profile.learning_preference}
                      onChange={(e) => setProfile({ ...profile, learning_preference: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 transition-colors"
                    >
                      <option value="Concept + Practice">Concept + Practice</option>
                      <option value="Simulated Mock Focus">Simulated Mock Focus</option>
                      <option value="Interactive Quick Solving">Interactive Quick Solving</option>
                    </select>
                  </div>

                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-900">
                  <button 
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Config</span>
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* ====================================================================
              7.5. TAB: ACHIEVEMENTS & BADGES
              ==================================================================== */}
          {activeSidebarTab === 'badges' && (
            <div className="space-y-8 animate-fadeIn text-slate-800 dark:text-slate-200">
              {/* Premium Header HUD card */}
              <div className="bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 text-white shadow-xl rounded-3xl p-6 sm:p-8 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                {/* Background ambient lighting */}
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-pink-500/5 rounded-full blur-[60px] pointer-events-none" />

                <div className="space-y-3 relative z-10 text-left">
                  <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3.5 py-1 rounded-full text-[9px] font-black text-amber-400 tracking-wider uppercase">
                    <Trophy className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                    <span>Aptitude Leaderboard Clearance</span>
                  </div>
                  <h2 className="text-2xl font-black tracking-tight uppercase leading-tight">
                    Your Achievements & Badges
                  </h2>
                  <p className="text-xs text-slate-400 max-w-xl font-medium leading-relaxed font-semibold">
                    Track your credentials, progress, and performance across your onboarding and consistency achievements. Keep completing challenges to level up!
                  </p>
                </div>

                {/* Score indicators */}
                <div className="flex flex-col items-center sm:items-start md:items-center bg-slate-950/40 backdrop-blur-md border border-slate-800 p-5 rounded-2xl shrink-0 w-full md:w-auto text-center md:text-left gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold border border-amber-500/30">
                      🏆
                    </div>
                    <div className="text-left flex flex-col">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Unlocked Badges</span>
                      <span className="text-lg font-black text-white">{unlockedBadgeIds.length} / {badges.length}</span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${badges.length > 0 ? (unlockedBadgeIds.length / badges.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Achievements Filter Tabs */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-5">
                  <div className="text-left">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase">Getting Started Badges</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-450 mt-0.5 font-semibold">Standalone starter achievements for onboarding and consistency.</p>
                  </div>
                </div>

                {/* Badges Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {badges.map((badge) => {
                    const isUnlocked = unlockedBadgeIds.includes(badge.id);
                    return <BadgeCard key={badge.id} badge={badge} isUnlocked={isUnlocked} />;
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ====================================================================
              8. TAB: SETTINGS (Theme configuration & credentials)
              ==================================================================== */}
          {activeSidebarTab === 'settings' && (
            <div className="w-full space-y-8 animate-fadeIn text-slate-800 dark:text-slate-200">
              
              <div className="border-b border-slate-200 dark:border-slate-900 pb-4 text-left">
                <h1 className="text-xl font-black uppercase text-slate-900 dark:text-white font-heading">Settings Hub</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Configure advanced dashboard properties, 3D interactions, sound nodes, and live customizations.</p>
              </div>

              {/* Two Column Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Column: Settings Customizations (7 cols on lg) */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* Card 1: 3D Tilts & Celebrations */}
                  <div 
                    onMouseMove={handleMouseMove3D}
                    onMouseLeave={handleMouseLeave3D}
                    className="bg-white border border-slate-200 dark:bg-slate-900/10 dark:border-slate-900 p-6 rounded-3xl space-y-5 shadow-xs transition-all duration-300"
                    style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
                  >
                    <div className="flex items-center gap-2 mb-1" style={{ transform: 'translateZ(20px)' }}>
                      <Sparkles className="w-4 h-4 text-blue-500" />
                      <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Interactive Dynamics</h3>
                    </div>

                    {/* 3D tilt Toggle */}
                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-105 dark:border-slate-900" style={{ transform: 'translateZ(10px)' }}>
                      <div className="space-y-0.5 text-left">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">Dynamic 3D Hover Tilt</span>
                        <p className="text-[10px] text-slate-450 leading-relaxed max-w-[220px]">Enable smooth interactive mouse-coordinate perspective card rotation.</p>
                      </div>
                      <button 
                        onClick={() => {
                          const nextVal = !tiltEnabled;
                          setTiltEnabled(nextVal);
                          localStorage.setItem('aptitude_tilt_enabled', String(nextVal));
                        }}
                        className={`py-1.5 px-4 rounded-xl text-xs font-extrabold uppercase transition-all duration-300 cursor-pointer ${
                          tiltEnabled 
                            ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md' 
                            : 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-400'
                        }`}
                      >
                        {tiltEnabled ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>

                    {/* Celebration Confetti Style Switcher */}
                    <div className="space-y-2.5 text-left" style={{ transform: 'translateZ(10px)' }}>
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">Confetti Celebration Blast</span>
                        <p className="text-[10px] text-slate-450 leading-relaxed">Choose canvas animation style to launch upon achieving a badge milestone.</p>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        {(['confetti', 'fireworks', 'none'] as const).map((style) => (
                          <button
                            key={style}
                            onClick={() => {
                              setConfettiStyle(style);
                              localStorage.setItem('aptitude_confetti_style', style);
                            }}
                            className={`py-2 px-3 text-[10px] font-black uppercase tracking-wider rounded-xl border transition-all cursor-pointer ${
                              confettiStyle === style
                                ? 'bg-blue-50 border-blue-300 text-blue-600 dark:bg-blue-955/30 dark:border-blue-900 dark:text-blue-400'
                                : 'bg-white border-slate-200 text-slate-500 dark:bg-slate-950 dark:border-slate-900 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
                            }`}
                          >
                            {style === 'confetti' ? '🎉 Confetti' : style === 'fireworks' ? '🎆 Fireworks' : '🚫 None'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Personal Goals & Appearance */}
                  <div 
                    onMouseMove={handleMouseMove3D}
                    onMouseLeave={handleMouseLeave3D}
                    className="bg-white border border-slate-200 dark:bg-slate-900/10 dark:border-slate-900 p-6 rounded-3xl space-y-5 shadow-xs transition-all duration-300"
                    style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
                  >
                    <div className="flex items-center gap-2 mb-1" style={{ transform: 'translateZ(20px)' }}>
                      <Target className="w-4 h-4 text-emerald-500" />
                      <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Personalization & Goals</h3>
                    </div>

                    {/* Daily XP Goals Selector */}
                    <div className="space-y-2.5 text-left" style={{ transform: 'translateZ(10px)' }}>
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">Daily XP Milestone Goal</span>
                        <p className="text-[10px] text-slate-450 leading-relaxed">Determine your daily target value. Updates dashboard trackers dynamically.</p>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-2">
                        {([
                          { label: 'Casual', value: 50 },
                          { label: 'Active', value: 100 },
                          { label: 'Serious', value: 200 },
                          { label: 'Insane', value: 500 }
                        ]).map((item) => (
                          <button
                            key={item.value}
                            onClick={() => {
                              setDailyXpGoal(item.value);
                              localStorage.setItem('aptitude_daily_xp_goal', String(item.value));
                            }}
                            className={`py-2 px-1 text-[10px] flex flex-col items-center justify-center rounded-xl border transition-all cursor-pointer ${
                              dailyXpGoal === item.value
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-600 dark:bg-emerald-955/30 dark:border-emerald-900 dark:text-emerald-400'
                                : 'bg-white border-slate-200 text-slate-500 dark:bg-slate-950 dark:border-slate-900 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
                            }`}
                          >
                            <span className="font-extrabold uppercase tracking-tight">{item.label}</span>
                            <span className="text-[9px] font-mono opacity-80 mt-0.5">{item.value} XP</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Theme display mode toggle */}
                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-955/40 p-4 rounded-2xl border border-slate-105 dark:border-slate-900" style={{ transform: 'translateZ(10px)' }}>
                      <div className="space-y-0.5 text-left">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">Active Display Mode</span>
                        <p className="text-[10px] text-slate-455 leading-relaxed">Switch workspace lighting themes in real-time.</p>
                      </div>
                      
                      <button 
                        onClick={toggleTheme}
                        className="py-2 px-4 bg-slate-200 hover:bg-slate-300 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer"
                      >
                        {theme === 'light' ? (
                          <>
                            <Sun className="w-4 h-4 text-amber-500 animate-spin" style={{ animationDuration: '6s' }} />
                            <span>Light Mode</span>
                          </>
                        ) : (
                          <>
                            <Moon className="w-4 h-4 text-indigo-400" />
                            <span>Dark Theme</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Custom Accent Palette Swatches */}
                    <div className="space-y-2.5 text-left" style={{ transform: 'translateZ(10px)' }}>
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">Brand Accent Color</span>
                        <p className="text-[10px] text-slate-455 leading-relaxed">Switch component preview accent color schema overrides.</p>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {([
                          { id: 'blue', label: 'Sapphire', bg: 'bg-blue-500', activeClass: 'border-blue-500/50 bg-blue-500/10 text-blue-600 dark:text-blue-400 dark:bg-blue-500/10' },
                          { id: 'emerald', label: 'Emerald', bg: 'bg-emerald-500', activeClass: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/10' },
                          { id: 'purple', label: 'Cyberpunk', bg: 'bg-purple-500', activeClass: 'border-purple-500/50 bg-purple-500/10 text-purple-600 dark:text-purple-400 dark:bg-purple-500/10' },
                          { id: 'amber', label: 'Amber', bg: 'bg-amber-500', activeClass: 'border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400 dark:bg-amber-500/10' },
                          { id: 'rose', label: 'Crimson', bg: 'bg-rose-500', activeClass: 'border-rose-500/50 bg-rose-500/10 text-rose-600 dark:text-rose-450 dark:bg-rose-500/10' },
                          { id: 'orange', label: 'Sunset', bg: 'bg-orange-500', activeClass: 'border-orange-500/50 bg-orange-500/10 text-orange-600 dark:text-orange-400 dark:bg-orange-500/10' },
                          { id: 'teal', label: 'Teal', bg: 'bg-teal-500', activeClass: 'border-teal-500/50 bg-teal-500/10 text-teal-600 dark:text-teal-400 dark:bg-teal-500/10' },
                          { id: 'indigo', label: 'Indigo', bg: 'bg-indigo-500', activeClass: 'border-indigo-500/50 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 dark:bg-indigo-500/10' }
                        ]).map((color) => (
                          <button
                            key={color.id}
                            onClick={() => handleAccentColorChange(color.id)}
                            className={`flex items-center gap-1.5 p-2 rounded-xl border transition-all cursor-pointer justify-center ${
                              accentColor === color.id
                                ? `${color.activeClass} shadow-md`
                                : 'bg-transparent border-slate-200/40 dark:border-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-705 dark:text-slate-300'
                            }`}
                          >
                            <span className={`w-3 h-3 rounded-full ${color.bg} shrink-0`} />
                            <span className="text-[9px] font-black uppercase tracking-wider">{color.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Layout Density Pills */}
                    <div className="space-y-2.5 text-left" style={{ transform: 'translateZ(10px)' }}>
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">Workspace Layout Density</span>
                        <p className="text-[10px] text-slate-455 leading-relaxed">Change padding scale inside elements and tables.</p>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        {(['compact', 'normal', 'spacious'] as const).map((density) => (
                          <button
                            key={density}
                            onClick={() => handleDensityChange(density)}
                            className={`py-2 px-3 text-[10px] font-black uppercase tracking-wider rounded-xl border transition-all cursor-pointer ${
                              layoutDensity === density
                                ? getAccentClass(accentColor, 'combined')
                                : 'bg-white border-slate-250 text-slate-500 dark:bg-slate-950 dark:border-slate-900 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
                            }`}
                          >
                            {density === 'compact' ? '🔍 Compact' : density === 'normal' ? '⚖️ Normal' : '📖 Spacious'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Sandbox Security credentials logs */}
                  <div 
                    onMouseMove={handleMouseMove3D}
                    onMouseLeave={handleMouseLeave3D}
                    className="bg-white border border-slate-200 dark:bg-slate-900/10 dark:border-slate-900 p-5 rounded-3xl space-y-3 shadow-xs transition-all duration-300"
                    style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
                  >
                    <div style={{ transform: 'translateZ(15px)' }}>
                      <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest text-left">Sandbox Credentials</h3>
                      <div className="space-y-2 text-[10.5px] font-medium text-slate-500 mt-3.5">
                        <div className="flex justify-between border-b border-slate-100 dark:border-slate-950 pb-2">
                          <span>Host Connection Status</span>
                          <span className="text-emerald-500 font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Operational</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 dark:border-slate-950 pb-2">
                          <span>SSL Sandbox Crypt</span>
                          <span className="font-mono">AES-GCM-256</span>
                        </div>
                        <div className="flex justify-between pb-1">
                          <span>Database Session Sync</span>
                          <span className="text-blue-600 dark:text-blue-400 font-bold">Supabase V2.102 Active</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Right Column: 3D Isometric Preview & Audio Hub (5 cols on lg) */}
                <div className="lg:col-span-5 space-y-6">
                  
                  {/* Isometric Live Dashboard Preview widget */}
                  <div className="bg-slate-950 border border-slate-900 p-6 rounded-3xl text-left space-y-4 shadow-xl relative overflow-hidden flex flex-col justify-between aspect-[4/3] group/preview">
                    {/* Glowing lights background */}
                    <div className="absolute -top-10 -right-10 w-[200px] h-[200px] bg-blue-500/15 rounded-full blur-[60px] pointer-events-none group-hover/preview:bg-blue-500/25 transition-colors" />
                    <div className="absolute -bottom-10 -left-10 w-[150px] h-[150px] bg-purple-500/10 rounded-full blur-[50px] pointer-events-none" />

                    <div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-blue-400 bg-blue-955 border border-blue-900/40 px-3 py-1 rounded-full">
                        3D Live Isometric Previewer
                      </span>
                      <p className="text-[10px] text-slate-500 mt-2 font-semibold">Hover to tilt; updates colors, density, and bounds in real-time.</p>
                    </div>

                    {/* Isometric tilted miniature card */}
                    <div className="flex-1 flex items-center justify-center [perspective:1000px] py-4">
                      <div 
                        className={`w-64 bg-slate-900 border border-slate-800/80 rounded-2xl shadow-2xl relative transition-all duration-500 [transform:rotateX(25deg)_rotateY(-35deg)_rotateZ(5deg)] hover:[transform:rotateX(15deg)_rotateY(-20deg)_rotateZ(2deg)] group-hover/preview:shadow-[0_20px_50px_rgba(8,112,184,0.15)]`}
                        style={{
                          transformStyle: 'preserve-3d',
                          padding: layoutDensity === 'compact' ? '10px' : layoutDensity === 'spacious' ? '24px' : '16px'
                        }}
                      >
                        {/* Fake Content on tilted Card */}
                        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${getAccentClass(accentColor, 'bg')}`} />
                            <span className="text-[9px] font-black uppercase text-slate-300 font-mono tracking-wider">Dashboard</span>
                          </div>
                          <span className="text-[8px] font-bold text-slate-550">v2.4</span>
                        </div>

                        <div className="space-y-2.5">
                          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850/80">
                            <div className="text-[8px] text-slate-500 uppercase tracking-widest font-extrabold">Student XP Goal</div>
                            <div className="text-xs font-black text-white mt-0.5 font-mono">{dailyXpGoal} XP</div>
                          </div>
                          
                          <div className="bg-slate-955 p-2 rounded-xl flex items-center justify-between border border-slate-850">
                            <div className="text-[7.5px] text-slate-400 font-semibold uppercase">Tilt Response</div>
                            <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded-md ${
                              tiltEnabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-500'
                            }`}>
                              {tiltEnabled ? 'Active' : 'Muted'}
                            </span>
                          </div>

                          <div className="bg-slate-955 p-2 rounded-xl flex items-center justify-between border border-slate-850">
                            <div className="text-[7.5px] text-slate-400 font-semibold uppercase">Confetti Style</div>
                            <span className="text-[7px] font-black uppercase text-blue-400">
                              {confettiStyle}
                            </span>
                          </div>
                        </div>
                        
                        <div 
                          className={`absolute -right-3 -top-3 w-7 h-7 rounded-lg flex items-center justify-center text-xs border shadow-lg transition-all duration-300 ${getAccentClass(accentColor, 'badge')}`}
                          style={{ transform: 'translateZ(30px)' }}
                        >
                          ⚡
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Audio Hub widget */}
                  <div 
                    onMouseMove={handleMouseMove3D}
                    onMouseLeave={handleMouseLeave3D}
                    className="bg-white border border-slate-200 dark:bg-slate-900/10 dark:border-slate-900 p-6 rounded-3xl text-left space-y-5 shadow-xs transition-all duration-300"
                    style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
                  >
                    <div className="flex items-center gap-2 mb-1" style={{ transform: 'translateZ(20px)' }}>
                      <Activity className="w-4 h-4 text-rose-500" />
                      <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Acoustic Sound Hub</h3>
                    </div>

                    <p className="text-[10px] text-slate-505 leading-normal font-semibold" style={{ transform: 'translateZ(10px)' }}>
                      Play high-fidelity synthesized chime sounds. Bouncing equalizers visualize frequency pulses.
                    </p>

                    {/* Sound control block */}
                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950/40 p-4.5 rounded-2xl border border-slate-105 dark:border-slate-900" style={{ transform: 'translateZ(15px)' }}>
                      <button 
                        onClick={playPreviewChime}
                        className="py-2.5 px-4 bg-rose-600 hover:bg-rose-550 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                      >
                        Play Preview Chime
                      </button>

                      {/* Equalizer Visualizer */}
                      <div className="flex items-end gap-1 h-6">
                        {[...Array(6)].map((_, i) => (
                          <div 
                            key={i} 
                            className={`w-1 rounded-full bg-rose-500 transition-all duration-150 ${
                              soundWaveActive ? 'animate-equalizer h-6' : 'h-1.5'
                            }`}
                            style={{
                              animationDelay: `${i * 0.1}s`,
                              animationDuration: `${0.45 + i * 0.08}s`
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* Footer */}
          <footer className="mt-12 border-t border-slate-200 dark:border-slate-900/60 pt-6 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider select-none shrink-0">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              {currentRole?.role === 'admin' ? (
                <input
                  type="text"
                  value={footerBadgeText}
                  onChange={(e) => {
                    setFooterBadgeText(e.target.value);
                    localStorage.setItem('aptitude_footer_badge_text', e.target.value);
                  }}
                  className="bg-transparent border-b border-dashed border-slate-405 dark:border-slate-700 focus:border-blue-500 focus:outline-none px-1 text-[10px] font-bold uppercase tracking-wider text-slate-705 dark:text-slate-300 w-64"
                  title="Edit Footer Badge Text"
                />
              ) : (
                <span>{footerBadgeText}</span>
              )}
            </div>
            {currentRole?.role === 'admin' ? (
              <input
                type="text"
                value={footerCopyright}
                onChange={(e) => {
                  setFooterCopyright(e.target.value);
                  localStorage.setItem('aptitude_footer_copyright', e.target.value);
                }}
                className="bg-transparent border-b border-dashed border-slate-405 dark:border-slate-700 focus:border-blue-500 focus:outline-none px-1 text-[10px] font-bold uppercase tracking-wider text-slate-705 dark:text-slate-300 text-right w-80"
                title="Edit Footer Copyright"
              />
            ) : (
              <span>{footerCopyright}</span>
            )}
          </footer>

          {/* Real-time Badge Unlock Celebration Popup Modal */}
          {justUnlockedBadge && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
              {/* Glow Effect */}
              <div className="absolute w-[350px] h-[350px] bg-blue-500/25 rounded-full blur-[80px] animate-pulse" />
              <div className="absolute w-[250px] h-[250px] bg-purple-500/20 rounded-full blur-[60px] animate-pulse delay-75" />

              {/* Main Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-sm w-full text-center relative overflow-hidden shadow-2xl transform transition-all scale-100 animate-scaleUp">
                {/* Floating Sparks */}
                <div className="absolute top-4 left-4 text-amber-500 animate-bounce text-lg">✨</div>
                <div className="absolute top-8 right-6 text-blue-500 animate-pulse text-lg">⭐</div>
                <div className="absolute bottom-8 left-8 text-purple-500 animate-pulse text-lg">🔥</div>
                <div className="absolute bottom-6 right-10 text-emerald-500 animate-bounce text-lg">💡</div>

                <div className="relative z-10 flex flex-col items-center font-sans">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-4xl shadow-lg shadow-amber-500/20 mb-6 border-4 border-white dark:border-slate-800 relative animate-[spin_4s_linear_infinite]">
                    🏆
                  </div>

                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-455 bg-amber-50 dark:bg-amber-955/60 border border-amber-255 dark:border-amber-900 px-3 py-1 rounded-full mb-3">
                    NEW ACHIEVEMENT UNLOCKED!
                  </span>

                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight animate-pulse">
                    {justUnlockedBadge.name}
                  </h3>

                  <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-1 mb-4 block">
                    Level {justUnlockedBadge.level} · {justUnlockedBadge.category}
                  </span>

                  <p className="text-xs text-slate-500 dark:text-slate-405 leading-relaxed max-w-[260px] mb-6 font-semibold">
                    "{justUnlockedBadge.description}"
                  </p>

                  <button
                    onClick={() => {
                      setJustUnlockedBadge(null);
                      setActiveSidebarTab('badges');
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider py-3.5 px-6 rounded-2xl transition-all shadow-md active:scale-95 cursor-pointer mb-2.5"
                  >
                    Go View in Achievements
                  </button>

                  <button
                    onClick={() => setJustUnlockedBadge(null)}
                    className="text-[10px] font-extrabold uppercase text-slate-400 hover:text-slate-655 dark:hover:text-slate-350 transition-colors py-2 block cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Celebration graphics canvas overlay */}
          {celebrationActive && <CanvasCelebration confettiStyle={confettiStyle} />}

        </div>
      </div>

    </div>
  );
}
