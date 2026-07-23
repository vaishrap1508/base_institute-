const fs = require('fs');
const path = require('path');

const walkDir = (dir, callback) => {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
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

  // 1. Add kinetic-btn to buttons
  // Match <button ... className="..."> and inject kinetic-btn
  content = content.replace(/<button([^>]*?)className=["']([^"']*)["']([^>]*)>/g, (match, p1, p2, p3) => {
    if (p2.includes('kinetic-btn')) return match;
    // Don't add to very tiny icon buttons if they have w-4 h-4, but let's just add it to all standard buttons
    // The user said: "Buttons should behave identically... Every interaction throughout the platform must follow the same motion language."
    return `<button${p1}className="${p2} kinetic-btn"${p3}>`;
  });
  
  // Also match buttons that don't have className yet
  content = content.replace(/<button((?!className)[^>]*)>/g, (match, p1) => {
    if (match.includes('kinetic-btn')) return match;
    return `<button${p1} className="kinetic-btn">`;
  });

  // 2. Add kinetic-card to anything that looks like a card
  // Usually cards have: rounded-xl or rounded-2xl or rounded-3xl AND shadow or border
  content = content.replace(/className=["']([^"']*(?:rounded-xl|rounded-2xl|rounded-3xl)[^"']*(?:border|shadow)[^"']*)["']/g, (match, p1) => {
    if (p1.includes('kinetic-card')) return match;
    // skip very small things like badges
    if (p1.includes('w-6') || p1.includes('w-8') || p1.includes('h-6') || p1.includes('h-8') || p1.includes('badge')) return match;
    return `className="${p1} kinetic-card"`;
  });

  // 3. Add kinetic-modal to modal dialogs
  // Modals usually have fixed inset-0 or absolute inset-0 z-50
  content = content.replace(/className=["']([^"']*(?:fixed inset-0|fixed top-0 left-0 w-full h-full)[^"']*z-[45]0[^"']*)["']/g, (match, p1) => {
    if (p1.includes('kinetic-modal')) return match;
    return `className="${p1} kinetic-modal"`;
  });
  // Also target inner modal containers (e.g. bg-white rounded-xl shadow-xl max-w-md)
  content = content.replace(/className=["']([^"']*bg-white[^"']*shadow-(?:xl|2xl)[^"']*)["']/g, (match, p1) => {
    if (p1.includes('kinetic-modal') || p1.includes('kinetic-card')) return match;
    if (p1.includes('fixed') || p1.includes('absolute')) {
       return `className="${p1} kinetic-modal"`;
    }
    return match;
  });

  // 4. Add kinetic-tooltip to tooltips
  content = content.replace(/className=["']([^"']*absolute[^"']*(?:-top-|-bottom-|-left-|-right-)[^"']*shadow[^"']*)["']/g, (match, p1) => {
    if (p1.includes('kinetic-tooltip') || p1.includes('kinetic-dropdown')) return match;
    // if it's small, it's a tooltip, if large it's dropdown
    if (p1.includes('p-1') || p1.includes('p-2') || p1.includes('text-xs')) {
      return `className="${p1} kinetic-tooltip"`;
    } else {
      return `className="${p1} kinetic-dropdown"`;
    }
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    modifiedFiles++;
  }
});

console.log(`Successfully applied Kinetic classes to ${modifiedFiles} files.`);
