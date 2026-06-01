'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  floating?: boolean;
}

export default function ThemeToggle({ floating = false }: ThemeToggleProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Sync current active theme state based on the presence of .dark class
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  if (!mounted) {
    // Return empty placeholder layout with matching size to completely prevent hydration layout shifts
    return floating ? (
      <div className="w-11 h-11 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0" />
    ) : (
      <div className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={
        floating
          ? "w-11 h-11 rounded-full border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-300 flex items-center justify-center transition-all cursor-pointer shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 select-none shrink-0"
          : "w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-all cursor-pointer shadow-2xs hover:scale-105 select-none shrink-0"
      }
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Sun className={floating ? "w-5 h-5 text-amber-500 animate-fadeIn" : "w-4 h-4 text-amber-500 animate-fadeIn"} />
      ) : (
        <Moon className={floating ? "w-5 h-5 text-indigo-400 animate-fadeIn" : "w-4 h-4 text-indigo-400 animate-fadeIn"} />
      )}
    </button>
  );
}
