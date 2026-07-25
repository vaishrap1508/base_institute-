const fs = require('fs');

const layout = 'src/app/layout.tsx';
let lData = fs.readFileSync(layout, 'utf8');
lData = lData.replace(/strategy="beforeInteractive"/, '');
fs.writeFileSync(layout, lData);

const fixCountUp = (path) => {
  let d = fs.readFileSync(path, 'utf8');
  d = d.replace('let startTimestamp = null;', 'let startTimestamp: number | null = null;');
  d = d.replace('const step = (timestamp)', 'const step = (timestamp: number)');
  
  // also fix duplicate attributes in page.tsx if any
  // src/app/student/dashboard/page.tsx(3376,98): error TS17001: JSX elements cannot have multiple attributes with the same name.
  d = d.replace(/className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800\/50 flex items-center justify-center className="w-10 h-10"/g, 'className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center"');
  
  fs.writeFileSync(path, d);
};

fixCountUp('src/app/student/dashboard/page.tsx');
fixCountUp('src/components/student/DailyPerformanceHub.tsx');
