'use client';

import React, { useState, useEffect } from 'react';
import { Eye, Monitor, Tablet, Smartphone, HelpCircle, Play, Video, ExternalLink, Sparkles, XCircle } from 'lucide-react';
import { ResponseOption, Difficulty } from '@/lib/admin/types';
import { generate16BitQuestionId } from '@/lib/admin/idGenerator';
import 'katex/dist/katex.min.css'; // Standard katex css for rendering formulas
import katex from 'katex';

const getYouTubeId = (url: string): string | null => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const markdownToHtml = (md: string): string => {
  if (!md) return '';
  let html = md;
  
  // Escape HTML tags to prevent execution issues
  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  
  // Convert headings
  html = html.replace(/^### ([\s\S]*?)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## ([\s\S]*?)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# ([\s\S]*?)$/gm, '<h1>$1</h1>');

  // Convert Bold, Italic, Inline Code
  html = html.replace(/\*\*([\s\S]*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([\s\S]*?)\*/g, '<em>$1</em>');
  html = html.replace(/`([\s\S]*?)`/g, '<code>$1</code>');
  
  // Convert LaTeX block math ($$...$$)
  html = html.replace(/\$\$([\s\S]*?)\$\$/g, '<div class="math-block" style="text-align: center; margin: 12px 0; padding: 8px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-family: \'Times New Roman\', Times, serif; font-style: italic; color: #2563eb;">$1</div>');

  // Convert LaTeX inline math ($...$)
  html = html.replace(/\$([^\$]+)\$/g, '<span class="math-tex" style="font-family: \'Times New Roman\', Times, serif; font-style: italic; color: #2563eb; background-color: #f8fafc; padding: 1px 4px; border: 1px solid #e2e8f0; border-radius: 4px; font-weight: 500;">$1</span>');
  
  // Convert newlines to breaks
  html = html.replace(/\n/g, '<br/>');
  
  return html;
};

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

interface LivePreviewProps {
  questionStem: string;
  hintText: string;
  options: ResponseOption[];
  difficulty: Difficulty;
  domainName: string;
  questionId: string;
  videoUrl: string;
  videoTitle?: string;
  videoDuration?: string;
  videoThumbnail?: string;
  shuffleOptions?: boolean;
  companyTags?: string[];
  domainId?: string;
  subTopicId?: string;
  conceptId?: string;
  trackingId?: string;
  domainsList?: any[];
  allQuestions?: any[];
}

export default function LivePreview({
  questionStem,
  hintText,
  options,
  difficulty,
  domainName,
  questionId,
  videoUrl,
  videoTitle = 'MASTERING APTITUDE TUTORIAL',
  videoDuration = '10:00',
  videoThumbnail = 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600',
  shuffleOptions = false,
  companyTags = [],
  domainId,
  subTopicId,
  conceptId,
  trackingId,
  domainsList,
  allQuestions
}: LivePreviewProps) {
  const [deviceLayout, setDeviceLayout] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [selectedStudentChoice, setSelectedStudentChoice] = useState<string | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [shuffleOrder, setShuffleOrder] = useState<string[]>([]);

  const videoId = getYouTubeId(videoUrl);
  const resolvedThumbnail = videoId
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : (videoThumbnail || null);

  // Stable Fisher-Yates Shuffling to prevent jumping while typing
  useEffect(() => {
    const ids = options.map((o) => o.id);
    if (shuffleOptions) {
      const isDefaultOrder = shuffleOrder.length === ids.length && shuffleOrder.every((val, index) => val === ids[index]);
      const hasLengthMismatch = shuffleOrder.length !== options.length;
      const hasMissingIds = !options.every((o) => shuffleOrder.includes(o.id));
      
      if (isDefaultOrder || hasLengthMismatch || hasMissingIds) {
        const shuffledIds = [...ids];
        for (let i = shuffledIds.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledIds[i], shuffledIds[j]] = [shuffledIds[j], shuffledIds[i]];
        }
        setShuffleOrder(shuffledIds);
      }
    } else {
      setShuffleOrder(ids);
    }
  }, [options, shuffleOptions]);

  // Resolve display options (shuffles the values, keeping Option ID names in strict alphabetical order)
  const displayOptions = options.map((option, index) => {
    if (!shuffleOptions || shuffleOrder.length !== options.length) {
      return option;
    }
    const targetId = shuffleOrder[index];
    const sourceOption = options.find((o) => o.id === targetId);
    if (!sourceOption) return option;
    return {
      ...option, // Keep original ID (A, B, C, D...)
      text: sourceOption.text,
      isCorrect: sourceOption.isCorrect,
      metadata: sourceOption.metadata
    };
  });

  // Helper to resolve device styling classes
  const getDeviceWidthClass = () => {
    switch (deviceLayout) {
      case 'mobile':
        return 'w-[340px] max-w-full';
      case 'tablet':
        return 'w-[520px] max-w-full';
      case 'desktop':
      default:
        return 'w-full';
    }
  };

  // Get difficulty color tags
  const getDifficultyBadge = () => {
    switch (difficulty) {
      case 'EASY':
        return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/30';
      case 'HARD':
        return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200/50 dark:border-rose-900/30';
      case 'MEDIUM':
      default:
        return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/30';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm flex flex-col h-full overflow-hidden">
      {/* Header with Device Toggles */}
      <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-slate-500 dark:text-slate-400 animate-pulse" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Live Student Preview</span>
        </div>

        {/* Device toggles */}
        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-0.5 rounded-lg">
          <button
            type="button"
            onClick={() => setDeviceLayout('desktop')}
            className={`p-1.5 rounded transition-all cursor-pointer ${
              deviceLayout === 'desktop' ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
            title="Desktop Mode"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setDeviceLayout('tablet')}
            className={`p-1.5 rounded transition-all cursor-pointer ${
              deviceLayout === 'tablet' ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
            title="Tablet Mode"
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setDeviceLayout('mobile')}
            className={`p-1.5 rounded transition-all cursor-pointer ${
              deviceLayout === 'mobile' ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
            title="Mobile Mode"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Interactive Sandbox body */}
      <div className="flex-1 bg-slate-50/60 dark:bg-slate-950/40 p-6 overflow-y-auto flex flex-col items-center justify-start gap-6">
        
        {/* Device Wrapper */}
        <div className={`${getDeviceWidthClass()} transition-all duration-300 ease-in-out flex flex-col gap-5`}>
          
          {/* Main Question Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm p-6 flex flex-col gap-4">
            
            {/* Metadata Tags Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40 px-2 py-0.5 rounded tracking-wide uppercase">
                    {domainName}
                  </span>
                  <span className={`text-[10px] font-extrabold border px-2 py-0.5 rounded tracking-wide uppercase ${getDifficultyBadge()}`}>
                    {difficulty}
                  </span>
                </div>
                {companyTags && companyTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 items-center border-l border-slate-200 dark:border-slate-800 pl-3 ml-1">
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Asked by:</span>
                    {companyTags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] font-black bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 px-1.5 py-0.5 rounded tracking-wide font-sans transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase font-mono" title={`Original ID: ${questionId}`}>
                {(() => {
                  if (trackingId) return trackingId;
                  if (domainId && subTopicId && conceptId && questionId) {
                    // Check if it's a UUID (length 36 with hyphens) or standard mock ID
                    return questionId.length > 8
                      ? generate16BitQuestionId(domainId, subTopicId, conceptId, questionId, allQuestions)
                      : questionId;
                  }
                  return questionId || 'Q. ID: PENDING';
                })()}
              </span>
            </div>

            {/* Question Stem Prompt (Rendered beautifully with ReactMarkdown + Katex support) */}
            <div className="text-slate-800 dark:text-slate-200 text-[15px] leading-relaxed font-normal antialiased prose max-w-none prose-slate dark:prose-invert prose-headings:text-slate-900 dark:prose-headings:text-slate-100 prose-code:text-slate-700 dark:prose-code:text-slate-300 prose-code:bg-slate-100 dark:prose-code:bg-slate-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-slate-50 dark:prose-pre:bg-slate-950 prose-pre:border prose-pre:border-slate-100 dark:prose-pre:border-slate-800 break-all">
              {questionStem ? (
                <div className="prose max-w-none prose-slate dark:prose-invert break-all">
                  <SafeHtmlWithMath html={markdownToHtml(questionStem)} />
                </div>
              ) : (
                <p className="text-slate-400 dark:text-slate-500 italic font-sans">
                  The formatted question text will render here as you type in the editor...
                </p>
              )}
            </div>

            {/* Hint Box (Conditional) */}
            {hintText && (
              <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/60 dark:border-blue-900/30 rounded-xl p-4 flex items-start gap-3 flex-1 min-w-0">
                <span className="text-base shrink-0 leading-none">💡</span>
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Hint</span>
                  <div className="text-xs text-blue-800 dark:text-blue-300 font-medium leading-relaxed prose prose-blue dark:prose-invert max-w-none break-all">
                    <SafeHtmlWithMath html={markdownToHtml(hintText)} />
                  </div>
                </div>
              </div>
            )}

            {/* Options Interactive Selection list */}
            <div className="flex flex-col gap-2.5 mt-2">
              {displayOptions.map((option) => {
                const isSelected = selectedStudentChoice === option.id;
                const isOptionFilled = option.text.trim().length > 0;
                
                return (
                  <button
                    key={option.id}
                    type="button"
                    disabled={!isOptionFilled}
                    onClick={() => setSelectedStudentChoice(option.id)}
                    className={`w-full flex items-start justify-between p-3.5 border rounded-xl text-left transition-all ${
                      !isOptionFilled
                        ? 'opacity-40 cursor-not-allowed bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800'
                        : isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-500 dark:border-blue-600 text-blue-900 dark:text-blue-100 shadow-sm shadow-blue-50 dark:shadow-none'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50/30 dark:hover:bg-slate-800/30'
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {/* Circle Letter label */}
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold transition-all shrink-0 ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/10'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
                        }`}
                      >
                        {option.id}
                      </div>
                      <span className="text-[13px] font-medium leading-tight break-all block flex-1 pr-2">
                        {isOptionFilled ? option.text : `Empty Option ${option.id}`}
                      </span>
                    </div>

                    {/* Verification checkmark if option is correct & verified */}
                    {isSelected && (
                      <span className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-white text-[9px] font-bold shadow-sm shrink-0 mt-1">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Video Walkthrough Embed Box */}
          {videoUrl && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm p-5 flex flex-col gap-3">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" /> Video Walkthrough
              </span>

              {/* Mock Video Container */}
              <div
                onClick={!isVideoPlaying ? () => setIsVideoPlaying(true) : undefined}
                className={`relative aspect-video rounded-xl bg-slate-900 border border-slate-950 overflow-hidden shadow-inner ${
                  !isVideoPlaying ? 'cursor-pointer group' : ''
                }`}
              >
                {isVideoPlaying && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsVideoPlaying(false);
                    }}
                    className="absolute top-3 right-3 z-10 p-1.5 rounded-lg bg-black/60 hover:bg-black/85 text-white hover:text-rose-400 transition-colors shadow-md flex items-center justify-center cursor-pointer"
                    title="Close Player"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                )}

                {isVideoPlaying && videoId ? (
                  // Real Embedded YouTube Player
                  <div className="w-full h-full relative bg-black">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                      title={videoTitle || "Video solution"}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="w-full h-full absolute inset-0 border-0"
                    ></iframe>
                  </div>
                ) : isVideoPlaying ? (
                  // Fallback Mock Video Playing State
                  <div 
                    onClick={() => setIsVideoPlaying(false)}
                    className="w-full h-full flex flex-col items-center justify-center bg-black/95 text-center px-4 relative cursor-pointer"
                  >
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-red-600 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded tracking-wide animate-pulse">
                      LIVE STREAM
                    </div>
                    
                    {/* YouTube mock iframe or animation */}
                    <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center mb-3">
                      <Play className="w-6 h-6 text-blue-500 animate-spin" />
                    </div>
                    <span className="text-xs font-bold text-slate-200 tracking-tight leading-normal">
                      Loading Sandbox Video Player...
                    </span>
                    <a
                      href={videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold text-slate-400 mt-2 hover:text-white flex items-center gap-1 underline transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Open in YouTube <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                ) : (
                  // Video Thumbnail State
                  <>
                    {resolvedThumbnail && (
                      <img
                        src={resolvedThumbnail}
                        alt="walkthrough thumbnail"
                        className="w-full h-full object-cover opacity-80 group-hover:scale-102 transition-transform duration-300"
                      />
                    )}
                    <div className="absolute inset-0 bg-slate-900/40 group-hover:bg-slate-900/30 transition-colors" />

                    {/* Central Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/95 group-hover:bg-blue-600 shadow-md group-hover:shadow-blue-500/20 text-slate-900 group-hover:text-white flex items-center justify-center transform group-hover:scale-110 transition-all duration-200">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>

                    {/* Thumbnail Footer info */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white drop-shadow-md">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold tracking-wider uppercase opacity-80">
                          Mastery Course
                        </span>
                        <span className="text-xs font-extrabold tracking-tight truncate max-w-[200px]">
                          {videoTitle}
                        </span>
                      </div>
                      <span className="text-[9px] font-bold bg-black/60 px-1.5 py-0.5 rounded tracking-wide font-mono">
                        {videoDuration}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
