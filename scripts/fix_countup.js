const fs = require('fs');
const file = 'src/app/student/dashboard/page.tsx';
let content = fs.readFileSync(file, 'utf8');
const countUp = `
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

if (!content.includes('const CountUp =')) {
  // Try to insert after 'use client';
  if (content.includes("'use client';")) {
    content = content.replace("'use client';", "'use client';\n" + countUp);
  } else if (content.includes('"use client";')) {
    content = content.replace('"use client";', '"use client";\n' + countUp);
  }
  fs.writeFileSync(file, content);
  console.log('Fixed page.tsx');
} else {
  console.log('Already fixed page.tsx');
}
