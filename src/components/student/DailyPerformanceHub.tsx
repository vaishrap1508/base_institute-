'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar } from 'lucide-react';

interface DailyPerformanceHubProps {
  isCustomActive?: boolean;
}

export const DailyPerformanceHub = ({ isCustomActive = false }: DailyPerformanceHubProps) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Mock Dynamic Backend Data
  const dailyGoalData = {
    questions_completed: 3,
    daily_target: 5,
    goal_percentage: 60,
    reset_time: "10:45:32"
  };

  const xpData = {
    xp_today: 120,
    xp_growth: 15,
    performance_status: "🚀 Fast Learner Today"
  };

  // SVG Progress Ring calculations
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (dailyGoalData.goal_percentage / 100) * circumference;

  if (!mounted) return null;

  return (
    <div className="flex flex-col space-y-4 w-full mt-6">
      
      {/* Top Row: Side-by-side Daily Goal and Today's XP */}
      <div className="grid grid-cols-2 gap-4">
        
        {/* Daily Goal Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          whileHover={{ y: -4, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
          className={`bg-white border border-slate-200 dark:bg-[#0A0F1C] dark:border-slate-800 rounded-[20px] p-4 shadow-sm transition-all duration-300 group flex flex-col relative overflow-hidden ${
            isCustomActive 
              ? "hover:border-[rgba(var(--clr-primary-rgb,59,130,246),0.4)]" 
              : "hover:border-blue-500/30 dark:hover:border-blue-500/40"
          }`}
        >
          <h3 className="text-[10px] font-black tracking-widest text-slate-700 dark:text-slate-300 mb-4 uppercase">Daily Goal</h3>
          
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="relative flex items-center justify-center w-20 h-20 group-hover:rotate-[3deg] transition-transform duration-500">
              {/* Background ring */}
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="stroke-slate-100 dark:stroke-slate-800/50"
                  strokeWidth="8"
                  fill="none"
                />
                
                {/* Gradient definition */}
                <defs>
                  <linearGradient id="goalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    {isCustomActive ? (
                      <>
                        <stop offset="0%" stopColor="var(--clr-primary, #3B82F6)" />   
                        <stop offset="100%" stopColor="var(--clr-primary-dark, #06B6D4)" /> 
                      </>
                    ) : (
                      <>
                        <stop offset="0%" stopColor="#3B82F6" />   {/* Blue-500 */}
                        <stop offset="50%" stopColor="#8B5CF6" />  {/* Purple-500 */}
                        <stop offset="100%" stopColor="#06B6D4" /> {/* Cyan-500 */}
                      </>
                    )}
                  </linearGradient>
                  <filter id="glowRing" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>

                {/* Progress ring */}
                <motion.circle
                  cx="50"
                  cy="50"
                  r={radius}
                  stroke="url(#goalGradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  filter="url(#glowRing)"
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
                  style={{ strokeDasharray: circumference }}
                />
              </svg>
              
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-[17px] font-black text-slate-800 dark:text-white leading-none">
                  {dailyGoalData.questions_completed}<span className="text-xs text-slate-400">/{dailyGoalData.daily_target}</span>
                </span>
                <span className="text-[8px] font-bold text-slate-500 mt-0.5 uppercase tracking-wider leading-tight">Solved</span>
              </div>
            </div>

            <div className="flex flex-col items-center text-center space-y-0.5 pt-1">
              <div className="text-xl font-black text-slate-800 dark:text-white tracking-tight">{dailyGoalData.goal_percentage}%</div>
              <div className="text-[10px] font-bold text-slate-500">Goal Completed</div>
            </div>
          </div>
        </motion.div>

        {/* Today's XP Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
          whileHover={{ y: -4, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
          className={`bg-white border border-slate-200 dark:bg-[#0A0F1C] dark:border-slate-800 rounded-[20px] p-4 shadow-sm transition-all duration-300 group flex flex-col relative overflow-hidden ${
            isCustomActive 
              ? "hover:border-[rgba(var(--clr-primary-rgb,139,92,246),0.4)]" 
              : "hover:border-purple-500/30 dark:hover:border-purple-500/40"
          }`}
        >
          <h3 className="text-[10px] font-black tracking-widest text-slate-700 dark:text-slate-300 mb-4 uppercase">Today's XP</h3>
          
          <div className="flex flex-col relative h-full">
            <div className="flex flex-col z-10 pt-2">
              <div className="flex items-baseline space-x-1.5">
                <span className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{xpData.xp_today}</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">XP</span>
              </div>
              <div className="flex items-center mt-1 text-emerald-500 text-[10px] font-bold">
                <TrendingUp className="w-3 h-3 mr-1" />
                +{xpData.xp_growth}%
              </div>
            </div>

            <div className="w-28 h-16 absolute -right-2 -bottom-2 opacity-80">
              <svg className={`w-full h-full overflow-visible transition-all duration-500 ${isCustomActive ? "group-hover:drop-shadow-[0_0_10px_rgba(var(--clr-primary-rgb,139,92,246),0.4)]" : "group-hover:drop-shadow-[0_0_10px_rgba(139,92,246,0.4)]"}`} viewBox="0 0 100 40" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="lineGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                    {isCustomActive ? (
                      <>
                        <stop offset="0%" stopColor="var(--clr-primary, #8B5CF6)" stopOpacity="0.4"/>
                        <stop offset="100%" stopColor="var(--clr-primary-dark, #06B6D4)" stopOpacity="1"/>
                      </>
                    ) : (
                      <>
                        <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.4"/>
                        <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.8"/>
                        <stop offset="100%" stopColor="#06B6D4" stopOpacity="1"/>
                      </>
                    )}
                  </linearGradient>
                  <linearGradient id="fillGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
                    {isCustomActive ? (
                      <>
                        <stop offset="0%" stopColor="var(--clr-primary, #8B5CF6)" stopOpacity="0.2"/>
                        <stop offset="100%" stopColor="var(--clr-primary, #8B5CF6)" stopOpacity="0"/>
                      </>
                    ) : (
                      <>
                        <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.2"/>
                        <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0"/>
                      </>
                    )}
                  </linearGradient>
                </defs>
                <path
                  d="M 0 35 C 10 25, 25 35, 40 25 C 55 15, 75 30, 85 15 C 92 5, 100 5, 100 5 L 100 40 L 0 40 Z"
                  fill="url(#fillGrad2)"
                />
                <motion.path
                  d="M 0 35 C 10 25, 25 35, 40 25 C 55 15, 75 30, 85 15 C 92 5, 100 5, 100 5"
                  fill="none"
                  stroke="url(#lineGrad2)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                />
              </svg>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Row: Upcoming Mock Test */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
        whileHover={{ y: -4, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
        className={`bg-white border border-slate-200 dark:bg-[#0A0F1C] dark:border-slate-800 rounded-[20px] p-5 shadow-sm transition-all duration-300 flex flex-col ${
          isCustomActive 
            ? "hover:border-[rgba(var(--clr-primary-rgb,99,102,241),0.4)]" 
            : "hover:border-indigo-500/30 dark:hover:border-indigo-500/40"
        }`}
      >
        <h3 className="text-[10px] font-black tracking-widest text-slate-700 dark:text-slate-300 mb-4 uppercase">Upcoming Mock Test</h3>
        
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border ${
            isCustomActive 
              ? "bg-[rgba(var(--clr-primary-rgb,99,102,241),0.1)] dark:bg-[rgba(var(--clr-primary-rgb,99,102,241),0.15)] border-[rgba(var(--clr-primary-rgb,99,102,241),0.2)]" 
              : "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-100 dark:border-indigo-800/30"
          }`}>
            <Calendar className={`w-6 h-6 ${isCustomActive ? "text-[var(--clr-primary,#4F46E5)]" : "text-indigo-600 dark:text-indigo-400"}`} />
          </div>
          
          <div className="flex flex-col">
            <h4 className="text-[13px] font-bold text-slate-800 dark:text-white leading-tight">Aptitude Grand Test #13</h4>
            <span className="text-[11px] font-semibold text-slate-500 mt-1">15 June 2026 • 10:00 AM</span>
          </div>
        </div>
        
        <button className={`mt-5 w-max px-5 py-2 text-[11px] font-bold rounded-xl transition-colors border ${
          isCustomActive
            ? "text-[var(--clr-primary,#4F46E5)] border-[rgba(var(--clr-primary-rgb,99,102,241),0.3)] hover:bg-[rgba(var(--clr-primary-rgb,99,102,241),0.1)] dark:hover:bg-[rgba(var(--clr-primary-rgb,99,102,241),0.15)]"
            : "text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
        }`}>
          Register Now
        </button>
      </motion.div>

    </div>
  );
};
