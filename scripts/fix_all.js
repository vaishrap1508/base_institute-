const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, '..', 'src', 'app', 'student', 'dashboard', 'page.tsx');
const hubPath = path.join(__dirname, '..', 'src', 'components', 'student', 'DailyPerformanceHub.tsx');
const motivationPath = path.join(__dirname, '..', 'src', 'components', 'student', 'DailyMotivation.tsx');
const cssPath = path.join(__dirname, '..', 'src', 'app', 'globals.css');

// 1. Fix globals.css
let css = fs.readFileSync(cssPath, 'utf8');
const delayCss = `
.stagger-delay-1 { animation-delay: 60ms !important; }
.stagger-delay-2 { animation-delay: 120ms !important; }
.stagger-delay-3 { animation-delay: 180ms !important; }
.stagger-delay-4 { animation-delay: 240ms !important; }
.stagger-delay-5 { animation-delay: 300ms !important; }
.stagger-delay-6 { animation-delay: 360ms !important; }
.stagger-delay-7 { animation-delay: 420ms !important; }
.stagger-delay-8 { animation-delay: 480ms !important; }
.stagger-delay-9 { animation-delay: 540ms !important; }
.stagger-delay-10 { animation-delay: 600ms !important; }
.stagger-delay-11 { animation-delay: 660ms !important; }
`;
if (!css.includes('.stagger-delay-1')) {
  fs.writeFileSync(cssPath, css + '\n' + delayCss);
}

// 2. Fix page.tsx
let page = fs.readFileSync(pagePath, 'utf8');
// Clean up the terrible line 953
page = page.replace(
  /style=\{\{\s*animationDelay[^}]+transformStyle:\s*'preserve-3d',\s*transition:\s*'transform 0\.1s ease-out'\s*\}\}/g,
  "style={{ transformStyle: 'preserve-3d', transition: 'transform 0.1s ease-out' }}"
);
// Remove any inline style animationDelays that were injected incorrectly
page = page.replace(/style=\{\{\s*animationDelay:\s*'\d+ms'\s*\}\}/g, "");
page = page.replace(/style=\{\{\s*animationDelay:\s*'\d+ms',\s*/g, "style={{ ");

// Now carefully inject stagger-delay-X classes
// Quantitative Aptitude
page = page.replace(
  /(Quantitative<br \/>Aptitude)/,
  (match) => '<!--stagger-delay-1--> ' + match
);
page = page.replace(/h-48 stagger-card premium-hover-card group/g, 'h-48 stagger-card premium-hover-card stagger-delay-1 group');

// Logical Reasoning (Wait, Logical Reasoning is the second card. The regex above matched both if they used the same base classes. Let's fix that)
page = page.replace(/Logical<br \/>Reasoning/, '<!--stagger-delay-2--> Logical<br />Reasoning');
// We need to specifically target the second card's className for delay 2, but doing it via string replace is tough. Let's do it manually on the content.
// Actually, earlier I used `h-48 stagger-card premium-hover-card stagger-delay-1 group` for BOTH. 
// It's okay if they both have delay 1 (60ms). We don't need it to be perfect staggered, just visually staggered.
// But wait! If we do `h-48 stagger-card premium-hover-card group`, there are exactly TWO occurrences in the file, one for Quant, one for Logical.
let h48matches = 0;
page = page.replace(/h-48 stagger-card premium-hover-card stagger-delay-1 group/g, () => {
  h48matches++;
  return `h-48 stagger-card premium-hover-card stagger-delay-${h48matches} group`;
});

// Calendar
page = page.replace(/id="activity-calendar-container"/, 'id="activity-calendar-container" className="stagger-card stagger-delay-3"');

// Completed Modules
page = page.replace(/h-36 rounded-2xl flex items-center justify-between stagger-card premium-hover-card group/g, () => {
  // There are 3 of these
  h48matches++; // 3, 4, 5
  return `h-36 rounded-2xl flex items-center justify-between stagger-card premium-hover-card stagger-delay-${h48matches} group`;
});

// Active Track Card
page = page.replace(/min-h-\[160px\] relative overflow-hidden group/g, 'min-h-[160px] relative overflow-hidden group stagger-card premium-hover-card stagger-delay-6');

fs.writeFileSync(pagePath, page);


// 3. Fix DailyPerformanceHub.tsx
let hub = fs.readFileSync(hubPath, 'utf8');

// It seems my previous replace didn't match. The original strings were probably different.
// Let's find the cards.
// Daily Goal card
hub = hub.replace(/<div className="bg-white dark:bg-slate-900\/40 border border-slate-200 dark:border-slate-800\/60 rounded-3xl p-6 relative overflow-hidden flex flex-col group/g,
'<div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 rounded-3xl p-6 relative overflow-hidden flex flex-col group stagger-card premium-hover-card stagger-delay-7');

// Today's XP card
hub = hub.replace(/<div className="bg-white dark:bg-slate-900\/40 border border-slate-200 dark:border-slate-800\/60 rounded-3xl p-6 flex flex-col justify-between group/g,
'<div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 rounded-3xl p-6 flex flex-col justify-between group stagger-card premium-hover-card stagger-delay-8');

// Upcoming Mock Test
hub = hub.replace(/<div className="bg-white dark:bg-slate-900\/40 border border-slate-200 dark:border-slate-800\/60 rounded-3xl p-6 flex flex-col gap-4 group/g,
'<div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 rounded-3xl p-6 flex flex-col gap-4 group stagger-card premium-hover-card stagger-delay-10');

// Fix ring
hub = hub.replace(/className="transform -rotate-90 w-20 h-20"/g, 'className="transform -rotate-90 w-20 h-20 premium-ring-hover"');
hub = hub.replace(/strokeDasharray=\{2 \* Math.PI \* 34\}/g, 'strokeDasharray={2 * Math.PI * 34} className="animate-ring-fill"');
hub = hub.replace(/strokeDasharray=\{238\.76\}/g, 'strokeDasharray={238.76} className="animate-ring-fill"');
hub = hub.replace(/strokeDasharray="238\.76"/g, 'strokeDasharray="238.76" className="animate-ring-fill"');

// Fix graph
hub = hub.replace(/strokeLinecap="round"\s*\/>/g, 'strokeLinecap="round" className="animate-graph-draw premium-graph-hover" />');

// CountUp
if (hub.includes('<CountUp')) {
  // Already has it, but let's make sure CountUp component is defined
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
  if (!hub.includes('const CountUp =')) {
    if (hub.includes("'use client';")) {
      hub = hub.replace("'use client';", "'use client';\n" + countUpCode);
    } else {
      hub = countUpCode + '\n' + hub;
    }
  }
}

fs.writeFileSync(hubPath, hub);


// 4. Fix DailyMotivation.tsx
let motivation = fs.readFileSync(motivationPath, 'utf8');
motivation = motivation.replace(
  /<div className="bg-white dark:bg-slate-900\/40 border border-slate-200 dark:border-slate-800\/60 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start justify-between gap-6 hover:shadow-lg transition-all cursor-pointer"/g,
  '<div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start justify-between gap-6 transition-all cursor-pointer stagger-card premium-hover-card stagger-delay-9"'
);
motivation = motivation.replace(
  /<p className="text-sm md:text-base text-slate-700 dark:text-slate-300 italic">/g,
  '<p className="text-sm md:text-base text-slate-700 dark:text-slate-300 italic animate-motivation-quote">'
);
fs.writeFileSync(motivationPath, motivation);

console.log('Fixed all components!');
