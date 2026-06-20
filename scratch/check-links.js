const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, '../src/app/docs');

// Helper to recursively list files
function getFiles(dir, files = []) {
  const fileList = fs.readdirSync(dir);
  for (const file of fileList) {
    const name = path.join(dir, file);
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files);
    } else {
      files.push(name);
    }
  }
  return files;
}

// Map files to valid paths/routes
const allFiles = getFiles(docsDir);
const validRoutes = new Set();

allFiles.forEach(file => {
  if (file.endsWith('.mdx')) {
    let relative = path.relative(docsDir, file);
    let route = '/docs/' + relative.replace(/\\/g, '/');
    if (route.endsWith('/page.mdx')) {
      route = route.slice(0, -9);
    } else if (route.endsWith('page.mdx')) {
      route = route.slice(0, -8);
    }
    if (route.endsWith('/')) {
      route = route.slice(0, -1);
    }
    if (route === '/docs/page') {
      route = '/docs';
    }
    validRoutes.add(route);
  }
});

console.log('Discovered Valid Routes:', Array.from(validRoutes).sort());

const mdLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
const hrefRegex = /href=["']([^"']+)["']/g;

let brokenLinksCount = 0;
let totalLinksCount = 0;

allFiles.forEach(file => {
  if (!file.endsWith('.mdx')) return;

  const content = fs.readFileSync(file, 'utf8');
  const relativeFile = path.relative(docsDir, file);

  let match;
  const links = [];

  // Extract Markdown links
  while ((match = mdLinkRegex.exec(content)) !== null) {
    links.push({ text: match[1], url: match[2], line: getLineNumber(content, match.index) });
  }

  // Extract HTML / JSX hrefs
  while ((match = hrefRegex.exec(content)) !== null) {
    links.push({ text: 'href', url: match[1], line: getLineNumber(content, match.index) });
  }

  links.forEach(link => {
    let url = link.url.trim();

    // Ignore javascript template expressions, mailto, anchor only links
    if (url.startsWith('mailto:') || url.startsWith('#') || url.startsWith('{') || url.startsWith('//')) {
      return;
    }

    // Handle file:/// links
    if (url.startsWith('file:///')) {
      totalLinksCount++;
      const filePath = url.replace('file://', '');
      if (!fs.existsSync(filePath)) {
        console.error(`Broken Local File Link in ${relativeFile}:${link.line} - File "${filePath}" not found.`);
        brokenLinksCount++;
      }
      return;
    }

    // Ignore http/https external links
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return;
    }

    totalLinksCount++;

    // Resolve relative links (e.g. ./getting-started or ../architecture)
    let resolvedRoute = url;
    if (url.startsWith('.')) {
      // Relative to current file's folder
      const currentDirRoute = '/docs/' + path.dirname(relativeFile).replace(/\\/g, '/');
      resolvedRoute = path.posix.resolve(currentDirRoute, url);
    } else if (!url.startsWith('/')) {
      // Treat as relative to current folder if it doesn't start with /
      const currentDirRoute = '/docs/' + path.dirname(relativeFile).replace(/\\/g, '/');
      resolvedRoute = path.posix.resolve(currentDirRoute, './' + url);
    }

    // Remove hash/anchor or query parameters
    const cleanRoute = resolvedRoute.split('#')[0].split('?')[0];

    // Clean up trailing slash
    let checkRoute = cleanRoute;
    if (checkRoute.endsWith('/')) {
      checkRoute = checkRoute.slice(0, -1);
    }

    // Ignore non-docs routes in the application
    if (checkRoute === '/' || checkRoute === '/login' || checkRoute === '/onboarding' || checkRoute.startsWith('/api/') || checkRoute.startsWith('/admin/')) {
      return;
    }

    if (!validRoutes.has(checkRoute)) {
      console.error(`Broken Link in ${relativeFile}:${link.line} - Link target "${url}" (resolved: "${checkRoute}") not found.`);
      brokenLinksCount++;
    }
  });
});

function getLineNumber(text, index) {
  const temp = text.substring(0, index);
  return temp.split('\n').length;
}

console.log(`\nLink Check Completed.`);
console.log(`Total internal/local links checked: ${totalLinksCount}`);
console.log(`Broken links found: ${brokenLinksCount}`);
if (brokenLinksCount > 0) {
  process.exit(1);
} else {
  console.log('All links are valid!');
}
