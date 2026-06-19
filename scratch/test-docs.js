const http = require('http');

const routes = [
  '/docs',
  '/docs/getting-started',
  '/docs/architecture',
  '/docs/database',
  '/docs/api',
  '/docs/student-platform',
  '/docs/admin-portal',
  '/docs/deployment',
  '/docs/troubleshooting',
  '/docs/faq',
  '/docs/contributing'
];

function fetchRoute(route) {
  return new Promise((resolve) => {
    const url = `http://localhost:3000${route}`;
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          route,
          statusCode: res.statusCode,
          headers: res.headers,
          length: data.length,
          isHtml: res.headers['content-type']?.includes('text/html'),
          hasError: data.includes('Application error: a client-side exception has occurred') || data.includes('Failed to load') || data.includes('Next.js compiler error')
        });
      });
    }).on('error', (err) => {
      resolve({
        route,
        statusCode: 500,
        error: err.message
      });
    });
  });
}

async function run() {
  console.log('Testing routes...');
  for (const route of routes) {
    const result = await fetchRoute(route);
    console.log(`Route: ${result.route.padEnd(30)} | Status: ${result.statusCode} | Length: ${result.length || 0} | HasClientError: ${result.hasError}`);
  }
}

run();
