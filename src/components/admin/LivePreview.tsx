'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import { Eye, Monitor, Tablet, Smartphone, HelpCircle, Play, Video, ExternalLink, Sparkles } from 'lucide-react';
import { ResponseOption, Difficulty } from '@/lib/admin/types';
import 'katex/dist/katex.min.css'; // Standard katex css for rendering formulas

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
  videoThumbnail = 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600'
}: LivePreviewProps) {
  const [deviceLayout, setDeviceLayout] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [selectedStudentChoice, setSelectedStudentChoice] = useState<string | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

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
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/50';
      case 'HARD':
        return 'bg-rose-50 text-rose-700 border-rose-200/50';
      case 'MEDIUM':
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200/50';
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm flex flex-col h-full overflow-hidden">
      {/* Header with Device Toggles */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-slate-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Live Student Preview</span>
        </div>

        {/* Device toggles */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 p-0.5 rounded-lg">
          <button
            type="button"
            onClick={() => setDeviceLayout('desktop')}
            className={`p-1.5 rounded transition-all ${
              deviceLayout === 'desktop' ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600'
            }`}
            title="Desktop Mode"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setDeviceLayout('tablet')}
            className={`p-1.5 rounded transition-all ${
              deviceLayout === 'tablet' ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600'
            }`}
            title="Tablet Mode"
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setDeviceLayout('mobile')}
            className={`p-1.5 rounded transition-all ${
              deviceLayout === 'mobile' ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600'
            }`}
            title="Mobile Mode"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Interactive Sandbox body */}
      <div className="flex-1 bg-slate-50/60 p-6 overflow-y-auto flex flex-col items-center justify-start gap-6">
        
        {/* Device Wrapper */}
        <div className={`${getDeviceWidthClass()} transition-all duration-300 ease-in-out flex flex-col gap-5`}>
          
          {/* Main Question Card */}
          <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm p-6 flex flex-col gap-4">
            
            {/* Metadata Tags Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded tracking-wide uppercase">
                  {domainName}
                </span>
                <span className={`text-[10px] font-extrabold border px-2 py-0.5 rounded tracking-wide uppercase ${getDifficultyBadge()}`}>
                  {difficulty}
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase font-mono">
                {questionId || 'Q. ID: PENDING'}
              </span>
            </div>

            {/* Question Stem Prompt (Rendered beautifully with ReactMarkdown + Katex support) */}
            <div className="text-slate-800 text-[15px] leading-relaxed font-normal antialiased prose max-w-none prose-slate prose-headings:text-slate-900 prose-code:text-slate-700 prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-slate-50 prose-pre:border prose-pre:border-slate-100">
              {questionStem ? (
                <ReactMarkdown rehypePlugins={[rehypeKatex]}>{questionStem}</ReactMarkdown>
              ) : (
                <p className="text-slate-400 italic font-sans">
                  The formatted question text will render here as you type in the editor...
                </p>
              )}
            </div>

            {/* Hint Box (Conditional) */}
            {hintText && (
              <div className="bg-blue-50/50 border border-blue-100/60 rounded-xl p-4 flex items-start gap-3">
                <span className="text-base shrink-0 leading-none">💡</span>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Hint</span>
                  <div className="text-xs text-blue-800 font-medium leading-relaxed prose prose-blue max-w-none">
                    <ReactMarkdown rehypePlugins={[rehypeKatex]}>{hintText}</ReactMarkdown>
                  </div>
                </div>
              </div>
            )}

            {/* Options Interactive Selection list */}
            <div className="flex flex-col gap-2.5 mt-2">
              {options.map((option) => {
                const isSelected = selectedStudentChoice === option.id;
                const isOptionFilled = option.text.trim().length > 0;
                
                return (
                  <button
                    key={option.id}
                    type="button"
                    disabled={!isOptionFilled}
                    onClick={() => setSelectedStudentChoice(option.id)}
                    className={`w-full flex items-center justify-between p-3.5 border rounded-xl text-left transition-all ${
                      !isOptionFilled
                        ? 'opacity-40 cursor-not-allowed bg-slate-50 border-slate-200'
                        : isSelected
                        ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-sm shadow-blue-50'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Circle Letter label */}
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/10'
                            : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                        }`}
                      >
                        {option.id}
                      </div>
                      <span className="text-[13px] font-medium leading-tight">
                        {isOptionFilled ? option.text : `Empty Option ${option.id}`}
                      </span>
                    </div>

                    {/* Verification checkmark if option is correct & verified */}
                    {isSelected && (
                      <span className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-white text-[9px] font-bold shadow-sm">
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
            <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm p-5 flex flex-col gap-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-slate-400" /> Video Walkthrough
              </span>

              {/* Mock Video Container */}
              <div
                onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                className="relative aspect-video rounded-xl bg-slate-900 border border-slate-950 overflow-hidden cursor-pointer group shadow-inner"
              >
                {isVideoPlaying ? (
                  // Video Playing State
                  <div className="w-full h-full flex flex-col items-center justify-center bg-black/95 text-center px-4 relative">
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
                    <img
                      src={videoThumbnail}
                      alt="walkthrough thumbnail"
                      className="w-full h-full object-cover opacity-80 group-hover:scale-102 transition-transform duration-300"
                    />
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
