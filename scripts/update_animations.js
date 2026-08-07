const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '..', 'src', 'app', 'globals.css');
const pagePath = path.join(__dirname, '..', 'src', 'app', 'student', 'dashboard', 'page.tsx');

let css = fs.readFileSync(cssPath, 'utf8');

const premiumCss = `
/* ==========================================
   PREMIUM MICRO-ANIMATIONS
   ========================================== */
@keyframes pageLoadAnim {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-page-load {
  animation: pageLoadAnim 400ms ease-out forwards;
}

@keyframes cardReveal {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
.stagger-card {
  opacity: 0;
  animation: cardReveal 350ms ease-out forwards;
}

.premium-hover-card {
  transition: transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease !important;
}
.premium-hover-card:hover {
  transform: translateY(-5px) !important;
  box-shadow: 0 15px 30px -5px rgba(0, 0, 0, 0.1), 0 0 15px rgba(255, 255, 255, 0.05) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
}
.dark .premium-hover-card:hover {
  box-shadow: 0 15px 30px -5px rgba(0, 0, 0, 0.3), 0 0 15px rgba(255, 255, 255, 0.03) !important;
}

.premium-btn {
  transition: all 180ms ease !important;
}
.premium-btn:hover {
  transform: scale(1.03) !important;
}
.premium-btn:active {
  transform: scale(0.98) !important;
}
.premium-btn:hover svg.lucide-chevron-right {
  transform: translateX(4px) !important;
  transition: transform 180ms ease !important;
}

@keyframes progressFill {
  from { width: 0%; }
}
.animate-progress-fill {
  animation: progressFill 900ms ease-out forwards;
}

@keyframes ringFill {
  from { stroke-dasharray: 0, 1000; }
}
.animate-ring-fill {
  animation: ringFill 900ms ease-out forwards;
}
.premium-ring-hover {
  transition: all 250ms ease !important;
  transform-origin: center;
}
.premium-ring-hover:hover {
  transform: rotate(3deg) !important;
  filter: drop-shadow(0 0 8px currentColor) !important;
}

@keyframes drawGraph {
  from { stroke-dasharray: 0, 1000; }
  to { stroke-dasharray: 1000, 0; }
}
.animate-graph-draw {
  stroke-dasharray: 1000;
  stroke-dashoffset: 0;
  animation: drawGraph 800ms ease-out forwards;
}
.premium-graph-hover {
  transition: filter 250ms ease !important;
}
.premium-graph-hover:hover {
  filter: drop-shadow(0 0 6px currentColor) !important;
}

@keyframes todayDateAnim {
  0% { opacity: 0; transform: scale(0.95); }
  10% { opacity: 1; transform: scale(1); }
  100% { opacity: 1; transform: scale(1); }
}
@keyframes glowPulse6s {
  0%, 100% { box-shadow: 0 0 0px transparent; }
  50% { box-shadow: 0 0 8px currentColor; }
}
.animate-today-date {
  animation: todayDateAnim 400ms ease-out forwards, glowPulse6s 6s ease-in-out infinite 400ms !important;
}

.sidebar-icon-hover {
  transition: all 180ms ease !important;
}
.sidebar-icon-hover:hover {
  transform: scale(1.08) !important;
  filter: brightness(1.2) !important;
}

.search-bar-premium {
  transition: all 250ms ease !important;
}
.search-bar-premium:hover {
  box-shadow: 0 0 8px rgba(100, 100, 100, 0.1) !important;
}
.search-bar-premium:focus-within {
  box-shadow: 0 0 12px rgba(var(--clr-primary-rgb), 0.3) !important;
}

.animate-motivation-quote {
  opacity: 0;
  animation: fadeIn 500ms ease-out forwards 300ms;
}

.premium-hover-card:hover .mock-register-btn {
  box-shadow: 0 0 12px rgba(var(--clr-primary-rgb), 0.4) !important;
}
`;

if (!css.includes('PREMIUM MICRO-ANIMATIONS')) {
  fs.writeFileSync(cssPath, css + '\n' + premiumCss);
  console.log('globals.css updated');
} else {
  console.log('globals.css already updated');
}

let page = fs.readFileSync(pagePath, 'utf8');

