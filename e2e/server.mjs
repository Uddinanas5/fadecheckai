// Minimal static server for the exported web build (dist/) with SPA fallback,
// so deep links like /style/mid-taper-fade resolve to index.html.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', 'dist');

const TYPES = {
  '.js': 'application/javascript',
  '.html': 'text/html',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.map': 'application/json',
  '.svg': 'image/svg+xml',
};

export function startServer(port = 8899) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const p = decodeURIComponent(req.url.split('?')[0]);
      const f = path.join(ROOT, p);
      if (f.startsWith(ROOT) && fs.existsSync(f) && fs.statSync(f).isFile()) {
        res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
        fs.createReadStream(f).pipe(res);
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      fs.createReadStream(path.join(ROOT, 'index.html')).pipe(res);
    });
    server.listen(port, () => resolve(server));
  });
}

// Allow running standalone: `node e2e/server.mjs`
if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.env.PORT) || 8899;
  startServer(port).then(() => console.log(`SPA server on http://localhost:${port}`));
}
