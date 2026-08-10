// Tiny static server for local testing of the tracker.
const http = require('http'), fs = require('fs'), path = require('path');
const root = __dirname;
http.createServer((req, res) => {
  const p = path.join(root, req.url === '/' ? 'index.html' : decodeURIComponent(req.url));
  fs.readFile(p, (err, data) => {
    if (err) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, { 'Content-Type': p.endsWith('.html') ? 'text/html' : 'text/plain' });
    res.end(data);
  });
}).listen(8391, () => console.log('tracker server on http://localhost:8391'));
