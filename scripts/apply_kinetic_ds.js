const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '..', 'src', 'app', 'globals.css');
let css = fs.readFileSync(cssPath, 'utf8');

const dsTokens = `
  /* --- KINETIC GLOBAL DESIGN SYSTEM TOKENS --- */
  --spacing-1: 8px;
  --spacing-2: 16px;
  --spacing-3: 24px;
  --spacing-4: 32px;
  --spacing-5: 48px;
  --spacing-6: 64px;

  --radius-sm: 12px;
  --radius-md: 16px;
  --radius-lg: 20px;
  --radius-xl: 24px;

  --shadow-sm: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  --shadow-md: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04);
  --shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);

  --duration-fast: 150ms;
  --duration-normal: 220ms;
  --duration-slow: 350ms;
  --duration-page: 250ms;
  --duration-modal: 220ms;
  --duration-tooltip: 180ms;

  --ease-standard: cubic-bezier(0.0, 0.0, 0.2, 1); /* ease-out */
  --ease-emphasized: cubic-bezier(0.4, 0.0, 0.2, 1); /* ease-in-out */
`;

const dsUtilities = `
/* ==========================================
   KINETIC MOTION & INTERACTION SYSTEM
   ========================================== */

/* 1. Global Cards Hover */
.kinetic-card {
  transition: transform var(--duration-normal) var(--ease-standard), 
              box-shadow var(--duration-normal) var(--ease-standard), 
              border-color var(--duration-normal) var(--ease-standard) !important;
  border-radius: var(--radius-md); /* Standard cards */
  box-shadow: var(--shadow-sm);
}
.kinetic-card:hover {
  transform: translateY(-6px) !important;
  box-shadow: var(--shadow-md), 0 0 15px rgba(255, 255, 255, 0.03) !important;
  border-color: rgba(255, 255, 255, 0.12) !important;
}
.dark .kinetic-card:hover {
  box-shadow: var(--shadow-lg), 0 0 20px rgba(255, 255, 255, 0.05) !important;
  border-color: rgba(255, 255, 255, 0.15) !important;
}

/* 2. Global Buttons */
.kinetic-btn {
  transition: transform var(--duration-fast) var(--ease-standard),
              box-shadow var(--duration-fast) var(--ease-standard),
              background-color var(--duration-fast) var(--ease-standard) !important;
}
.kinetic-btn:hover {
  transform: scale(1.03) !important;
  box-shadow: var(--shadow-md), 0 0 12px rgba(var(--clr-primary-rgb), 0.2) !important;
}
.kinetic-btn:active {
  transform: scale(0.97) !important;
}
.kinetic-btn:hover svg.lucide-chevron-right,
.kinetic-btn:hover svg.lucide-arrow-right {
  transform: translateX(4px) !important;
  transition: transform var(--duration-fast) var(--ease-standard);
}

/* 3. Global Loading State (Skeleton) */
@keyframes skeletonShimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.kinetic-loading {
  background: linear-gradient(90deg, var(--clr-surface) 25%, var(--clr-border) 50%, var(--clr-surface) 75%);
  background-size: 200% 100%;
  animation: skeletonShimmer 1.5s infinite linear;
  border-radius: var(--radius-sm);
  color: transparent !important;
}
.kinetic-loading * {
  visibility: hidden;
}

/* 4. Scroll Reveal Animations */
@keyframes kineticScrollReveal {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
.kinetic-scroll-reveal {
  opacity: 0;
  animation: kineticScrollReveal var(--duration-slow) var(--ease-standard) forwards;
}

/* 5. Tooltips */
@keyframes kineticTooltipEnter {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.kinetic-tooltip {
  animation: kineticTooltipEnter var(--duration-tooltip) var(--ease-standard) forwards;
}

/* 6. Modals */
@keyframes kineticModalEnter {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.kinetic-modal {
  animation: kineticModalEnter var(--duration-modal) var(--ease-emphasized) forwards;
  border-radius: var(--radius-xl) !important;
}

/* 7. Dropdowns */
@keyframes kineticDropdownEnter {
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
}
.kinetic-dropdown {
  animation: kineticDropdownEnter var(--duration-tooltip) var(--ease-standard) forwards;
}

/* 8. Reduced Motion Accessibility */
@media (prefers-reduced-motion: reduce) {
  .kinetic-card { transition: opacity 200ms ease !important; transform: none !important; }
  .kinetic-card:hover { transform: none !important; }
  .kinetic-btn { transition: background-color 200ms ease !important; transform: none !important; }
  .kinetic-btn:hover, .kinetic-btn:active { transform: none !important; }
  .kinetic-scroll-reveal, .kinetic-tooltip, .kinetic-modal, .kinetic-dropdown {
    animation: fadeIn 200ms ease forwards !important;
  }
}
`;

if (!css.includes('KINETIC GLOBAL DESIGN SYSTEM TOKENS')) {
  // Inject tokens into :root
  css = css.replace(/:root\s*\{/, ':root {\n' + dsTokens);
  // Remove old border radius tokens if we want, but let's just let the new ones override if placed at bottom. 
  // Wait, I put it at the top of :root so they will be overridden by old ones!
  // Let's replace the old ones instead to be safe.
  css = css.replace(/--radius-sm: 6px;/g, '/* replaced by kinetic */');
  css = css.replace(/--radius-md: 10px;/g, '/* replaced by kinetic */');
  css = css.replace(/--radius-lg: 14px;/g, '/* replaced by kinetic */');
  css = css.replace(/--radius-xl: 20px;/g, '/* replaced by kinetic */');
  // Inject utilities at the end
  css = css + '\n' + dsUtilities;
  fs.writeFileSync(cssPath, css);
  console.log('Injected global tokens and utilities to globals.css');
} else {
  console.log('Tokens already exist in globals.css');
}