// 1. Add CountUp helper at the top (after imports)
const countUpCode = `
const CountUp = ({ end, duration = 800, prefix = '', suffix = '' }: any) => {
  const [count, setCount] = React.useState(0);
  React.useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);
  return <>{prefix}{count}{suffix}</>;
};
`;
if (!page.includes('const CountUp =')) {
  page = page.replace(/(import .*;\n)+/, (match) => match + '\n' + countUpCode + '\n');
}

// 2. Page load animation
page = page.replace(
  /className="w-full max-w-7xl mx-auto space-y-6 text-slate-800 dark:text-slate-200"/g,
  'className="w-full max-w-7xl mx-auto space-y-6 text-slate-800 dark:text-slate-200 animate-page-load"'
);

// 3. Number Replacements
page = page.replace(
  />{solvedCount} Modules<\/span>/g,
  '><CountUp end={solvedCount} suffix=" Modules" /></span>'
);
page = page.replace(
  />{streak} Days<\/span>/g,
  '><CountUp end={streak} suffix=" Days" /></span>'
);
page = page.replace(
  />Lvl 12 \(#14\)<\/span>/g,
  '><CountUp end={12} prefix="Lvl " /> (#<CountUp end={14} />)</span>'
);
page = page.replace(
  />{goalPercentage}%<\/span>/g,
  '><CountUp end={goalPercentage} suffix="%" /></span>'
);
page = page.replace(
  />120 <span/g,
  '><CountUp end={120} /> <span'
);

// 4. Progress bar animation class
page = page.replace(
  /className={isCustomActive \? "bg-\[var\(--clr-primary\)\] h-full rounded-full transition-all duration-500"/g,
  'className={isCustomActive ? "bg-[var(--clr-primary)] h-full rounded-full animate-progress-fill transition-all"'
);
page = page.replace(
  /className="bg-amber-500 h-full rounded-full transition-all duration-500"/g,
  'className="bg-amber-500 h-full rounded-full animate-progress-fill transition-all"'
);
page = page.replace(
  /: "bg-amber-500 h-full rounded-full transition-all duration-500"}/g,
  ': "bg-amber-500 h-full rounded-full animate-progress-fill transition-all"}'
);

// 5. Daily Goal Ring
page = page.replace(
  /<svg className="w-24 h-24 transform -rotate-90"/g,
  '<svg className="w-24 h-24 transform -rotate-90 premium-ring-hover"'
);
page = page.replace(
  /strokeDasharray={2 * Math\.PI * 38}/g,
  'strokeDasharray={2 * Math.PI * 38} className="animate-ring-fill"'
);
// Sometimes it's hardcoded strokeDasharray
page = page.replace(
  /strokeDasharray="238\.76"/g,
  'strokeDasharray="238.76" className="animate-ring-fill"'
);
page = page.replace(
  /strokeDasharray=\{238\.76\}/g,
  'strokeDasharray={238.76} className="animate-ring-fill"'
);


// 6. Today's XP Graph
page = page.replace(
  /<path\s+d="M0 60 C 20 50, 40 55, 60 40 C 80 25, 100 35, 120 15"\s+fill="none"\s+stroke="var\(--clr-primary\)"\s+strokeWidth="3"\s+strokeLinecap="round"\s+\/>/g,
  '<path d="M0 60 C 20 50, 40 55, 60 40 C 80 25, 100 35, 120 15" fill="none" stroke="var(--clr-primary)" strokeWidth="3" strokeLinecap="round" className="animate-graph-draw premium-graph-hover" />'
);
page = page.replace(
  /<path\s+d="M0 60 C 20 50, 40 55, 60 40 C 80 25, 100 35, 120 15"\s+fill="none"\s+stroke="#F43F5E"\s+strokeWidth="3"\s+strokeLinecap="round"\s+\/>/g,
  '<path d="M0 60 C 20 50, 40 55, 60 40 C 80 25, 100 35, 120 15" fill="none" stroke="#F43F5E" strokeWidth="3" strokeLinecap="round" className="animate-graph-draw premium-graph-hover" />'
);

// 7. Cards Reveal and Hover 
// Replace group with stagger-card premium-hover-card 
// For "Activity"
page = page.replace(
  /hover:scale-\[1\.02\] hover:-translate-y-1 hover:shadow-xl transition-all duration-355 ease-out group/g,
  'stagger-card premium-hover-card group'
);
page = page.replace(
  /hover:scale-\[1\.02\] hover:-translate-y-1 hover:shadow-lg transition-all duration-355 ease-out group/g,
  'stagger-card premium-hover-card group'
);

// 8. Search bar
page = page.replace(
  /className="flex items-center gap-3 bg-slate-100 dark:bg-slate-900\/50 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2\.5 w-full lg:w-96"/g,
  'className="flex items-center gap-3 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 w-full lg:w-96 search-bar-premium"'
);

// 9. Sidebar icons
page = page.replace(
  /className=\{`flex items-center justify-center w-10 h-10 rounded-xl transition-all \${activeSidebarTab/g,
  'className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all sidebar-icon-hover ${activeSidebarTab'
);
page = page.replace(
  /className=\{`flex items-center justify-center w-10 h-10 rounded-xl transition-all group-hover:scale-110/g,
  'className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all sidebar-icon-hover group-hover:scale-110'
);

// 10. Buttons
page = page.replace(
  /cursor-pointer active:scale-95"/g,
  'cursor-pointer premium-btn"'
);

// 11. Calendar Today Date
page = page.replace(
  /dateStyles \+= "bg-\[#111827\] dark:bg-white text-white dark:text-slate-900 font-black shadow-sm ";/g,
  'dateStyles += "bg-[#111827] dark:bg-white text-white dark:text-slate-900 font-black shadow-sm animate-today-date ";'
);

// Add stagger delays to cards
const staggerOrder = [
  { term: 'Quantitative<br />Aptitude', delay: '60ms' },
  { term: 'Logical<br />Reasoning', delay: '120ms' },
  { term: 'id="activity-calendar-container"', delay: '180ms', appendClass: 'stagger-card' },
  { term: 'Completed</span>', delay: '240ms' },
  { term: 'Your Streak</span>', delay: '300ms' },
  { term: 'Active Level</span>', delay: '360ms' },
  { term: 'Active Track Unit', delay: '420ms' },
  { term: 'DAILY GOAL', delay: '480ms', appendClass: 'stagger-card premium-hover-card' },
  { term: "TODAY'S XP", delay: '540ms', appendClass: 'stagger-card premium-hover-card' },
  { term: "SALEEM SIR'S DAILY MOTIVATION", delay: '600ms', appendClass: 'stagger-card premium-hover-card' },
  { term: 'UPCOMING MOCK TEST', delay: '660ms', appendClass: 'stagger-card premium-hover-card' }
];

let lines = page.split('\\n');
for (let i = 0; i < lines.length; i++) {
  for (let s of staggerOrder) {
    if (lines[i].includes(s.term)) {
      // search backwards for the nearest stagger-card or add one
      for (let j = i; j >= Math.max(0, i - 15); j--) {
        if (s.appendClass && lines[j].includes('className=')) {
          if (!lines[j].includes('stagger-card')) {
            lines[j] = lines[j].replace('className="', 'className="' + s.appendClass + ' ');
            lines[j] = lines[j].replace('className={isCustomActive ? "', 'className={isCustomActive ? "' + s.appendClass + ' ');
            lines[j] = lines[j].replace('className={isCustomActive\\n', 'className={isCustomActive\\n'); // special case handling
          }
        }
        if (lines[j].includes('stagger-card')) {
          if (!lines[j].includes('style={{')) {
            lines[j] = lines[j].replace('className', `style={{ animationDelay: '${s.delay}' }} className`);
          } else if (lines[j].includes('style={{')) {
            lines[j] = lines[j].replace('style={{', `style={{ animationDelay: '${s.delay}', `);
          }
          break;
        }
      }
    }
  }
}
page = lines.join('\\n');

// Motivation quote animation
page = page.replace(
  /<p className="text-sm text-slate-700 dark:text-slate-300 italic">/g,
  '<p className="text-sm text-slate-700 dark:text-slate-300 italic animate-motivation-quote">'
);

// Upcoming Mock test register button
page = page.replace(
  /className="px-4 py-2 bg-transparent border border-rose-200 dark:border-rose-900\/50/g,
  'className="mock-register-btn px-4 py-2 bg-transparent border border-rose-200 dark:border-rose-900/50 premium-btn'
);

fs.writeFileSync(pagePath, page);
console.log('page.tsx updated');

