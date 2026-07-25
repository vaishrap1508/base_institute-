const fs = require('fs');
const path = require('path');

const layoutPath = path.join(__dirname, '..', 'src', 'app', 'layout.tsx');
let content = fs.readFileSync(layoutPath, 'utf8');

if (!content.includes('KineticObserver')) {
  // Add import
  content = content.replace(
    'import ThemeToggle from "@/components/ThemeToggle";',
    'import ThemeToggle from "@/components/ThemeToggle";\nimport KineticObserver from "@/components/KineticObserver";'
  );
  
  // Inject observer just before {children}
  content = content.replace(
    '{children}',
    '<KineticObserver />\n        {children}'
  );
  
  // also fix Script tag to script tag to avoid Next.js warnings about strategy if needed, but let's just leave it
  // Wait, in my previous fix_ts.js I changed Script to script.
  fs.writeFileSync(layoutPath, content);
  console.log('Injected KineticObserver successfully');
} else {
  console.log('KineticObserver already injected');
}
