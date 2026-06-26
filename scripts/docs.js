const { spawn, exec } = require('child_process');
const http = require('http');
const net = require('net');

let port = process.env.PORT || 3000;
let url = `http://localhost:${port}/docs`;
let browserOpened = false;
let pollInterval;
let devServer;

function checkPortStatus(p) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true); // Port is in use
      } else {
        resolve(false);
      }
    });
    server.once('listening', () => {
      server.close();
      resolve(false); // Port is free
    });
    server.listen(p);
  });
}

let openFn;
async function getOpenFn() {
  if (openFn) return openFn;
  try {
    const openModule = await import('open');
    openFn = openModule.default;
  } catch (e) {
    try {
      openFn = require('open');
    } catch (err) {
      // open is pure ESM in newer versions and require() will fail
      openFn = null;
    }
  }
  return openFn;
}

async function triggerBrowserOpen() {
  if (browserOpened) return;
  browserOpened = true;
  if (pollInterval) clearInterval(pollInterval);
  
  console.log(`\n✨ Server is ready! Opening browser to ${url}...\n`);
  
  try {
    const open = await getOpenFn();
    if (open) {
      await open(url);
    } else {
      fallbackOpen();
    }
  } catch (err) {
    console.error('⚠️ Failed to open browser using "open" package:', err.message);
    fallbackOpen();
  }
}

function fallbackOpen() {
  let command;
  
  if (process.platform === 'darwin') {
    command = `open "${url}"`;
  } else if (process.platform === 'win32') {
    command = `start "${url}"`;
  } else {
    command = `xdg-open "${url}"`;
  }
  
  exec(command, (err) => {
    if (err) {
      console.error(`❌ Could not open browser automatically. Please open: ${url}`);
    }
  });
}

async function main() {
  const inUse = await checkPortStatus(port);
  if (inUse) {
    console.log(`ℹ️ Next.js server is already running on port ${port}.`);
    await triggerBrowserOpen();
    process.exit(0);
  }

  console.log(`🚀 Starting Next.js application dev server...`);

  devServer = spawn('npm', ['run', 'dev'], {
    shell: true,
    stdio: ['inherit', 'pipe', 'inherit']
  });

  devServer.stdout.on('data', (data) => {
    process.stdout.write(data);
    const output = data.toString();
    
    // Parse port from stdout if printed (e.g. Local: http://localhost:3001)
    const match = output.match(/http:\/\/(?:localhost|127\.0\.0\.1|\[::1\]):(\d+)/);
    if (match) {
      const detectedPort = parseInt(match[1], 10);
      if (detectedPort !== port) {
        port = detectedPort;
        url = `http://localhost:${port}/docs`;
      }
    }

    if (!browserOpened && (output.includes('Ready') || output.includes('ready') || output.includes('Local:'))) {
      triggerBrowserOpen();
    }
  });

  // Polling interval
  pollInterval = setInterval(() => {
    if (browserOpened) {
      clearInterval(pollInterval);
      return;
    }
    
    const req = http.get(`http://localhost:${port}/docs`, (res) => {
      triggerBrowserOpen();
    });
    
    req.on('error', () => {
      // Not ready yet
    });
    
    req.end();
  }, 500);
}

main().catch((err) => {
  console.error('❌ Failed to run documentation script:', err);
  process.exit(1);
});

// Clean up child process on exit
process.on('SIGINT', () => {
  if (devServer) devServer.kill('SIGINT');
  process.exit();
});

process.on('SIGTERM', () => {
  if (devServer) devServer.kill('SIGTERM');
  process.exit();
});
