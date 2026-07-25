const fs = require('fs');
const path = require('path');

const hubPath = path.join(__dirname, '..', 'src', 'components', 'student', 'DailyPerformanceHub.tsx');
const motivationPath = path.join(__dirname, '..', 'src', 'components', 'student', 'DailyMotivation.tsx');

let hub = fs.readFileSync(hubPath, 'utf8');

// 1. Add CountUp
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
  hub = hub.replace(/(import .*;\n)+/, (match) => match + '\n' + countUpCode + '\n');
}

// Stagger and Hover classes
hub = hub.replace(
  /className="bg-white dark:bg-slate-900\/40 border border-slate-200 dark:border-slate-800\/60 rounded-3xl p-6 relative overflow-hidden flex flex-col group"/g,
  'className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 rounded-3xl p-6 relative overflow-hidden flex flex-col group stagger-card premium-hover-card" style={{ animationDelay: "480ms" }}'
);
hub = hub.replace(
  /className="bg-white dark:bg-slate-900\/40 border border-slate-200 dark:border-slate-800\/60 rounded-3xl p-6 flex flex-col justify-between group"/g,
  'className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 rounded-3xl p-6 flex flex-col justify-between group stagger-card premium-hover-card" style={{ animationDelay: "540ms" }}'
);
hub = hub.replace(
  /className="bg-white dark:bg-slate-900\/40 border border-slate-200 dark:border-slate-800\/60 rounded-3xl p-6 flex flex-col gap-4 group"/g,
  'className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 rounded-3xl p-6 flex flex-col gap-4 group stagger-card premium-hover-card" style={{ animationDelay: "660ms" }}'
);

// Ring animation
hub = hub.replace(
  /className="transform -rotate-90 w-20 h-20"/g,
  'className="transform -rotate-90 w-20 h-20 premium-ring-hover"'
);
hub = hub.replace(
  /strokeDasharray={2 \* Math\.PI \* 34}/g,
  'strokeDasharray={2 * Math.PI * 34} className="animate-ring-fill"'
);

// Graph animation
hub = hub.replace(
  /strokeLinecap="round"\s+\/>/g,
  'strokeLinecap="round" className="animate-graph-draw premium-graph-hover" />'
);

// Countups
hub = hub.replace(
  />{Math\.round\(\(dailyData\.solved \/ dailyData\.target\) \* 100\)}%<\/span>/g,
  '><CountUp end={Math.round((dailyData.solved / dailyData.target) * 100)} suffix="%" /></span>'
);
hub = hub.replace(
  />{xpData\.xp_today}<\/span>/g,
  '><CountUp end={xpData.xp_today} /></span>'
);

// Upcoming mock test register button
hub = hub.replace(
  /className="px-4 py-2 bg-transparent border border-rose-200 dark:border-rose-900\/50/g,
  'className="mock-register-btn px-4 py-2 bg-transparent border border-rose-200 dark:border-rose-900/50 premium-btn'
);

fs.writeFileSync(hubPath, hub);
console.log('DailyPerformanceHub.tsx updated');

let motivation = fs.readFileSync(motivationPath, 'utf8');

motivation = motivation.replace(
  /className="bg-white dark:bg-slate-900\/40 border border-slate-200 dark:border-slate-800\/60 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start justify-between gap-6 hover:shadow-lg transition-all cursor-pointer"/g,
  'className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start justify-between gap-6 hover:shadow-lg transition-all cursor-pointer stagger-card premium-hover-card" style={{ animationDelay: "600ms" }}'
);

motivation = motivation.replace(
  /<p className="text-sm md:text-base text-slate-700 dark:text-slate-300 italic">/g,
  '<p className="text-sm md:text-base text-slate-700 dark:text-slate-300 italic animate-motivation-quote">'
);

fs.writeFileSync(motivationPath, motivation);
console.log('DailyMotivation.tsx updated');
