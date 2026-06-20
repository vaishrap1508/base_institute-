'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Check, 
  X, 
  Bookmark, 
  Star, 
  Play, 
  Video, 
  MessageSquare, 
  Plus, 
  ChevronRight, 
  ChevronLeft, 
  Flag, 
  AlertTriangle, 
  FileText, 
  Send, 
  Clock, 
  Sparkles, 
  Cpu, 
  CheckCircle2, 
  ThumbsUp, 
  Edit3, 
  ExternalLink, 
  Lock, 
  Settings as SettingsIcon, 
  HelpCircle,
  AlertCircle,
  FolderOpen,
  Folder,
  Tag,
  BookOpen,
  PlusCircle,
  Sparkle,
  Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import 'katex/dist/katex.min.css';
import katex from 'katex';
import { Question, ResponseOption } from '@/lib/admin/types';

// Extract YouTube ID helper
const getYouTubeId = (url: string): string | null => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// Markdown + LaTeX Parser
const markdownToHtml = (md: string): string => {
  if (!md) return '';
  let html = md;
  
  // Escape HTML tags to prevent execution issues
  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  
  // Convert headings
  html = html.replace(/^### ([\s\S]*?)$/gm, '<h3 class="text-sm font-bold text-slate-800 dark:text-white uppercase mt-4 mb-2">$1</h3>');
  html = html.replace(/^## ([\s\S]*?)$/gm, '<h2 class="text-base font-bold text-slate-800 dark:text-white mt-5 mb-2">$1</h2>');
  html = html.replace(/^# ([\s\S]*?)$/gm, '<h1 class="text-lg font-bold text-slate-800 dark:text-white mt-6 mb-3">$1</h1>');

  // Convert Bold, Italic, Inline Code
  html = html.replace(/\*\*([\s\S]*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([\s\S]*?)\*/g, '<em>$1</em>');
  html = html.replace(/`([\s\S]*?)`/g, '<code class="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-855 rounded font-mono text-xs">$1</code>');
  
  // Convert LaTeX block math ($$...$$)
  html = html.replace(/\$\$([\s\S]*?)\$\$/g, '<div class="math-block" style="text-align: center; margin: 12px 0; padding: 8px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-family: \'Times New Roman\', Times, serif; font-style: italic; color: #2563eb;">$1</div>');

  // Convert LaTeX inline math ($...$)
  html = html.replace(/\$([^\$]+)\$/g, '<span class="math-tex" style="font-family: \'Times New Roman\', Times, serif; font-style: italic; color: #2563eb; background-color: #f8fafc; padding: 1px 4px; border: 1px solid #e2e8f0; border-radius: 4px; font-weight: 500;">$1</span>');
  
  // Convert newlines to breaks
  html = html.replace(/\n/g, '<br/>');
  
  return html;
};

// Safe Html Math component
function SafeHtmlWithMath({ html }: { html: string }) {
  if (!html) return null;
  const parts = html.split(/(\$\$[\s\S]*?\$\$|\$[^\$]+\$|<span class="math-tex"[^>]*>[\s\S]*?<\/span>|<div class="math-block"[^>]*>[\s\S]*?<\/div>)/g);
  
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('<div class="math-block"') && part.includes('</div>')) {
          const match = part.match(/>([\s\S]*?)<\/div>/);
          const math = match ? match[1] : '';
          try {
            const mathHtml = katex.renderToString(math, { displayMode: true, throwOnError: false });
            return <div key={index} style={{ textAlign: 'center', margin: '12px 0' }} dangerouslySetInnerHTML={{ __html: mathHtml }} />;
          } catch (e) {
            return <code key={index}>{math}</code>;
          }
        }
        else if (part.startsWith('<span class="math-tex"') && part.includes('</span>')) {
          const match = part.match(/>([\s\S]*?)<\/span>/);
          const math = match ? match[1] : '';
          try {
            const mathHtml = katex.renderToString(math, { displayMode: false, throwOnError: false });
            return <span key={index} dangerouslySetInnerHTML={{ __html: mathHtml }} />;
          } catch (e) {
            return <code key={index}>{math}</code>;
          }
        }
        else if (part.startsWith('$$') && part.endsWith('$$')) {
          const math = part.slice(2, -2);
          try {
            const mathHtml = katex.renderToString(math, { displayMode: true, throwOnError: false });
            return <div key={index} style={{ textAlign: 'center', margin: '12px 0' }} dangerouslySetInnerHTML={{ __html: mathHtml }} />;
          } catch (e) {
            return <code key={index}>{part}</code>;
          }
        }
        else if (part.startsWith('$') && part.endsWith('$')) {
          const math = part.slice(1, -1);
          try {
            const mathHtml = katex.renderToString(math, { displayMode: false, throwOnError: false });
            return <span key={index} dangerouslySetInnerHTML={{ __html: mathHtml }} />;
          } catch (e) {
            return <code key={index}>{part}</code>;
          }
        } 
        else {
          return <span key={index} dangerouslySetInnerHTML={{ __html: part }} />;
        }
      })}
    </>
  );
}

// Confetti Particle Interface
interface ConfettiParticle {
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  speedX: number;
  speedY: number;
  opacity: number;
}

interface RevisionMeta {
  saved: boolean;
  folder: string;
  priority: 'High' | 'Medium' | 'Low';
  notes: string;
  lastRevised: string;
}

interface PracticeArenaProps {
  questions: Question[];
  activeQuestion: Question | null;
  setActiveQuestion: (q: Question | null) => void;
  bookmarks: string[];
  toggleBookmark: (id: string) => void;
  submittedAnswers: Record<string, boolean>;
  setSubmittedAnswers: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  selectedAnswers: Record<string, string>;
  setSelectedAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  solvedCount: number;
  setSolvedCount: (val: number) => void;
  streak: number;
  setStreak: (val: number) => void;
}

