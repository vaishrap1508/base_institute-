const fs = require('fs');
const path = require('path');

const walkDir = (dir, callback) => {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    if (fs.statSync(dirPath).isDirectory()) {
      walkDir(dirPath, callback);
    } else if (dirPath.endsWith('.tsx') || dirPath.endsWith('.ts')) {
      callback(dirPath);
    }
  });
};

const srcDir = path.join(__dirname, '..', 'src');
let modifiedFiles = 0;

walkDir(srcDir, (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // SAFE regex 1: match ONLY exact string className="..."
  // We match className="anything not a quote" and inject into it.
  
  // 1. Add kinetic-card to standard cards (rounded-xl, 2xl, 3xl with border/shadow)
  content = content.replace(/className=["']([^"']*(?:rounded-xl|rounded-2xl|rounded-3xl)[^"']*(?:border|shadow)[^"']*)["']/g, (match, p1) => {
    if (p1.includes('kinetic-card')) return match;
    if (p1.includes('w-6') || p1.includes('w-8') || p1.includes('h-6') || p1.includes('h-8') || p1.includes('badge')) return match;
    return `className="${p1} kinetic-card"`;
  });

  // 2. Add kinetic-modal to modal wrappers (fixed inset-0 z-50)
  content = content.replace(/className=["']([^"']*(?:fixed inset-0|fixed top-0 left-0 w-full h-full|fixed top-0 right-0 h-full w-full max-w-)[^"']*z-[45]0[^"']*)["']/g, (match, p1) => {
    if (p1.includes('kinetic-modal')) return match;
    return `className="${p1} kinetic-modal"`;
  });

  // 3. Add kinetic-tooltip and dropdown
  content = content.replace(/className=["']([^"']*absolute[^"']*(?:-top-|-bottom-|-left-|-right-)[^"']*shadow[^"']*)["']/g, (match, p1) => {
    if (p1.includes('kinetic-tooltip') || p1.includes('kinetic-dropdown')) return match;
    if (p1.includes('p-1') || p1.includes('p-2') || p1.includes('text-xs')) {
      return `className="${p1} kinetic-tooltip"`;
    } else {
      return `className="${p1} kinetic-dropdown"`;
    }
  });

  // 4. Buttons (we will ONLY match buttons that have className="...")
  // Using a replacer function on the whole file, finding <button ... className="..."> 
  const buttonRegex = /<button\s+([^>]*?)className=(["'])([^"']*)(["'])/g;
  content = content.replace(buttonRegex, (match, beforeClass, quote1, classes, quote2) => {
    // Only modify if it doesn't have it already
    if (!classes.includes('kinetic-btn')) {
      // make sure we don't accidentally match an arrow function inside beforeClass
      if (!beforeClass.includes('=>')) {
        return `<button ${beforeClass}className=${quote1}${classes} kinetic-btn${quote2}`;
      }
    }
    return match;
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    modifiedFiles++;
  }
});

console.log(`Successfully applied Kinetic classes to ${modifiedFiles} files securely.`);
