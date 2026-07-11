'use client';

import React, { useState, useEffect } from 'react';
import { Share2, Quote, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Warm, funny, encouraging, and less sarcastic placement-themed Saleem Sir Quotes
const MOTIVATION_QUOTES = [
  "Aptitude is like riding a bicycle. You might fall once or twice, but eventually, you'll reach the placement destination!",
  "Why did the computer go to Saleem Sir's lecture? To upgrade its core intelligence module!",
  "Success is 99% hard work and 1% remembering that 1/12 is exactly 8.33%. You've got this!",
  "An aptitude test is just a collection of riddles waiting for you to solve them. Go conquer them!",
  "If you ever feel stuck, remember: even the most complex coding loops start with a single, simple line.",
  "You are more prepared than you think you are. Just take a deep breath and solve one concept at a time.",
  "Why do we solve Time and Work? To prove that together, we can finish any placement target twice as fast!",
  "A solved math problem is the ultimate stress buster. Try solving a simple one now for a quick mood boost!",
  "Semicolons are small, but they hold entire programs together. Just like your daily practice builds your future.",
  "If a question seems too hard, break it down. Even the biggest mountain is climbed step by step.",
  "Keep your coding clean and your dreams big. Placements are just the beginning of your awesome journey!",
  "A positive attitude is your best shortcut in any interview. Smile and let them see your passion!",
  "Every mistake in practice is a question you will get right in the final test. Keep learning and growing!",
  "Don't count the days left; make each day of practice count towards your goals.",
  "Aptitude isn't about memorizing formulas; it's about training your brain to think logically and clearly.",
  "You don't need to know everything today. Just know a little bit more than you knew yesterday.",
  "The secret to solving Permutations is simple: keep organizing your thoughts until they click!",
  "Why did the data structure cross the road? To get to the optimized side!",
  "Remember to take breaks. A rested brain solves equations twice as fast as a tired one.",
  "If you can explain a concept to a friend, you've mastered it. Try teaching today's concept to someone!",
  "Your speed will increase with practice. For now, focus on getting the answers correct!",
  "Logical reasoning is just common sense with a fancy name. Trust your intuition!",
  "A compiler warning is just your computer's friendly way of saying, 'Hey, let's make this even better!'",
  "Believe in your preparation. The effort you put in today is building a strong foundation for tomorrow.",
  "Every correct answer in your practice session is a small victory. Celebrate them!",
  "Why did the algorithm go to the party? To show off its efficient steps!",
  "Placements can be busy, but remember to enjoy the learning process. You are growing every day.",
  "Consistency is key. 15 minutes of practice every day is better than 5 hours once a week.",
  "A challenging problem is just an opportunity to show yourself how smart you really are.",
  "Don't worry about being perfect. Just focus on being progress-driven.",
  "Aptitude questions are just logic puzzles dressed up. Uncover the logic and win the points!",
  "If you understand the basics, the advanced questions will naturally fall into place.",
  "You have the talent, the drive, and the resources. Now just add a little daily consistency!",
  "Take a minute to stretch and drink some water. Your brain cells will thank you with faster calculations!",
  "We are all in this together. Keep supporting your peers, and let's cross the placement finish line as a team!"
];

interface DailyMotivationProps {
  setToastMsg?: (msg: string | null) => void;
}

export const DailyMotivation: React.FC<DailyMotivationProps> = ({ setToastMsg }) => {
  const [quote, setQuote] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Generate an index that changes strictly every 24 hours based on local date
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    
    // Simple hashing function to map date string to an index in quotes array
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
      hash = dateStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    const quoteIndex = Math.abs(hash) % MOTIVATION_QUOTES.length;
    setQuote(MOTIVATION_QUOTES[quoteIndex]);
  }, []);

  const handleShare = async () => {
    const shareText = `Saleem Sir's Daily Motivation: "${quote}"`;
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      if (setToastMsg) {
        setToastMsg("Quote copied to clipboard!");
      }
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="w-full flex items-center justify-between gap-6 p-8 relative overflow-hidden bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/80 rounded-3xl shadow-sm select-none text-left group">
      
      {/* Quote bubble decoration & Text content */}
      <div className="flex items-center gap-5 flex-1 min-w-0 z-10">
        <div className="w-14 h-14 shrink-0 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Top Speech Bubble (Yellow) */}
            <path d="M 23 15 H 63 V 45 H 35 L 20 51 L 28 45 H 23 Z" fill="#F3B852" />
            {/* Left Quote */}
            <path d="M 31 21 H 37 V 30 L 33 37 H 29 L 31 30 H 30 Z" fill="#E05D44" />
            {/* Right Quote */}
            <path d="M 42 21 H 48 V 30 L 44 37 H 40 L 42 30 H 41 Z" fill="#E05D44" />

            {/* Bottom Speech Bubble (Cyan) */}
            <path d="M 37 45 H 77 V 75 L 83 81 L 75 75 H 37 Z" fill="#5FC8DB" />
            {/* Left Quote */}
            <path d="M 45 51 H 51 V 60 L 47 67 H 43 L 45 60 H 44 Z" fill="#E05D44" />
            {/* Right Quote */}
            <path d="M 56 51 H 62 V 60 L 58 67 H 54 L 56 60 H 55 Z" fill="#E05D44" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-slate-600 dark:text-slate-350 leading-relaxed italic pr-4 sm:pr-8">
            "{quote}"
          </p>
        </div>
      </div>

      {/* Portrait sketch & Share column */}
      <div className="flex items-center gap-6 shrink-0 relative z-10">
        {/* Saleem Sir Portrait SVG Sketch */}
        <div className="hidden md:block w-20 h-20 relative overflow-hidden rounded-full border border-amber-200/40 dark:border-amber-900/30 bg-amber-500/[0.04] p-1 shrink-0">
          <svg className="w-full h-full stroke-[#D97706] dark:stroke-amber-400 fill-none stroke-[1.2] opacity-85 hover:opacity-100 transition-opacity duration-300" viewBox="0 0 100 100">
            {/* Hair */}
            <path d="M 30,35 C 30,22 40,18 50,18 C 60,18 70,22 70,35 C 72,36 71,45 68,48" />
            {/* Face outline */}
            <path d="M 32,45 C 32,65 40,75 50,75 C 60,75 68,65 68,45" />
            {/* Eyes */}
            <path d="M 40,43 A 2,2 0 0,1 44,43" />
            <path d="M 56,43 A 2,2 0 0,1 60,43" />
            {/* Eyebrows */}
            <path d="M 38,40 C 41,39 44,40 45,41" />
            <path d="M 55,41 C 56,40 59,39 62,40" />
            {/* Nose */}
            <path d="M 50,43 L 50,53 C 50,55 48,56 47,56" />
            {/* Mustache & Beard */}
            <path d="M 43,60 C 45,58 48,58 50,58 C 52,58 55,58 57,60 C 59,62 59,64 57,64 C 55,64 50,62 43,60 Z" />
            <path d="M 32,45 C 32,55 35,68 50,75 C 65,68 68,55 68,45" />
            <path d="M 40,65 C 45,69 55,69 60,65" />
            {/* Ears */}
            <path d="M 32,44 C 30,44 29,48 32,50" />
            <path d="M 68,44 C 70,44 71,48 68,50" />
            {/* Collar & Shirt */}
            <path d="M 38,73 L 32,85 L 68,85 L 62,73" />
            <path d="M 45,74 L 50,81 L 55,74" />
            <path d="M 50,81 L 50,85" />
          </svg>
        </div>

        {/* Share Button with copy feedback */}
        <button
          onClick={handleShare}
          className="relative px-4 py-2 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share</span>

          <AnimatePresence>
            {copied && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.9 }}
                className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-950 text-white border border-slate-800 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider whitespace-nowrap shadow-xl z-50 flex items-center gap-1"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-400 stroke-[3]" />
                Copied!
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

    </div>
  );
};