export default function PracticeArena({
  questions,
  activeQuestion,
  setActiveQuestion,
  bookmarks,
  toggleBookmark,
  submittedAnswers,
  setSubmittedAnswers,
  selectedAnswers,
  setSelectedAnswers,
  solvedCount,
  setSolvedCount,
  streak,
  setStreak
}: PracticeArenaProps) {

  // Layout states
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'written' | 'video' | 'eli5' | 'notes'>('written');
  const [copiedFormulaText, setCopiedFormulaText] = useState<boolean>(false);

  // Quick Save & Library Drawers
  const [isSaveDrawerOpen, setIsSaveDrawerOpen] = useState<boolean>(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState<boolean>(false);
  const [isDiscussionOpen, setIsDiscussionOpen] = useState<boolean>(false);
  const [isQuickNotesOpen, setIsQuickNotesOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  // Formula sheet drawer
  const [isFormulaDrawerOpen, setIsFormulaDrawerOpen] = useState<boolean>(false);

  // Progressive Hints
  const [showHint1, setShowHint1] = useState<boolean>(false);
  const [showHint2, setShowHint2] = useState<boolean>(false);
  const [showHint3, setShowHint3] = useState<boolean>(false);

  // Shortcut expansion
  const [isShortcutExpanded, setIsShortcutExpanded] = useState<boolean>(false);

  // Local Storage Revision Meta Database
  const [revisionDB, setRevisionDB] = useState<Record<string, RevisionMeta>>({});
  const [customFolders, setCustomFolders] = useState<string[]>(['Arithmetic Shortcuts', 'TCS NQT Prep', 'Infosys Logic', 'Geometry Formulas']);
  const [newFolderNameInput, setNewFolderNameInput] = useState<string>('');

  // Active question revision meta shortcut helpers
  const activeMeta = useMemo((): RevisionMeta => {
    if (!activeQuestion) return { saved: false, folder: 'All Saved', priority: 'Medium', notes: '', lastRevised: '' };
    return revisionDB[activeQuestion.id] || {
      saved: bookmarks.includes(activeQuestion.id),
      folder: 'All Saved',
      priority: 'Medium',
      notes: '',
      lastRevised: ''
    };
  }, [activeQuestion, revisionDB, bookmarks]);

  // Get Question Status helper
  const getQuestionStatus = () => {
    if (!activeQuestion) return { label: 'Unattempted', color: 'text-slate-500 bg-slate-500/10 border-slate-500/20 dark:text-slate-400', dot: '⚪' };
    const isSolved = submittedAnswers[activeQuestion.id];
    const isBookmarked = bookmarks.includes(activeQuestion.id);
    const isHard = hardQuestions.includes(activeQuestion.id);
    const hasNotes = activeMeta.notes && activeMeta.notes.trim().length > 0;
    
    if (isSolved && hasNotes && !isHard) {
      return { label: 'Mastered', color: 'text-purple-700 bg-purple-500/10 border-purple-500/20 dark:text-purple-400 dark:border-purple-900/50', dot: '🟣' };
    }
    if (isSolved && isHard) {
      return { label: 'Needs Revision', color: 'text-amber-700 bg-amber-500/10 border-amber-500/20 dark:text-amber-400 dark:border-amber-900/50', dot: '🟡' };
    }
    if (isSolved) {
      return { label: 'Solved', color: 'text-emerald-700 bg-emerald-500/10 border-emerald-500/20 dark:text-emerald-400 dark:border-emerald-900/50', dot: '🟢' };
    }
    if (isBookmarked) {
      return { label: 'Bookmarked', color: 'text-blue-700 bg-blue-500/10 border-blue-500/20 dark:text-blue-400 dark:border-blue-900/50', dot: '🔵' };
    }
    return { label: 'Unattempted', color: 'text-slate-550 bg-slate-500/5 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400', dot: '⚪' };
  };

  // Temporary drawer edit states
  const [drawerFolder, setDrawerFolder] = useState<string>('All Saved');
  const [drawerPriority, setDrawerPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [drawerNotes, setDrawerNotes] = useState<string>('');

  // Search/Filters for Revision Library Bottom Sheet
  const [librarySearch, setLibrarySearch] = useState<string>('');
  const [libraryActiveFilter, setLibraryActiveFilter] = useState<string>('all_saved'); // 'all_saved', 'last_50', 'hard', 'no_notes', or specific custom folder name
  const [newFolderLibInput, setNewFolderLibInput] = useState<string>('');

  // Sort criteria inside library Content Feed
  const [librarySortBy, setLibrarySortBy] = useState<'date' | 'topic' | 'revised' | 'priority'>('date');

  // Report Modal states
  const [reportType, setReportType] = useState<string>('Wrong Answer');
  const [reportDetails, setReportDetails] = useState<string>('');

  // Confetti canvas ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Toast systems
  const [toastMessage, setToastMessage] = useState<{ text: string; isSuccess: boolean } | null>(null);
  const [reportConfirmation, setReportConfirmation] = useState<boolean>(false);

  // Timer stopwatch states
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerPaused, setIsTimerPaused] = useState<boolean>(false);

  // Mark as hard state list
  const [hardQuestions, setHardQuestions] = useState<string[]>([]);

  // Video walkthrough states
  const [isVideoActive, setIsVideoActive] = useState<boolean>(false);

  // ELI5 simulation states
  const [eli5Text, setEli5Text] = useState<string[]>([]);
  const [isEli5Generating, setIsEli5Generating] = useState<boolean>(false);

  // Discussion states
  const [discussionTab, setDiscussionTab] = useState<'comments' | 'peer_shortcuts' | 'community_notes' | 'tricks'>('comments');
  const [commentsList, setCommentsList] = useState<Array<{ id: string; user: string; avatar: string; comment: string; time: string; likes: number; isLiked?: boolean }>>([]);
  const [commentInput, setCommentInput] = useState<string>('');

  // Load Revision DB, Custom Folders, and Hard questions on mount
  useEffect(() => {
    const storedDB = localStorage.getItem('aptitude_revision_db');
    if (storedDB) {
      setRevisionDB(JSON.parse(storedDB));
    }
    const storedFolders = localStorage.getItem('aptitude_custom_folders');
    if (storedFolders) {
      setCustomFolders(JSON.parse(storedFolders));
    }
    const storedHard = localStorage.getItem('aptitude_hard_questions');
    if (storedHard) {
      setHardQuestions(JSON.parse(storedHard));
    }
  }, []);

  // Sync active question state adjustments
  useEffect(() => {
    if (!activeQuestion) return;

    // Load selected option if already solved or stored
    setSelectedOptionId(selectedAnswers[activeQuestion.id] || null);

    // Reset video active state
    setIsVideoActive(false);

    // Reset ELI5 state
    setEli5Text([]);
    setIsEli5Generating(false);

    // Reset timer for the new question
    setTimerSeconds(0);
    setIsTimerPaused(false);

    // Sync drawer edit states
    setDrawerFolder(activeMeta.folder || 'All Saved');
    setDrawerPriority(activeMeta.priority || 'Medium');
    setDrawerNotes(activeMeta.notes || '');

    // Reset progressive hints
    setShowHint1(false);
    setShowHint2(false);
    setShowHint3(false);

    // Set shortcut note expansion state initially based on if solved
    setIsShortcutExpanded(!!submittedAnswers[activeQuestion.id]);

    // Default the Library sheet's active filter to current question topic context
    const defaultFilter = activeQuestion.domainId === 'quant' 
      ? 'Arithmetic Shortcuts' 
      : activeQuestion.domainId === 'logical' 
        ? 'Infosys Logic' 
        : 'all_saved';
    setLibraryActiveFilter(defaultFilter);

    // Load comments list
    const mockComments = [
      { id: '1', user: 'Ananya Sharma', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', comment: 'The selling price formula shortcut is extremely handy here. Saved me solid two minutes!', time: '2h ago', likes: 14 },
      { id: '2', user: 'Rohit Verma', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', comment: 'Are questions of this standard standard for TCS NQT exam qualifiers?', time: '1d ago', likes: 8 },
      { id: '3', user: 'Sriram Neppalli', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', comment: 'Tip: CP = (100 * profit) / profit% works, but modelingCP as 100x is less error-prone when discounts change mid-problem.', time: '3d ago', likes: 25 }
    ];
    setCommentsList(mockComments);

  }, [activeQuestion, activeMeta]);

  // Auto expand shortcut notes when question gets submitted/solved
  useEffect(() => {
    if (activeQuestion && submittedAnswers[activeQuestion.id]) {
      setIsShortcutExpanded(true);
    }
  }, [submittedAnswers, activeQuestion]);

  // Timer Tick implementation
  useEffect(() => {
    if (isTimerPaused || !activeQuestion) return;
    const interval = setInterval(() => {
      setTimerSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerPaused, activeQuestion]);

  // Keyboard Navigation Prev / Next
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeQuestion, questions]);

  // Save revision meta update
  const saveRevisionMeta = (qId: string, updates: Partial<RevisionMeta>) => {
    setRevisionDB(prev => {
      const current = prev[qId] || {
        saved: bookmarks.includes(qId),
        folder: 'All Saved',
        priority: 'Medium',
        notes: '',
        lastRevised: ''
      };
      
      const updated = {
        ...current,
        ...updates,
        lastRevised: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      };

      const nextDB = { ...prev, [qId]: updated };
      localStorage.setItem('aptitude_revision_db', JSON.stringify(nextDB));
      return nextDB;
    });
  };

  // Sync bookmark star action to Quick Save drawer
  const handleBookmarkStarClick = () => {
    if (!activeQuestion) return;
    
    // Toggle bookmark list status
    const isCurrentlySaved = bookmarks.includes(activeQuestion.id);
    if (!isCurrentlySaved) {
      toggleBookmark(activeQuestion.id);
      saveRevisionMeta(activeQuestion.id, { saved: true });
      // Toast message
      setToastMessage({ text: 'Saved to Library! 🌟', isSuccess: true });
      setTimeout(() => setToastMessage(null), 2000);
    }
    
    // Open floating save drawer
    setIsSaveDrawerOpen(true);
  };

  // Quick save commit handler
  const handleSaveDrawerSubmit = () => {
    if (!activeQuestion) return;
    saveRevisionMeta(activeQuestion.id, {
      folder: drawerFolder,
      priority: drawerPriority,
      notes: drawerNotes,
      saved: true
    });
    setIsSaveDrawerOpen(false);
    setToastMessage({ text: 'Revision Settings Updated! ⚡', isSuccess: true });
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Add custom folder dynamically
  const handleAddFolder = (name: string, clearFn: () => void) => {
    const trimmed = name.trim();
    if (!trimmed || customFolders.includes(trimmed)) return;
    const nextFolders = [...customFolders, trimmed];
    setCustomFolders(nextFolders);
    localStorage.setItem('aptitude_custom_folders', JSON.stringify(nextFolders));
    clearFn();
    setToastMessage({ text: `Created folder "${trimmed}"`, isSuccess: true });
    setTimeout(() => setToastMessage(null), 2000);
  };

  // Cycle priority helper
  const handleCyclePriority = () => {
    if (!activeQuestion) return;
    const priorityCycle: Array<'High' | 'Medium' | 'Low'> = ['High', 'Medium', 'Low'];
    const nextIndex = (priorityCycle.indexOf(activeMeta.priority) + 1) % priorityCycle.length;
    const nextPriority = priorityCycle[nextIndex];
    saveRevisionMeta(activeQuestion.id, { priority: nextPriority });
  };

  if (!activeQuestion) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <AlertCircle className="w-12 h-12 text-slate-300 mb-2" />
        <span className="text-sm font-bold uppercase tracking-wider">No active question</span>
      </div>
    );
  }

  // SVG Radar metrics
  const attemptsCount = activeQuestion.difficulty === 'EASY' ? '18.2K' : activeQuestion.difficulty === 'MEDIUM' ? '12.4K' : '5.8K';
  const accuracyRate = activeQuestion.difficulty === 'EASY' ? '84%' : activeQuestion.difficulty === 'MEDIUM' ? '67%' : '42%';

  // Breadcrumbs text
  const domainText = activeQuestion.domainId === 'quant' ? 'Arithmetic' : activeQuestion.domainId === 'logical' ? 'Logical Sequences' : 'Verbal Mastery';
  const topicText = activeQuestion.subTopicId.charAt(0).toUpperCase() + activeQuestion.subTopicId.slice(1);
  const conceptText = activeQuestion.conceptId.replace('-', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  // MCQ correctness status checks
  const isQuestionSubmitted = submittedAnswers[activeQuestion.id];
  const currentIndex = questions.findIndex(q => q.id === activeQuestion.id);

  // Trigger Confetti Canvas emitter
  const triggerConfetti = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const particles: ConfettiParticle[] = [];
    const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6'];

    for (let i = 0; i < 150; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height * 0.9,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        speedX: (Math.random() - 0.5) * 20,
        speedY: -Math.random() * 18 - 12,
        opacity: 1,
      });
    }

    let animationId: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let active = false;

      particles.forEach((p) => {
        if (p.opacity <= 0) return;
        active = true;

        p.x += p.speedX;
        p.y += p.speedY;
        p.speedY += 0.45;
        p.speedX *= 0.98;
        p.rotation += p.rotationSpeed;
        
        if (p.y > canvas.height * 0.3) {
          p.opacity -= 0.015;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      if (active) {
        animationId = requestAnimationFrame(render);
      }
    };

    render();
  };

  // Submit Answer Action
  const handleSubmitAnswer = async () => {
    if (!selectedOptionId) return;
    setIsEvaluating(true);

    setTimeout(() => {
      setIsEvaluating(false);
      
      const chosenOption = activeQuestion.options.find(o => o.id === selectedOptionId);
      const isCorrect = chosenOption?.isCorrect || false;

      if (isCorrect && !submittedAnswers[activeQuestion.id]) {
        const newSolved = solvedCount + 1;
        const newStreak = streak + 1;
        setSolvedCount(newSolved);
        setStreak(newStreak);
        localStorage.setItem('aptitude_solved_count', String(newSolved));
        localStorage.setItem('aptitude_streak', String(newStreak));
        
        triggerConfetti();
      }

      setSubmittedAnswers(prev => ({ ...prev, [activeQuestion.id]: true }));
      setSelectedAnswers(prev => ({ ...prev, [activeQuestion.id]: selectedOptionId }));

      setToastMessage({
        text: isCorrect ? 'Correct! 🔥' : 'Not quite yet. 🎯',
        isSuccess: isCorrect
      });

      setTimeout(() => {
        setToastMessage(null);
      }, 3500);

    }, 1200);
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setActiveQuestion(questions[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setActiveQuestion(questions[currentIndex + 1]);
    }
  };

  const handleToggleHard = () => {
    let nextList: string[];
    if (hardQuestions.includes(activeQuestion.id)) {
      nextList = hardQuestions.filter(id => id !== activeQuestion.id);
    } else {
      nextList = [...hardQuestions, activeQuestion.id];
      setToastMessage({ text: 'Added to revision bucket! ⚡', isSuccess: true });
      setTimeout(() => setToastMessage(null), 2500);
    }
    setHardQuestions(nextList);
    localStorage.setItem('aptitude_hard_questions', JSON.stringify(nextList));
  };

  const handleReportSubmit = () => {
    setIsReportModalOpen(false);
    setReportConfirmation(true);
    setReportDetails('');
    setTimeout(() => setReportConfirmation(false), 3000);
  };

  const handleCopyFormula = () => {
    const latexBlocks = activeQuestion.questionStem.match(/\$$([\s\S]*?)\$\$/) || activeQuestion.questionStem.match(/\$([^\$]+)\$/);
    const formulaText = latexBlocks ? latexBlocks[1].trim() : activeQuestion.questionStem;
    navigator.clipboard.writeText(formulaText);
    setCopiedFormulaText(true);
    setTimeout(() => setCopiedFormulaText(false), 2000);
  };

  const handleStartEli5 = () => {
    setIsEli5Generating(true);
    let bullets: string[] = [];
    if (activeQuestion.domainId === 'quant') {
      bullets = [
        "🍪 Think of it like selling cookies: if you buy ingredients cheaper (20% discount) but sell each cookie for slightly less ($10 off), your profit rate actually goes up because your cost was much lower!",
        "⚡ Shortcut: Skip complex algebra! Always assume the original cost price is 100 parts ($100x$). Then the old sales price is 120 parts. A 25% gain on 80 parts new cost equals 100 parts new sales price. Difference = 20 parts = $10. Hence, CP = 100 parts = $50.",
        "🎓 Exam Tip: TCS NQT rounds love markup/discount variations. The 100x method is the fastest way to avoid arithmetic errors."
      ];
    } else if (activeQuestion.domainId === 'logical') {
      bullets = [
        "🎡 Think of seating on a Ferris Wheel: if you anchor the first person at the very bottom, mapping everyone else relative to them becomes simple left/right spacing.",
        "⚡ Shortcut: Start directly with absolute clues (e.g., 'X sits opposite Y'). Never start with relative branching conditions like 'A is near B'.",
        "🎓 Exam Tip: Always verify the direction candidates face (inward vs. outward). Opposite directions flip relative left and right orientations."
      ];
    } else {
      bullets = [
        "✍️ Think of a 'prolific' writer like standard dictionary definitions: someone who writes dozens of books, not someone who has writer's block. It means highly productive!",
        "⚡ Shortcut: Match the prefix tone. 'Pro-' indicates positive, active progression (e.g. forward, product). Eliminate options with negative roots (e.g., barren, scarce).",
        "🎓 Exam Tip: Look for contextual sentences. A prolific actor is always in demand, pointing directly to high output rate."
      ];
    }

    setEli5Text([]);
    let index = 0;
    const interval = setInterval(() => {
      if (index < bullets.length) {
        setEli5Text(prev => [...prev, bullets[index]]);
        index++;
      } else {
        clearInterval(interval);
        setIsEli5Generating(false);
      }
    }, 1200);
  };

  const handleJumpToTimestamp = (sec: number) => {
    setIsVideoActive(true);
    const ytId = getYouTubeId(activeQuestion.videoUrl);
    if (!ytId) return;
    const iframe = document.getElementById('youtube-solution-player') as HTMLIFrameElement;
    if (iframe) {
      iframe.src = `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&start=${sec}`;
    }
  };

  const handleLikeComment = (id: string) => {
    setCommentsList(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, likes: c.isLiked ? c.likes - 1 : c.likes + 1, isLiked: !c.isLiked };
      }
      return c;
    }));
  };

  const handleAddComment = () => {
    if (!commentInput.trim()) return;
    const newComment = {
      id: `new_${Date.now()}`,
      user: 'Vaishnavi Raparthy (You)',
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Charlie',
      comment: commentInput,
      time: 'Just now',
      likes: 0,
      isLiked: false
    };
    setCommentsList(prev => [newComment, ...prev]);
    setCommentInput('');
  };

  // Revision calculations
  const totalSavedCount = Object.keys(revisionDB).filter(id => revisionDB[id]?.saved).length;
  const hardCount = hardQuestions.length;
  const noNotesCount = questions.filter(q => !revisionDB[q.id]?.notes).length;

  // Custom folder count index helper
  const getFolderCount = (fName: string) => {
    return Object.keys(revisionDB).filter(id => revisionDB[id]?.folder === fName && revisionDB[id]?.saved).length;
  };

  // Filter feed questions listings inside the Revision Library
  const filteredLibraryQuestions = useMemo(() => {
    let list = questions.filter(q => {
      const meta = revisionDB[q.id];
      
      // Filter constraints
      if (libraryActiveFilter === 'all_saved') return meta?.saved;
      if (libraryActiveFilter === 'last_50') return meta?.saved; // simplicity mock maps all saved
      if (libraryActiveFilter === 'hard') return hardQuestions.includes(q.id);
      if (libraryActiveFilter === 'no_notes') return !meta?.notes && meta?.saved;
      
      // Custom folder matching
      return meta?.folder === libraryActiveFilter && meta?.saved;
    });

    // Text Search constraints
    if (librarySearch.trim()) {
      const qry = librarySearch.toLowerCase();
      list = list.filter(q => 
        q.id.toLowerCase().includes(qry) ||
        q.questionStem.toLowerCase().includes(qry) ||
        (revisionDB[q.id]?.notes || '').toLowerCase().includes(qry)
      );
    }

    // Sort constraints
    list.sort((a, b) => {
      const mA = revisionDB[a.id];
      const mB = revisionDB[b.id];
      
      if (librarySortBy === 'priority') {
        const weight = { 'High': 3, 'Medium': 2, 'Low': 1 };
        return (weight[mB?.priority || 'Medium'] || 0) - (weight[mA?.priority || 'Medium'] || 0);
      }
      if (librarySortBy === 'topic') {
        return a.domainId.localeCompare(b.domainId);
      }
      if (librarySortBy === 'revised') {
        return (mB?.lastRevised || '').localeCompare(mA?.lastRevised || '');
      }
      // Date default
      return b.id.localeCompare(a.id);
    });

    return list;
  }, [questions, revisionDB, hardQuestions, libraryActiveFilter, librarySearch, librarySortBy]);

  // Today's High Priority revision list
  const highPriorityQueue = useMemo(() => {
    return questions.filter(q => {
      const meta = revisionDB[q.id];
      return meta?.saved && meta?.priority === 'High';
    });
  }, [questions, revisionDB]);

  // Helper function to highlight matching search text
  const highlightSearchText = (text: string, search: string) => {
    if (!search.trim()) return <span>{text}</span>;
    const parts = text.split(new RegExp(`(${search})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === search.toLowerCase() 
            ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 text-slate-900 rounded px-0.5">{part}</mark>
            : part
        )}
      </span>
    );
  };

  return (
    <div className="w-full relative text-slate-800 dark:text-slate-100 flex flex-col min-h-screen pb-24 select-text">
      
      {/* Absolute canvas confetti overlay */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50 w-full h-full" />

      {/* Floating feedback toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl border font-bold text-sm tracking-wide ${
              toastMessage.isSuccess 
                ? 'bg-emerald-600 text-white border-emerald-500' 
                : 'bg-rose-600 text-white border-rose-500'
            }`}
          >
            <span>{toastMessage.text}</span>
          </motion.div>
        )}

        {reportConfirmation && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4.5 rounded-2xl shadow-xl bg-slate-900 border border-slate-850 text-white font-bold text-xs uppercase tracking-wider"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Error Report submitted. Thank you!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky Header Glass Panel */}
      <header className="sticky top-0 z-30 w-full border-b border-slate-200/80 bg-white/70 backdrop-blur-md dark:bg-slate-950/70 dark:border-slate-900 px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Left segments: Breadcrumbs & Meta */}
        <div className="flex flex-col gap-1 text-left">
          {/* Breadcrumb nav links */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400 font-medium select-none">
            <span className="hover:text-blue-500 cursor-pointer">QA</span>
            <span className="text-[10px]">/</span>
            <span className="hover:text-blue-500 cursor-pointer">{domainText}</span>
            <span className="text-[10px]">/</span>
            <span className="hover:text-blue-500 cursor-pointer">{conceptText}</span>
            <span className="text-[10px]">/</span>
            <span className="text-slate-500 font-bold">Question #{activeQuestion.id}</span>
          </div>

          {/* Core metadata badges row */}
          <div className="flex flex-wrap items-center gap-3 mt-1.5 select-none">
            <span className={`text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full border ${
              activeQuestion.difficulty === 'EASY' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900' 
                : activeQuestion.difficulty === 'MEDIUM'
                  ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900'
                  : 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900'
            }`}>
              {activeQuestion.difficulty}
            </span>
            
            <span className="text-[10.5px] font-semibold text-slate-400 dark:text-slate-500">
              Attempts: <strong className="text-slate-600 dark:text-slate-350">{attemptsCount}</strong>
            </span>
            <span className="text-[10.5px] font-semibold text-slate-400 dark:text-slate-500">
              Accuracy: <strong className="text-slate-600 dark:text-slate-350">{accuracyRate}</strong>
            </span>

            {/* Asked in badges */}
            <div className="flex items-center gap-1.5 ml-2 border-l border-slate-200 dark:border-slate-800 pl-3">
              <span className="text-[9px] font-bold text-slate-405 tracking-wider uppercase">Asked In:</span>
              <div className="flex items-center gap-1.5">
                {(activeQuestion.companyTags.length > 0 ? activeQuestion.companyTags : ['TCS', 'Amazon']).map(company => {
                  const compKey = company.toUpperCase();
                  const compStyles: Record<string, string> = {
                    AMAZON: 'bg-orange-500/10 border-orange-500/25 text-orange-700 dark:text-orange-400 dark:border-orange-950/40',
                    TCS: 'bg-blue-600/10 border-blue-600/25 text-blue-700 dark:text-blue-400 dark:border-blue-950/40',
                    INFOSYS: 'bg-indigo-600/10 border-indigo-600/25 text-indigo-700 dark:text-indigo-400 dark:border-indigo-950/40',
                    WIPRO: 'bg-purple-500/10 border-purple-500/25 text-purple-700 dark:text-purple-400 dark:border-purple-950/40',
                    COGNIZANT: 'bg-teal-500/10 border-teal-500/25 text-teal-700 dark:text-teal-400 dark:border-teal-950/40',
                  };
                  const style = compStyles[compKey] || 'bg-slate-100 dark:bg-slate-900 border-slate-200 text-slate-550 dark:text-slate-400 dark:border-slate-800';
                  return (
                    <span key={company} className={`text-[9.5px] font-extrabold uppercase px-2 py-0.5 border rounded-md font-mono ${style}`}>
                      💼 {company}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Folder & Priority Revision Chips */}
          <div className="flex flex-wrap items-center gap-2 mt-2.5 select-none">
            <button 
              onClick={handleBookmarkStarClick}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider cursor-pointer border transition-colors ${
                activeMeta.saved
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-500/15'
                  : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-450 hover:bg-slate-200 dark:hover:bg-slate-800/80'
              }`}
            >
              <Star className={`w-2.5 h-2.5 ${activeMeta.saved ? 'fill-current text-amber-500' : ''}`} />
              <span>{activeMeta.saved ? '⭐ Saved' : 'Save Question'}</span>
            </button>

            <button 
              onClick={() => setIsSaveDrawerOpen(true)}
              className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 text-slate-655 dark:text-slate-400 px-2.5 py-0.5 rounded-full text-[9.5px] font-extrabold cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800/85"
            >
              <FolderOpen className="w-2.5 h-2.5 text-blue-500" />
              <span>📂 {activeMeta.folder || 'All Saved'}</span>
            </button>

            <button 
              onClick={handleCyclePriority}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider cursor-pointer transition-colors ${
                activeMeta.priority === 'High' 
                  ? 'bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-450 hover:bg-rose-500/15'
                  : activeMeta.priority === 'Medium'
                    ? 'bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-450 hover:bg-amber-500/15'
                    : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-450 hover:bg-emerald-500/15'
              }`}
              title="Click to cycle priority"
            >
              <span className="shrink-0">{activeMeta.priority === 'High' ? '🔴' : activeMeta.priority === 'Medium' ? '🟡' : '🟢'}</span>
              <span>{activeMeta.priority} Priority</span>
            </button>

            {activeMeta.lastRevised && (
              <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-850/60 text-slate-400 px-2.5 py-0.5 rounded-full text-[9px] font-semibold">
                <span>🕒 Revised {activeMeta.lastRevised}</span>
              </div>
            )}
          </div>

        </div>

        {/* Right segment: status, momentum, timer & Star bookmark */}
        <div className="flex flex-wrap items-center gap-3 self-end sm:self-auto select-none justify-end">
          
          {/* Solving Momentum Widget */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-full text-xs font-bold text-orange-600 dark:text-orange-400 shadow-xs" title="Your current correct answer streak and total solved questions today">
            <Flame className="w-3.5 h-3.5 text-orange-500 fill-current animate-pulse" />
            <span>🔥 {streak} Streak • {solvedCount} Solved</span>
          </div>

          {/* Question Status Badge */}
          {(() => {
            const status = getQuestionStatus();
            return (
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${status.color}`}>
                <span>{status.dot}</span>
                <span>{status.label}</span>
              </div>
            );
          })()}

          {/* Live stopwatch pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 dark:bg-slate-900/60 dark:border-slate-800 rounded-full shadow-xs">
            <Clock className={`w-3.5 h-3.5 ${isTimerPaused ? 'text-rose-600' : 'text-slate-400'}`} />
            <span className="font-mono text-xs font-black tracking-wide text-slate-600 dark:text-slate-350">
              {Math.floor(timerSeconds / 60).toString().padStart(2, '0')}:{(timerSeconds % 60).toString().padStart(2, '0')}
            </span>
            <button 
              onClick={() => setIsTimerPaused(!isTimerPaused)} 
              className={`w-1.5 h-1.5 rounded-full cursor-pointer hover:scale-125 transition-transform ${isTimerPaused ? 'bg-rose-600' : 'bg-emerald-500 animate-pulse'}`}
              title={isTimerPaused ? "Resume Timer" : "Pause Timer"}
            />
          </div>

          {/* star bookmark button */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={handleBookmarkStarClick}
            className={`p-2 rounded-xl border cursor-pointer hover:scale-105 transition-all ${
              activeMeta.saved
                ? 'bg-amber-50 border-amber-300 text-amber-500 dark:bg-amber-950/20 dark:border-amber-900'
                : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600 dark:bg-slate-900 dark:border-slate-800'
            }`}
            title="Save to Library Folder"
          >
            <Star className={`w-4.5 h-4.5 stroke-[2.5] ${activeMeta.saved ? 'fill-current' : ''}`} />
          </motion.button>
        </div>

      </header>

      {/* Main Workspace Panels */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-start">
          
          {/* Left panel Question + options (7 columns) */}
          <section className="lg:col-span-7 space-y-6 text-left">
            
            {/* Question Card */}
            <div className="bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-900 rounded-3xl p-6 md:p-8 space-y-6 shadow-xs relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-500/2 to-transparent pointer-events-none" />

              <div className="flex justify-between items-start gap-4">
                <h1 className="text-xl md:text-2xl font-bold font-heading text-slate-800 dark:text-white leading-snug tracking-tight">
                  <SafeHtmlWithMath html={markdownToHtml(activeQuestion.questionStem.split('###')[0].trim())} />
                </h1>
                
                {/* Formula Sheet Trigger */}
                <button
                  onClick={() => setIsFormulaDrawerOpen(true)}
                  className="px-3 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl border border-slate-205 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:bg-slate-900 dark:border-slate-850 dark:hover:bg-slate-800 dark:text-slate-400 shrink-0 cursor-pointer flex items-center gap-1.5 transition-colors select-none"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>📖 Formula Sheet</span>
                </button>
              </div>

              {/* Pitfalls Learning Context Card */}
              <div className="p-4 bg-rose-500/5 dark:bg-rose-950/10 border border-rose-500/10 dark:border-rose-900/35 rounded-2xl text-xs flex gap-3 text-left">
                <AlertCircle className="w-5 h-5 text-rose-505 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block text-[10px] mb-1 select-none">Common Pitfalls & Concepts</span>
                  <p className="text-slate-600 dark:text-slate-400 font-medium">
                    Students solving this question often struggle with:{' '}
                    {activeQuestion.domainId === 'quant' ? (
                      <span className="font-bold text-slate-700 dark:text-slate-350">✓ Percentage base mismatches, ✓ Reverse profit compounding, ✓ Fraction approximations.</span>
                    ) : activeQuestion.domainId === 'logical' ? (
                      <span className="font-bold text-slate-700 dark:text-slate-355">✓ Relative direction reversals, ✓ Overlooking circular boundaries, ✓ Branching case assumptions.</span>
                    ) : (
                      <span className="font-bold text-slate-700 dark:text-slate-355">✓ Context tone interpretation, ✓ Neglecting secondary definitions, ✓ Confusing synonym roots.</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Math preview highlight */}
              {activeQuestion.questionStem.includes('$$') && (
                <div className="p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-250/50 dark:border-slate-850 rounded-2xl flex items-center gap-2 select-none">
                  <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Supports KaTeX Math Formulas</span>
                </div>
              )}
            </div>

            {/* Personal Shortcut Card (collapsed before solving, expanded after solving) */}
            {activeMeta.notes && (
              <div className="p-5 bg-amber-500/5 dark:bg-amber-950/10 border border-amber-500/15 dark:border-amber-900/35 rounded-3xl relative overflow-hidden text-left">
                {!isShortcutExpanded ? (
                  <button 
                    onClick={() => setIsShortcutExpanded(true)}
                    className="w-full flex items-center justify-between text-xs font-black uppercase text-amber-600 dark:text-amber-405 tracking-wider cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkle className="w-4 h-4 fill-current animate-pulse text-amber-550" />
                      <span>💡 Personal Notes Available</span>
                    </div>
                    <span className="text-[10px] hover:underline">[ Click to Expand ]</span>
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center shrink-0">
                      <Sparkle className="w-5 h-5 fill-current" />
                    </div>
                    
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex justify-between items-center select-none">
                        <span className="text-xs font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider">💡 My Shortcut</span>
                        <button 
                          onClick={() => setIsShortcutExpanded(false)}
                          className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                        >
                          [ Collapse ]
                        </button>
                      </div>

                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-350 leading-relaxed italic pr-4">
                        <SafeHtmlWithMath html={markdownToHtml(activeMeta.notes)} />
                      </p>

                      <button
                        onClick={() => {
                          setActiveTab('notes');
                          if (!isQuestionSubmitted) {
                            setIsQuickNotesOpen(true);
                          }
                        }}
                        className="text-[9.5px] font-black text-amber-600 hover:text-amber-700 underline uppercase tracking-wider block pt-1 select-none cursor-pointer"
                      >
                        [ Edit Shortcut ]
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* MCQ grid Options */}
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block select-none">Interactive Options</span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeQuestion.options.map((opt) => {
                  const isOptionSelected = selectedOptionId === opt.id;
                  const isCorrectAnswer = opt.isCorrect;
                  const isUserChosen = selectedAnswers[activeQuestion.id] === opt.id;

                  const showCorrect = isQuestionSubmitted && isCorrectAnswer;
                  const showWrong = isQuestionSubmitted && isUserChosen && !isCorrectAnswer;

                  return (
                    <motion.button
                      key={opt.id}
                      disabled={isQuestionSubmitted}
                      onClick={() => setSelectedOptionId(opt.id)}
                      whileHover={!isQuestionSubmitted ? { scale: 1.01, translateY: -2 } : {}}
                      whileTap={!isQuestionSubmitted ? { scale: 0.99 } : {}}
                      className={`p-5 rounded-2xl border text-left flex items-start justify-between gap-4 text-sm transition-all duration-205 relative overflow-hidden group cursor-pointer ${
                        showCorrect
                          ? 'border-emerald-500 bg-emerald-50/50 dark:border-emerald-600 dark:bg-emerald-950/20 text-emerald-955 dark:text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                          : showWrong
                            ? 'border-rose-500 bg-rose-50/50 dark:border-rose-600 dark:bg-rose-955/20 text-rose-955 dark:text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.1)] animate-shake'
                            : isOptionSelected
                              ? 'border-blue-605 bg-blue-50/30 dark:border-blue-500 dark:bg-blue-955/30 text-slate-900 dark:text-white font-bold shadow-xs'
                              : 'border-slate-200 bg-white hover:border-blue-500/30 hover:shadow-md dark:border-slate-900 dark:bg-slate-955/40 dark:hover:border-slate-800 text-slate-700 dark:text-slate-350'
                      }`}
                    >
                      <div className="flex items-start gap-4 min-w-0">
                        <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono font-black text-xs shrink-0 border transition-all duration-200 ${
                          showCorrect
                            ? 'border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-900/30 dark:text-emerald-500'
                            : showWrong
                              ? 'border-rose-300 bg-rose-100 text-rose-800 dark:border-rose-800/40 dark:bg-rose-900/30 dark:text-rose-550'
                              : isOptionSelected
                                ? 'border-blue-400 bg-blue-100 text-blue-800 dark:border-blue-800/40 dark:bg-blue-900/30 dark:text-blue-450'
                                : 'border-slate-200 bg-slate-550 text-slate-500 dark:border-slate-850 dark:bg-slate-900/60 dark:text-slate-400'
                        }`}>
                          {opt.id}
                        </span>
                        
                        <div className="font-semibold pt-0.5 leading-relaxed">
                          <SafeHtmlWithMath html={markdownToHtml(opt.text)} />
                        </div>
                      </div>

                      {showCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />}
                      {showWrong && <X className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Progressive Hint System Card */}
            <div className="bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-900 rounded-3xl p-5 md:p-6 space-y-4 shadow-xs text-left">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block select-none">💡 Need a hand? Progressive Hints</span>
              
              <div className="space-y-3">
                {/* Hint 1 */}
                <div className="border border-slate-200 dark:border-slate-900 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setShowHint1(!showHint1)}
                    className="w-full flex items-center justify-between p-3.5 bg-slate-50/50 dark:bg-slate-900/30 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none hover:bg-slate-105/50 dark:hover:bg-slate-900/50"
                  >
                    <span>💡 Hint 1: Core Concept Clue</span>
                    <span className="text-[10px] text-blue-505 font-black uppercase tracking-wider">{showHint1 ? '[ Hide ]' : '[ Reveal ]'}</span>
                  </button>
                  {showHint1 && (
                    <div className="p-4 bg-white dark:bg-slate-950 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-900 leading-relaxed font-semibold animate-fadeIn">
                      <SafeHtmlWithMath html={markdownToHtml(
                        activeQuestion.domainId === 'quant'
                          ? "Let the cost price of the article be $100x$. What is the initial marked selling price at a 20% profit?"
                          : activeQuestion.domainId === 'logical'
                            ? "Anchor a key candidate seat first (e.g. seating opposite or in fixed spots) before analyzing relative adjacencies."
                            : "Identify the part of speech and tone of the word. Is it positive, negative, or neutral?"
                      )} />
                    </div>
                  )}
                </div>

                {/* Hint 2 */}
                <div className="border border-slate-200 dark:border-slate-900 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setShowHint2(!showHint2)}
                    className="w-full flex items-center justify-between p-3.5 bg-slate-50/50 dark:bg-slate-900/30 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none hover:bg-slate-105/50 dark:hover:bg-slate-900/50"
                  >
                    <span>💡 Hint 2: Equation / Steps Setup</span>
                    <span className="text-[10px] text-blue-505 font-black uppercase tracking-wider">{showHint2 ? '[ Hide ]' : '[ Reveal ]'}</span>
                  </button>
                  {showHint2 && (
                    <div className="p-4 bg-white dark:bg-slate-950 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-900 leading-relaxed font-semibold animate-fadeIn">
                      <SafeHtmlWithMath html={markdownToHtml(
                        activeQuestion.domainId === 'quant'
                          ? "If the cost price falls by 20%, the new cost price becomes $80x$. The markup profit is 25% on this new CP."
                          : activeQuestion.domainId === 'logical'
                            ? "Check the direction everyone is facing. Facing inward means clockwise is right and anti-clockwise is left."
                            : "Look for sentence prefix roots. 'Pro-' usually means forward, high-production, or positive."
                      )} />
                    </div>
                  )}
                </div>

                {/* Hint 3 */}
                <div className="border border-slate-200 dark:border-slate-900 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setShowHint3(!showHint3)}
                    className="w-full flex items-center justify-between p-3.5 bg-slate-50/50 dark:bg-slate-900/30 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none hover:bg-slate-105/50 dark:hover:bg-slate-900/50"
                  >
                    <span>💡 Hint 3: Step-by-Step Solve Shortcut</span>
                    <span className="text-[10px] text-blue-505 font-black uppercase tracking-wider">{showHint3 ? '[ Hide ]' : '[ Reveal ]'}</span>
                  </button>
                  {showHint3 && (
                    <div className="p-4 bg-white dark:bg-slate-955 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-900 leading-relaxed font-semibold animate-fadeIn">
                      <SafeHtmlWithMath html={markdownToHtml(
                        activeQuestion.domainId === 'quant'
                          ? "New SP = $80x \\times 1.25 = 100x$. The difference between the original SP ($120x$) and new SP ($100x$) is $20x$, which corresponds to $10$. Solve for $x$!"
                          : activeQuestion.domainId === 'logical'
                            ? "Draw the circular grid and eliminate candidates that violate the immediate neighbor bounds."
                            : "Eliminate options representing scarcity or passivity. Prolific implies high output rate."
                      )} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Question Bank Progress Tracker */}
            <div className="bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-900 rounded-3xl p-5 space-y-2.5 text-left">
              <div className="flex justify-between items-center select-none">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Overall Question Bank Progress</span>
                <span className="text-[11px] font-mono font-black text-blue-500 dark:text-blue-400">
                  {currentIndex + 1} / {questions.length} Questions
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-650 transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

          </section>

          {/* Right panel solution tabs (3 columns) */}
          <section className="col-span-1 lg:col-span-3 space-y-6 text-left">
            <div className="bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-900 rounded-3xl p-5 md:p-6 space-y-5 shadow-xs relative flex flex-col h-full min-h-[450px]">
              {!isQuestionSubmitted ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4 my-auto select-none animate-fadeIn">
                  <div className="w-14 h-14 bg-slate-105 dark:bg-slate-900 text-slate-400 dark:text-slate-505 rounded-full flex items-center justify-center">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xs font-black uppercase text-slate-800 dark:text-white tracking-widest">Solution Locked</h3>
                    <p className="text-[11px] text-slate-405 leading-relaxed max-w-[220px] mx-auto">
                      Solve this question to unlock step-by-step explanations, video walkthroughs, and AI insights.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Switcher headers */}
                  <div className="flex border-b border-slate-200 dark:border-slate-900 pb-0.5 justify-start gap-1 select-none overflow-x-auto scrollbar-none">
                    {[
                      { id: 'written', label: 'Written' },
                      { id: 'video', label: 'Video' },
                      { id: 'eli5', label: 'AI ELI5' },
                      { id: 'notes', label: 'My Notes' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider relative cursor-pointer whitespace-nowrap ${
                          activeTab === tab.id 
                            ? 'text-blue-600 dark:text-blue-400 font-extrabold'
                            : 'text-slate-400 hover:text-slate-650 dark:text-slate-500 dark:hover:text-slate-350'
                        }`}
                      >
                        {tab.label}
                        {activeTab === tab.id && (
                          <motion.div
                            layoutId="editorialActiveTabGlow"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                          />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Tab Panels */}
                  <div className="min-h-56">
                    
                    {activeTab === 'written' && (
                      <div className="space-y-4 animate-fadeIn text-xs leading-relaxed">
                        <div className="bg-slate-50/50 dark:bg-slate-900/20 p-4 border border-slate-200/60 dark:border-slate-850 rounded-2xl">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2 select-none">LaTeX Calculations</span>
                          <div className="text-slate-700 dark:text-slate-300 space-y-2">
                            <SafeHtmlWithMath html={markdownToHtml(activeQuestion.questionStem.split('###')[1] || activeQuestion.hintText || 'Formula derivation is loading...')} />
                          </div>
                        </div>

                        <div className="p-4 bg-emerald-500/5 dark:bg-emerald-950/10 border border-emerald-500/10 dark:border-emerald-900/35 rounded-2xl">
                          <h4 className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 select-none">
                            <Sparkles className="w-3.5 h-3.5" /> Key Insight
                          </h4>
                          <p className="mt-2 text-slate-600 dark:text-slate-400 font-medium">
                            {activeQuestion.domainId === 'quant' 
                              ? "Assuming base CP = 100x eliminates fractions. When CP drops to 80x and markup increases to 25%, SP becomes 100x, allowing quick linear mapping."
                              : "Start circular layouts by anchoring the absolute coordinates bottom node. Relative movements map outward safely."
                            }
                          </p>
                        </div>

                        <div className="p-4 bg-rose-500/5 dark:bg-rose-955/10 border border-rose-500/10 dark:border-rose-900/35 rounded-2xl">
                          <h4 className="text-[10px] font-black text-rose-700 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5 select-none">
                            <AlertTriangle className="w-3.5 h-3.5" /> Common Mistake
                          </h4>
                          <p className="mt-2 text-slate-600 dark:text-slate-400 font-medium">
                            {activeQuestion.domainId === 'quant'
                              ? "Failing to account for the profit markup on the NEW cost price (e.g. 25% on 80x) rather than the original 100x."
                              : "Confusing relative directions when candidates face outside the arrangement circle."
                            }
                          </p>
                        </div>
                      </div>
                    )}

                    {activeTab === 'video' && (
                      <div className="space-y-4 animate-fadeIn">
                        <div className="relative aspect-video bg-black border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs flex flex-col items-center justify-center group">
                          {(() => {
                            const ytId = getYouTubeId(activeQuestion.videoUrl);
                            if (ytId) {
                              if (isVideoActive) {
                                return (
                                  <iframe
                                    id="youtube-solution-player"
                                    width="100%"
                                    height="100%"
                                    src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="w-full h-full border-0 absolute inset-0"
                                  />
                                );
                              } else {
                                return (
                                  <>
                                    <img 
                                      src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} 
                                      alt="Video Walkthrough"
                                      className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-102 transition-transform duration-350"
                                    />
                                    <button
                                      onClick={() => setIsVideoActive(true)}
                                      className="z-10 w-11 h-11 bg-blue-600/90 text-white rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform cursor-pointer"
                                    >
                                      <Play className="w-5 h-5 fill-current ml-0.5" />
                                    </button>
                                  </>
                                );
                              }
                            }
                            return <span className="text-xs text-slate-500">Walkthrough video loading...</span>;
                          })()}
                        </div>

                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold px-0.5 select-none">
                          <span>By: <strong className="text-slate-650 dark:text-slate-350">Ravi Kumar</strong></span>
                          <span>Duration: <strong className="text-slate-650 dark:text-slate-350">{activeQuestion.videoDuration || '10 mins'}</strong></span>
                        </div>

                        {/* Chapters timestamp lists */}
                        <div className="space-y-2 border-t border-slate-100 dark:border-slate-900 pt-3 text-left">
                          <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest block select-none">Chapters Jump-To</span>
                          
                          <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1">
                            {(activeQuestion.domainId === 'quant' ? [
                              { time: '0:00', sec: 0, text: 'Variable modeling introduction' },
                              { time: '1:30', sec: 90, text: 'CP markup calculations' },
                              { time: '3:15', sec: 195, text: 'Setting up linear SP equations' },
                              { time: '5:45', sec: 345, text: 'Shortcut method demonstration' }
                            ] : [
                              { time: '0:00', sec: 0, text: 'Arrangement coordinates start' },
                              { time: '2:15', sec: 135, text: 'Anchoring seats logic' },
                              { time: '4:40', sec: 280, text: 'Final checklist solutions' }
                            ]).map((note, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleJumpToTimestamp(note.sec)}
                                className="p-2 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-105 hover:border-slate-200 dark:bg-slate-900 dark:border-slate-850 dark:hover:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-350 transition-colors flex items-center justify-between text-left cursor-pointer"
                              >
                                <span className="truncate">{note.text}</span>
                                <span className="font-mono text-[9px] font-black bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 px-1.5 py-0.2 rounded shrink-0">{note.time}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'eli5' && (
                      <div className="space-y-4 animate-fadeIn text-left">
                        <div className="p-4 bg-blue-500/5 border border-blue-500/10 dark:bg-blue-950/10 dark:border-blue-900/30 rounded-2xl text-xs space-y-3 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 blur-xl rounded-full animate-pulse" />
                          
                          <div className="flex items-center justify-between border-b border-blue-500/10 pb-2 select-none">
                            <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                              <Cpu className="w-4 h-4" /> AI ELI5 Explainer
                            </span>
                            <span className="text-[9px] font-mono font-bold text-slate-400">Model: GPT-4o</span>
                          </div>

                          {eli5Text.length === 0 && !isEli5Generating ? (
                            <div className="py-6 flex flex-col items-center justify-center text-center">
                              <p className="text-slate-505 font-semibold mb-4">
                                Need a simplified, intuitive analogy? Let the AI explain this concept simply!
                              </p>
                              <button
                                onClick={handleStartEli5}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                              >
                                <Sparkles className="w-3.5 h-3.5 animate-bounce" />
                                <span>Explain Like I'm 5</span>
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-3 font-medium text-slate-700 dark:text-slate-350">
                              {eli5Text.map((bullet, idx) => (
                                <motion.div
                                  key={idx}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  className="p-3 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-805 rounded-xl shadow-xs"
                                >
                                  {bullet}
                                </motion.div>
                              ))}
                              {isEli5Generating && (
                                <div className="flex items-center gap-1 text-blue-500 px-1.5 select-none">
                                  <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                  <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                  <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {activeTab === 'notes' && (
                      <div className="space-y-4 animate-fadeIn text-xs leading-relaxed text-left flex flex-col">
                        
                        {/* Notes meta chips */}
                        <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-900 p-3 border border-slate-200/50 dark:border-slate-850 rounded-2xl select-none">
                          <div>
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Saved Folder</span>
                            <span className="text-[10.5px] font-bold text-slate-750 dark:text-slate-350 block mt-0.5 truncate">{activeMeta.folder || 'All Saved'}</span>
                          </div>
                          <div>
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Priority</span>
                            <span className={`text-[10.5px] font-extrabold block mt-0.5 uppercase ${
                              activeMeta.priority === 'High' ? 'text-rose-500' : activeMeta.priority === 'Medium' ? 'text-amber-500' : 'text-emerald-500'
                            }`}>{activeMeta.priority}</span>
                          </div>
                        </div>

                        {/* Note textarea input */}
                        <div className="space-y-1">
                          <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest block select-none">Edit Note Contents</label>
                          <textarea
                            value={drawerNotes}
                            onChange={(e) => {
                              setDrawerNotes(e.target.value);
                              saveRevisionMeta(activeQuestion.id, { notes: e.target.value });
                            }}
                            placeholder="Type markdown shortcut equations (e.g. $CP = 100x$, ratio speed $\\propto \\frac{1}{time}$)..."
                            className="w-full h-32 p-3 font-mono border border-slate-250 bg-slate-50/50 dark:bg-slate-900 dark:border-slate-800 rounded-2xl focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100 placeholder-slate-400 resize-none"
                          />
                        </div>

                        {/* KaTeX math Preview compiled */}
                        <div className="space-y-1.5 pt-1">
                          <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest block select-none">Live LaTeX Preview</label>
                          <div className="p-3.5 bg-slate-50/50 border border-slate-200/60 dark:bg-slate-900/30 dark:border-slate-850 rounded-2xl text-[11.5px] min-h-[90px] max-h-48 overflow-y-auto">
                            {drawerNotes.trim() ? (
                              <SafeHtmlWithMath html={markdownToHtml(drawerNotes)} />
                            ) : (
                              <span className="italic text-slate-400">Notes are empty. Start typing above to see math formatting preview...</span>
                            )}
                          </div>
                        </div>

                  </div>
                )}

              </div>
            </>
          )}
        </div>
      </section>

        </div>
      </main>

      {/* Sticky Bottom Actions footer bar */}
      <footer className="fixed bottom-0 left-0 md:left-[76px] right-0 z-30 border-t border-slate-200/40 bg-white/70 backdrop-blur-xl dark:bg-slate-950/70 dark:border-slate-900/40 px-6 py-4.5 select-none">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          
          {/* Left bottom Submit CTA */}
          <div className="flex items-center gap-4 text-left">
            <button
              onClick={handleSubmitAnswer}
              disabled={!selectedOptionId || isQuestionSubmitted || isEvaluating}
              className={`px-8 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                isQuestionSubmitted
                  ? 'bg-emerald-600 text-white cursor-default shadow-none border border-emerald-500'
                  : !selectedOptionId
                    ? 'bg-slate-200 text-slate-400 opacity-60 cursor-not-allowed shadow-none'
                    : isEvaluating
                      ? 'bg-blue-600 text-white cursor-wait opacity-80'
                      : 'bg-blue-600 text-white hover:bg-blue-500 hover:scale-103'
              }`}
            >
              {isQuestionSubmitted ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Answer Submitted</span>
                </>
              ) : isEvaluating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Evaluating...</span>
                </>
              ) : (
                <span>Submit Answer</span>
              )}
            </button>
            
            {!selectedOptionId && !isQuestionSubmitted && (
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Select option to submit</span>
            )}
            {selectedOptionId && !isQuestionSubmitted && !isEvaluating && (
              <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wide flex items-center gap-1">
                <Check className="w-3 h-3" /> Option {selectedOptionId} Selected
              </span>
            )}
          </div>

          {/* Right bottom items bar */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto relative">
            
            {/* Prev question */}
            <button
              onClick={handlePrev}
              disabled={currentIndex <= 0}
              className={`p-2.5 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
                currentIndex <= 0
                  ? 'border-slate-100 text-slate-305 dark:border-slate-900 dark:text-slate-800 cursor-not-allowed'
                  : 'border-slate-200 text-slate-500 bg-slate-50 hover:bg-slate-100 hover:text-slate-700 dark:bg-slate-900 dark:border-slate-800'
              }`}
              title="Previous Question (Left Arrow)"
            >
              <ChevronLeft className="w-4.5 h-4.5 stroke-[2.5]" />
            </button>

            {/* Next question */}
            <button
              onClick={handleNext}
              disabled={currentIndex >= questions.length - 1}
              className={`p-2.5 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
                currentIndex >= questions.length - 1
                  ? 'border-slate-100 text-slate-305 dark:border-slate-900 dark:text-slate-800 cursor-not-allowed'
                  : 'border-slate-205 text-slate-505 bg-slate-50 hover:bg-slate-100 hover:text-slate-700 dark:bg-slate-900 dark:border-slate-800'
              }`}
              title="Next Question (Right Arrow)"
            >
              <ChevronRight className="w-4.5 h-4.5 stroke-[2.5]" />
            </button>

            <span className="w-px h-6 bg-slate-200 dark:bg-slate-850 mx-1.5" />

            {/* 💬 Discussion */}
            <button
              onClick={() => setIsDiscussionOpen(true)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-705 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 font-bold text-[10.5px] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <span>💬</span>
              <span>Discussion</span>
            </button>

            {/* 📝 Notes */}
            <button
              onClick={() => setIsQuickNotesOpen(!isQuickNotesOpen)}
              className={`px-3.5 py-2 rounded-xl border font-bold text-[10.5px] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors ${
                isQuickNotesOpen 
                  ? 'bg-blue-600 border-blue-500 text-white shadow-xs'
                  : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400'
              }`}
            >
              <span>📝</span>
              <span>Notes</span>
            </button>

            {/* Quick Notes popover mini-editor overlay */}
            <AnimatePresence>
              {isQuickNotesOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  className="absolute bottom-full right-16 mb-3 p-4 glassmorphism-light dark:glassmorphism rounded-2xl w-80 shadow-2xl z-40 text-left space-y-4"
                >
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-900 pb-2 select-none">
                    <span className="text-[10px] font-black uppercase text-slate-650 dark:text-slate-400 tracking-wider">Quick Note Editor</span>
                    <button onClick={() => setIsQuickNotesOpen(false)} className="hover:bg-slate-100 p-0.5 rounded cursor-pointer">
                      <X className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  </div>

                  {/* Priority selector row */}
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-450 uppercase tracking-widest block select-none">Set Priority Flag</label>
                    <div className="flex gap-2">
                      {(['High', 'Medium', 'Low'] as const).map(p => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => saveRevisionMeta(activeQuestion.id, { priority: p })}
                          className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-xl border transition-colors cursor-pointer ${
                            activeMeta.priority === p 
                              ? p === 'High' ? 'bg-rose-500/10 border-rose-500/20 text-rose-505 font-bold' :
                                p === 'Medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-505 font-bold' :
                                'bg-emerald-500/10 border-emerald-500/20 text-emerald-505 font-bold'
                              : 'border-slate-200 hover:bg-slate-50 dark:border-slate-900 dark:hover:bg-slate-900/60 text-slate-455'
                          }`}
                        >
                          {p === 'High' ? '🔴 High' : p === 'Medium' ? '🟡 Med' : '🟢 Low'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Note textarea */}
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-455 uppercase tracking-widest block select-none">Shortcut Insight</label>
                    <textarea
                      value={drawerNotes}
                      onChange={(e) => {
                        setDrawerNotes(e.target.value);
                        saveRevisionMeta(activeQuestion.id, { notes: e.target.value });
                      }}
                      placeholder="Add key insights to look back on..."
                      className="w-full h-24 p-2.5 text-xs border border-slate-250 bg-slate-50/50 dark:bg-slate-900 dark:border-slate-900 rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100 placeholder-slate-405 resize-none font-medium"
                    />
                  </div>

                  <button
                    onClick={() => {
                      setIsQuickNotesOpen(false);
                      setToastMessage({ text: 'Note Saved! 📝', isSuccess: true });
                      setTimeout(() => setToastMessage(null), 2000);
                    }}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-black text-[9.5px] uppercase tracking-wider rounded-xl cursor-pointer select-none"
                  >
                    Save & Continue
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 📚 Library */}
            <button
              onClick={() => setIsLibraryOpen(true)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 font-bold text-[10.5px] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <span>📚</span>
              <span>Library</span>
            </button>

            {/* 🔥 Mark Hard */}
            <button
              onClick={handleToggleHard}
              className={`px-3.5 py-2 rounded-xl border font-bold text-[10.5px] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all ${
                hardQuestions.includes(activeQuestion.id)
                  ? 'bg-rose-50 border-rose-300 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900'
                  : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600 dark:bg-slate-900 dark:border-slate-800'
              }`}
            >
              <span>🔥</span>
              <span>{hardQuestions.includes(activeQuestion.id) ? 'Hard' : 'Mark Hard'}</span>
            </button>

            {/* 🚩 Report Error */}
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 hover:text-slate-655 hover:bg-slate-105 dark:bg-slate-900 dark:border-slate-800 flex items-center justify-center cursor-pointer transition-colors"
              title="Report Error"
            >
              <span>🚩</span>
              <span className="ml-1 text-[10.5px] font-bold uppercase tracking-wider">Report</span>
            </button>

          </div>

        </div>
      </footer>

      {/* Slide Drawers & Bottom Sheets overlay systems */}
      <AnimatePresence>
        
        {/* 0. LaTeX Formula Sheet Drawer */}
        {isFormulaDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormulaDrawerOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-45 cursor-pointer"
            />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.22 }}
              className="fixed top-0 right-0 h-full w-full max-w-[420px] glassmorphism-light dark:glassmorphism z-50 shadow-2xl flex flex-col text-left select-text"
            >
              <div className="p-5 border-b border-slate-200/50 dark:border-slate-900/50 flex justify-between items-center bg-slate-50/30 dark:bg-slate-900/20">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-black uppercase text-slate-700 dark:text-white tracking-widest">📖 Formula Sheet</span>
                </div>
                <button onClick={() => setIsFormulaDrawerOpen(false)} className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-850 cursor-pointer">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                <p className="text-xs text-slate-400 dark:text-slate-500 select-none">
                  Review essential concepts and formulas with LaTeX math notation.
                </p>

                {/* Section: Percentages */}
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold uppercase text-blue-600 dark:text-blue-450 select-none">Percentages & Fractions</h4>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-850 rounded-2xl space-y-3">
                    <div className="text-xs leading-relaxed">
                      <strong>Base Formula:</strong>
                      <div className="my-2">
                        <SafeHtmlWithMath html={markdownToHtml('$$Percentage = \\frac{\\text{Value}}{\\text{Total}} \\times 100\\%$$')} />
                      </div>
                    </div>
                    <div className="text-xs leading-relaxed">
                      <strong>Fraction Conversions:</strong>
                      <div className="grid grid-cols-2 gap-2 mt-2 font-mono text-[11px]">
                        <div><SafeHtmlWithMath html={markdownToHtml('$\\frac{1}{2} = 50\\%$')} /></div>
                        <div><SafeHtmlWithMath html={markdownToHtml('$\\frac{1}{3} = 33.33\\%$')} /></div>
                        <div><SafeHtmlWithMath html={markdownToHtml('$\\frac{1}{4} = 25\\%$')} /></div>
                        <div><SafeHtmlWithMath html={markdownToHtml('$\\frac{1}{5} = 20\\%$')} /></div>
                        <div><SafeHtmlWithMath html={markdownToHtml('$\\frac{1}{6} = 16.67\\%$')} /></div>
                        <div><SafeHtmlWithMath html={markdownToHtml('$\\frac{1}{8} = 12.5\\%$')} /></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section: Profit & Loss */}
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold uppercase text-emerald-605 dark:text-emerald-450 select-none">Profit & Loss</h4>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-850 rounded-2xl space-y-3">
                    <div className="text-xs leading-relaxed space-y-2 font-mono text-[11px]">
                      <div><SafeHtmlWithMath html={markdownToHtml('$\\text{Profit} = SP - CP$')} /></div>
                      <div><SafeHtmlWithMath html={markdownToHtml('$\\text{Loss} = CP - SP$')} /></div>
                      <div><SafeHtmlWithMath html={markdownToHtml('$\\text{Profit}\\% = \\frac{\\text{Profit}}{CP} \\times 100$')} /></div>
                      <div><SafeHtmlWithMath html={markdownToHtml('$SP = CP \\times \\left(1 + \\frac{\\text{Profit}\\%}{100}\\right)$')} /></div>
                      <div><SafeHtmlWithMath html={markdownToHtml('$CP = \\frac{SP \\times 100}{100 + \\text{Profit}\\%}$')} /></div>
                    </div>
                  </div>
                </div>

                {/* Section: Ratios */}
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold uppercase text-amber-600 dark:text-amber-450 select-none">Ratios & Proportions</h4>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-205 dark:border-slate-850 rounded-2xl space-y-3">
                    <div className="text-xs leading-relaxed space-y-2">
                      <div><strong>Compound Ratio:</strong> of $a:b$ and $c:d$ is <SafeHtmlWithMath html={markdownToHtml('$ac:bd$')} /></div>
                      <div><strong>Duplicate Ratio:</strong> of $a:b$ is <SafeHtmlWithMath html={markdownToHtml('$a^2 : b^2$')} /></div>
                      <div><strong>Sub-duplicate Ratio:</strong> of $a:b$ is <SafeHtmlWithMath html={markdownToHtml('$\\sqrt{a} : \\sqrt{b}$')} /></div>
                      <div><strong>Inverse Ratio:</strong> of $a:b$ is <SafeHtmlWithMath html={markdownToHtml('$b:a$')} /></div>
                    </div>
                  </div>
                </div>

                {/* Section: Time & Work */}
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold uppercase text-purple-600 dark:text-purple-450 select-none">Time & Work</h4>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-850 rounded-2xl space-y-3">
                    <div className="text-xs leading-relaxed space-y-2">
                      <div><SafeHtmlWithMath html={markdownToHtml('$\\text{Work} = \\text{Rate} \\times \\text{Time}$')} /></div>
                      <div className="font-semibold text-slate-500 pt-1">Group Formula:</div>
                      <div className="my-2">
                        <SafeHtmlWithMath html={markdownToHtml('$$\\frac{M_1 D_1 H_1}{W_1} = \\frac{M_2 D_2 H_2}{W_2}$$')} />
                      </div>
                      <div>If A completes in $x$ days, A's 1-day work = <SafeHtmlWithMath html={markdownToHtml('$\\frac{1}{x}$')} /></div>
                      <div>Combined Rate of A & B = <SafeHtmlWithMath html={markdownToHtml('$\\frac{1}{x} + \\frac{1}{y}$')} /></div>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          </>
        )}

        {/* 1. Quick Save Drawer (Slide-in from right, 380px wide) */}
        {isSaveDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSaveDrawerOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-45 cursor-pointer"
            />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.22 }}
              className="fixed top-0 right-0 h-full w-full max-w-[380px] glassmorphism-light dark:glassmorphism z-50 shadow-2xl flex flex-col text-left select-none"
            >
              <div className="p-5 border-b border-slate-200/50 dark:border-slate-900/50 flex justify-between items-center bg-slate-50/30 dark:bg-slate-900/20">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-current" />
                  <span className="text-xs font-black uppercase text-slate-700 dark:text-white tracking-wider">Save to Library</span>
                </div>
                <button onClick={() => setIsSaveDrawerOpen(false)} className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-850 cursor-pointer">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                
                {/* Save status header */}
                <div className="p-3 bg-amber-500/5 border border-amber-500/15 text-amber-700 dark:text-amber-400 rounded-xl font-bold text-[10.5px] uppercase tracking-wide flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>Saved to Library</span>
                </div>

                {/* Folder dropdown select */}
                <div className="space-y-1.5">
                  <label className="text-[9.5px] font-black text-slate-450 uppercase tracking-widest block">Folder Selection</label>
                  <select
                    value={drawerFolder}
                    onChange={e => setDrawerFolder(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-xl py-2.5 px-3 text-xs text-slate-800 dark:text-white font-semibold focus:outline-none"
                  >
                    <option value="All Saved">All Saved</option>
                    {customFolders.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>

                  {/* Create inline folder field */}
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      placeholder="Or create new folder name..."
                      value={newFolderNameInput}
                      onChange={e => setNewFolderNameInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-lg placeholder-slate-400 text-slate-800 dark:text-white"
                    />
                    <button
                      onClick={() => handleAddFolder(newFolderNameInput, () => setNewFolderNameInput(''))}
                      className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 flex items-center justify-center cursor-pointer shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Priority toggle */}
                <div className="space-y-1.5">
                  <label className="text-[9.5px] font-black text-slate-450 uppercase tracking-widest block">Priority Flag</label>
                  <div className="flex gap-2.5">
                    {(['High', 'Medium', 'Low'] as const).map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setDrawerPriority(p)}
                        className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl border transition-colors cursor-pointer ${
                          drawerPriority === p
                            ? p === 'High' ? 'bg-rose-500/10 border-rose-505 text-rose-600 dark:text-rose-400 font-bold' :
                              p === 'Medium' ? 'bg-amber-500/10 border-amber-505 text-amber-600 dark:text-amber-400 font-bold' :
                              'bg-emerald-500/10 border-emerald-505 text-emerald-600 dark:text-emerald-400 font-bold'
                            : 'border-slate-200 bg-white hover:bg-slate-50 dark:bg-slate-950 dark:border-slate-900 text-slate-500'
                        }`}
                      >
                        {p === 'High' ? '🔴 High' : p === 'Medium' ? '🟡 Med' : '🟢 Low'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick note textarea */}
                <div className="space-y-1.5">
                  <label className="text-[9.5px] font-black text-slate-455 uppercase tracking-widest block">Quick Note / Shortcut Logic</label>
                  <textarea
                    value={drawerNotes}
                    onChange={e => setDrawerNotes(e.target.value)}
                    placeholder="What shortcut or insight do you want to remember?"
                    className="w-full h-32 p-3 text-xs bg-slate-50/50 dark:bg-slate-900 border border-slate-250 dark:border-slate-900 rounded-2xl focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100 placeholder-slate-400 resize-none font-medium"
                  />
                </div>

              </div>

              {/* Action Save CTA */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/40">
                <button
                  onClick={handleSaveDrawerSubmit}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-md"
                >
                  Save & Continue Solving
                </button>
              </div>

            </motion.div>
          </>
        )}

        {/* 2. Revision Library Bottom Sheet (70% Height Overlay) */}
        {isLibraryOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLibraryOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 cursor-pointer"
            />
            
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed bottom-0 left-0 md:left-[76px] right-0 h-[70vh] glassmorphism-light dark:glassmorphism z-50 shadow-2xl flex flex-col md:flex-row text-left"
            >
              
              {/* Left Sidebar Management (Filters / Folders) */}
              <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-900 p-5 flex flex-col justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/20 select-none">
                <div className="space-y-6">
                  
                  {/* System Folders list */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-2">System Filters</span>
                    
                    {[
                      { id: 'all_saved', label: '⭐ All Saved', count: totalSavedCount },
                      { id: 'last_50', label: '🕒 Last 50', count: Math.min(50, totalSavedCount) },
                      { id: 'hard', label: '🔥 Hard Questions', count: hardCount },
                      { id: 'no_notes', label: '📝 Without Notes', count: noNotesCount }
                    ].map(f => (
                      <button
                        key={f.id}
                        onClick={() => setLibraryActiveFilter(f.id)}
                        className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                          libraryActiveFilter === f.id
                            ? 'bg-blue-600 text-white font-bold'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-350'
                        }`}
                      >
                        <span>{f.label}</span>
                        <span className={`font-mono text-[9.5px] font-bold px-1.5 py-0.2 rounded ${
                          libraryActiveFilter === f.id ? 'bg-blue-500 text-white' : 'bg-slate-200/60 dark:bg-slate-900 text-slate-500'
                        }`}>{f.count}</span>
                      </button>
                    ))}
                  </div>

                  {/* Custom Folders list */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-2">Custom Folders</span>
                    
                    <div className="max-h-48 overflow-y-auto pr-1 space-y-1">
                      {customFolders.map(folder => {
                        const count = getFolderCount(folder);
                        const active = libraryActiveFilter === folder;
                        return (
                          <button
                            key={folder}
                            onClick={() => setLibraryActiveFilter(folder)}
                            className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                              active
                                ? 'bg-blue-600 text-white font-bold'
                                : 'hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-355'
                            }`}
                          >
                            <span className="truncate">📂 {folder}</span>
                            <span className={`font-mono text-[9.5px] font-bold px-1.5 py-0.2 rounded shrink-0 ml-1.5 ${
                              active ? 'bg-blue-500 text-white' : 'bg-slate-200/60 dark:bg-slate-900 text-slate-500'
                            }`}>{count}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Inline Create Folder in Sidebar */}
                    <div className="flex items-center gap-1.5 pt-2 px-1">
                      <input
                        type="text"
                        placeholder="Create folder..."
                        value={newFolderLibInput}
                        onChange={e => setNewFolderLibInput(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg placeholder-slate-400 text-slate-850 dark:text-white"
                      />
                      <button
                        onClick={() => handleAddFolder(newFolderLibInput, () => setNewFolderLibInput(''))}
                        className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 shrink-0 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>

                {/* Sidebar footer branding */}
                <div className="border-t border-slate-200 dark:border-slate-900 pt-3 text-[9px] font-bold text-slate-400 font-mono uppercase">
                  Aptitude Revision Library
                </div>
              </div>

              {/* Right Content Area (Search, Queue, Feed list) */}
              <div className="flex-1 p-6 flex flex-col min-w-0">
                
                {/* Library Header Actions */}
                <div className="flex justify-between items-center border-b border-slate-200/50 dark:border-slate-900/50 pb-4 select-none">
                  <div>
                    <h3 className="text-sm font-black uppercase text-slate-800 dark:text-white tracking-widest flex items-center gap-1.5">
                      <FolderOpen className="w-4 h-4 text-blue-500" />
                      <span>Revision Library</span>
                    </h3>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Solve, edit notes, and revisit priority items.</p>
                  </div>
                  <button onClick={() => setIsLibraryOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer">
                    <X className="w-4.5 h-4.5 text-slate-400" />
                  </button>
                </div>

                {/* Search Bar + Sorting Headers */}
                <div className="py-4 flex flex-col sm:flex-row gap-4 items-center justify-between border-b border-slate-200/40 dark:border-slate-900/40 select-none">
                  <div className="w-full sm:max-w-xs relative">
                    <input
                      type="text"
                      placeholder="Search title, stems, or notes..."
                      value={librarySearch}
                      onChange={e => setLibrarySearch(e.target.value)}
                      className="w-full pl-3 pr-8 py-2 text-xs bg-slate-50/50 border border-slate-200/50 dark:bg-slate-900/30 dark:border-slate-850/50 rounded-xl focus:outline-none focus:border-blue-500 placeholder-slate-400"
                    />
                    {librarySearch ? (
                      <button onClick={() => setLibrarySearch('')} className="absolute right-2 top-2 text-slate-400 hover:text-slate-600">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
                    )}
                  </div>

                  {/* Sorting criteria options */}
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                    <span className="uppercase">Sort By:</span>
                    {[
                      { id: 'date', label: 'Date Added' },
                      { id: 'topic', label: 'Topic' },
                      { id: 'revised', label: 'Last Revised' },
                      { id: 'priority', label: 'Priority' }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setLibrarySortBy(opt.id as any)}
                        className={`px-2 py-1.5 rounded-lg border cursor-pointer uppercase ${
                          librarySortBy === opt.id
                            ? 'bg-slate-900 border-slate-800 text-white dark:bg-slate-900'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-500'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Split layout: Pinned Queue on top, Main list below */}
                <div className="flex-1 overflow-y-auto space-y-6 pt-4 pr-1">
                  
                  {/* Today's Revision Pinned Queue Section */}
                  {highPriorityQueue.length > 0 && librarySearch === '' && (
                    <div className="space-y-3 select-none">
                      <div className="flex items-center gap-1.5 text-[9px] font-black text-rose-600 dark:text-rose-450 uppercase tracking-widest block">
                        <Flame className="w-3.5 h-3.5 fill-current" />
                        <span>Today's Revision Queue (🔴 High Priority)</span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {highPriorityQueue.map(q => (
                          <div key={q.id} className="p-4 bg-rose-500/5 border border-rose-500/10 dark:bg-rose-950/15 dark:border-rose-900/40 rounded-2xl flex justify-between items-center gap-4 text-left">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 text-[8px] font-bold text-slate-400 font-mono">
                                <span>#{q.id}</span>
                                <span>•</span>
                                <span className="uppercase text-rose-500">High Priority</span>
                              </div>
                              <h4 className="text-xs font-black text-slate-805 dark:text-white mt-1.5 truncate">
                                {q.questionStem.split('###')[0].trim()}
                              </h4>
                              <span className="text-[9px] font-bold text-slate-400 block mt-0.5">📂 {revisionDB[q.id]?.folder || 'All Saved'}</span>
                            </div>

                            <button
                              onClick={() => {
                                setActiveQuestion(q);
                                setIsLibraryOpen(false);
                              }}
                              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-[9px] uppercase tracking-wider rounded-lg shrink-0 cursor-pointer shadow-sm"
                            >
                              Open
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Main searchable Content Feed list */}
                  <div className="space-y-3.5">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block select-none">Saved Feed list</span>

                    {filteredLibraryQuestions.length === 0 ? (
                      <div className="py-12 border border-dashed border-slate-200 dark:border-slate-850 rounded-2xl text-center select-none flex flex-col items-center justify-center text-slate-400">
                        <AlertCircle className="w-8 h-8 text-slate-300 mb-1.5" />
                        <span className="text-xs font-bold uppercase">No matching questions saved</span>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredLibraryQuestions.map(q => {
                          const meta = revisionDB[q.id];
                          return (
                            <div key={q.id} className="p-4 bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-850 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-left group">
                              <div className="space-y-1.5 flex-1 min-w-0">
                                
                                {/* Top tags info */}
                                <div className="flex flex-wrap items-center gap-2 text-[8px] font-bold text-slate-400 font-mono uppercase">
                                  <span>#{q.id}</span>
                                  <span>•</span>
                                  <span>{q.domainId === 'quant' ? 'Quant' : 'Logic'}</span>
                                  <span>•</span>
                                  <span className="text-blue-500 font-black">📂 {meta?.folder || 'All Saved'}</span>
                                  
                                  {meta?.priority && (
                                    <>
                                      <span>•</span>
                                      <span className={meta.priority === 'High' ? 'text-rose-500' : meta.priority === 'Medium' ? 'text-amber-505' : 'text-emerald-500'}>
                                        {meta.priority} Priority
                                      </span>
                                    </>
                                  )}
                                </div>

                                {/* Question Title Highlight search */}
                                <h4 className="text-xs font-black text-slate-800 dark:text-white leading-normal truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                  {highlightSearchText(q.questionStem.split('###')[0].trim(), librarySearch)}
                                </h4>

                                {/* Note Snippet Highlight search */}
                                {meta?.notes && (
                                  <p className="text-[11px] font-medium text-slate-500 truncate leading-relaxed max-w-xl pl-1 border-l border-slate-200 dark:border-slate-800">
                                    <strong>Shortcut Note:</strong> {highlightSearchText(meta.notes, librarySearch)}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center gap-3 shrink-0 self-end md:self-auto select-none">
                                {meta?.lastRevised && (
                                  <span className="font-mono text-[9px] text-slate-400">Revised {meta.lastRevised}</span>
                                )}
                                
                                <button
                                  onClick={() => {
                                    setActiveQuestion(q);
                                    setIsLibraryOpen(false);
                                  }}
                                  className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-black text-[9px] uppercase tracking-wider rounded-lg cursor-pointer"
                                >
                                  Open Workspace
                                </button>
                              </div>

                            </div>
                          );
                        })}
                      </div>
                    )}

                  </div>

                </div>

              </div>

            </motion.div>
          </>
        )}

        {/* 3. Discussion Drawer layout (Slide-in from right) */}
        {isDiscussionOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDiscussionOpen(false)}
              className="fixed inset-0 bg-black z-45 cursor-pointer"
            />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.22 }}
              className="fixed top-0 right-0 h-full w-full max-w-[420px] bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-900 z-50 shadow-2xl flex flex-col text-left"
            >
              <div className="p-5 border-b border-slate-200 dark:border-slate-900 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/40 select-none">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-black uppercase text-slate-700 dark:text-white tracking-widest">Discussion ({commentsList.length})</span>
                </div>
                <button onClick={() => setIsDiscussionOpen(false)} className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-850 cursor-pointer">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* Section 10: Discussion sub-tabs */}
              <div className="flex border-b border-slate-100 dark:border-slate-900 p-2 bg-slate-50/20 text-[10px] font-black uppercase tracking-wider select-none gap-1 overflow-x-auto scrollbar-none">
                {[
                  { id: 'comments', label: 'Feed' },
                  { id: 'peer_shortcuts', label: '🏆 Community Tips' },
                  { id: 'community_notes', label: '💡 Popular Tricks' },
                  { id: 'tricks', label: 'Top Answer' }
                ].map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => setDiscussionTab(sub.id as any)}
                    className={`px-3 py-1.5 rounded-lg border shrink-0 cursor-pointer ${
                      discussionTab === sub.id
                        ? 'bg-slate-900 border-slate-850 text-white font-bold'
                        : 'border-slate-200 text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>

              {/* Discussion Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                
                {discussionTab === 'comments' && (
                  <div className="space-y-3.5">
                    <div className="p-4 bg-amber-500/5 border border-amber-500/10 dark:bg-amber-950/10 dark:border-amber-900/30 rounded-2xl text-left select-none">
                      <h5 className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest flex items-center gap-1 mb-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> Pinned Shortcut
                      </h5>
                      <p className="text-xs font-semibold text-slate-750 dark:text-slate-400 leading-relaxed">
                        "CP = 100x modeling is the fastest method. Avoids division errors and solves under 45 seconds total!"
                      </p>
                    </div>

                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block border-b border-slate-100 dark:border-slate-900/50 pb-1.5 select-none text-left">Student Feed</span>
                    
                    {commentsList.map(comment => (
                      <div key={comment.id} className="p-3.5 border border-slate-100 bg-slate-50/40 dark:border-slate-900/60 dark:bg-slate-905/25 rounded-2xl flex flex-col gap-2 relative">
                        <div className="flex justify-between items-center select-none">
                          <div className="flex items-center gap-2">
                            <img src={comment.avatar} alt={comment.user} className="w-6.5 h-6.5 rounded-full border border-slate-200 dark:border-slate-850" />
                            <div className="flex flex-col text-left leading-tight">
                              <span className="text-[11px] font-black uppercase text-slate-700 dark:text-slate-350">{comment.user}</span>
                              <span className="text-[9px] text-slate-400 font-mono">{comment.time}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleLikeComment(comment.id)}
                            className={`flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                              comment.isLiked 
                                ? 'bg-blue-50 border-blue-200 text-blue-600' 
                                : 'bg-white border-slate-200/50 text-slate-400 hover:text-slate-600'
                            }`}
                          >
                            <ThumbsUp className="w-3 h-3 stroke-[2.5]" />
                            <span>{comment.likes}</span>
                          </button>
                        </div>
                        <p className="text-[11.5px] font-semibold text-slate-600 dark:text-slate-350 leading-relaxed pl-1.5">
                          {comment.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Section 10: peer shortcuts tab content */}
                {discussionTab === 'peer_shortcuts' && (
                  <div className="space-y-4 animate-fadeIn text-left text-xs leading-relaxed">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-850 rounded-2xl space-y-2">
                      <span className="font-mono text-[9px] font-bold text-amber-500 uppercase">Shortcut By: Ananya Sharma</span>
                      <p className="font-semibold text-slate-750 dark:text-slate-350">
                        "For percentage drops, use equivalent multiplier fractions: CP * (4/5) * (5/4) = SP. Multipliers cancel out, leaving the ratio 1:1, hence CP base CP values solve instantly."
                      </p>
                    </div>
                  </div>
                )}

                {/* Section 10: community notes tab content */}
                {discussionTab === 'community_notes' && (
                  <div className="space-y-4 animate-fadeIn text-left text-xs leading-relaxed">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-850 rounded-2xl space-y-2">
                      <span className="font-mono text-[9px] font-bold text-blue-500 uppercase">Popular Trick: 100x CPM</span>
                      <p className="font-semibold text-slate-750 dark:text-slate-350">
                        "Standard formula CP = (100 * profit) / profit% is error-prone. Replace CP with 100 parts. It represents a 10x speed boost in logic rounds."
                      </p>
                    </div>
                  </div>
                )}

                {/* Section 10: tricks tab content */}
                {discussionTab === 'tricks' && (
                  <div className="space-y-4 animate-fadeIn text-left text-xs leading-relaxed">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-850 rounded-2xl space-y-2">
                      <span className="font-mono text-[9px] font-bold text-emerald-500 uppercase font-black">Top Instructor Answer: Ravi Kumar</span>
                      <p className="font-semibold text-slate-750 dark:text-slate-350">
                        "Linear equations CP adjustments can be solved by comparing the coefficients of the cost difference $20x$ with the money change $10$. It establishes the unit CP value immediately."
                      </p>
                    </div>
                  </div>
                )}

              </div>

              {/* Input section */}
              {discussionTab === 'comments' && (
                <div className="p-4 border-t border-slate-200 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/40 space-y-3 select-none">
                  <div className="flex flex-wrap items-center gap-1.5 text-[9px] font-bold text-slate-400">
                    <span>Mentions:</span>
                    <button onClick={() => setCommentInput(prev => prev + ' @RaviKumar')} className="hover:text-blue-500 uppercase">@RaviKumar</button>
                    <button onClick={() => setCommentInput(prev => prev + ' @Admin')} className="hover:text-blue-500 uppercase">@Admin</button>
                    <span className="mx-1">•</span>
                    <span>Emojis:</span>
                    {['👍', '🔥', '💡', '💯'].map(emoji => (
                      <button key={emoji} onClick={() => setCommentInput(prev => prev + emoji)} className="hover:scale-125 transition-transform text-sm">{emoji}</button>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ask a clarification or post shortcut..."
                      value={commentInput}
                      onChange={e => setCommentInput(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 text-xs font-semibold bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100 placeholder-slate-400"
                    />
                    <button
                      onClick={handleAddComment}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl flex items-center justify-center cursor-pointer shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

            </motion.div>
          </>
        )}

        {/* 4. Report Error modal */}
        {isReportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReportModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, translateY: 10 }}
              animate={{ opacity: 1, scale: 1, translateY: 0 }}
              exit={{ opacity: 0, scale: 0.95, translateY: 10 }}
              className="glassmorphism-light dark:glassmorphism rounded-3xl p-6 w-full max-w-[440px] shadow-2xl relative z-10 text-left space-y-5"
            >
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-black uppercase text-slate-800 dark:text-white tracking-widest flex items-center gap-1.5">
                  <Flag className="w-4 h-4 text-rose-500" /> Report Issue
                </h4>
                <button onClick={() => setIsReportModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850 cursor-pointer">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <div className="space-y-2.5">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Select issue Category</span>
                {['Wrong Answer', 'Incorrect Explanation', 'Typo / Math Formula Error', 'Broken Video walk-through'].map(issue => (
                  <label key={issue} className="flex items-center gap-3 p-3 border border-slate-100 bg-slate-50/50 hover:bg-slate-105 dark:border-slate-900 dark:bg-slate-900/25 rounded-xl cursor-pointer">
                    <input
                      type="radio"
                      name="reportType"
                      checked={reportType === issue}
                      onChange={() => setReportType(issue)}
                      className="accent-blue-600 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-350">{issue}</span>
                  </label>
                ))}
              </div>

              <div className="space-y-1.5">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Add details</span>
                <textarea
                  value={reportDetails}
                  onChange={e => setReportDetails(e.target.value)}
                  placeholder="Provide clarification details (optional)..."
                  className="w-full p-3 text-xs border border-slate-250 bg-slate-50/30 dark:bg-slate-900 dark:border-slate-800 rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100 placeholder-slate-400 h-20 resize-none font-medium animate-fadeIn"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setIsReportModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-250 bg-white hover:bg-slate-50 text-slate-500 font-black text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReportSubmit}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-505 text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md"
                >
                  Submit Report
                </button>
              </div>
            </motion.div>
          </div>
        )}

      </AnimatePresence>

    </div>
  );
}
