const fs = require('fs');
const path = require('path');

const dir = path.join(process.cwd(), '.open-next');
const handler = path.join(dir, 'opennext-handler.js');
const worker = path.join(dir, 'worker.js');

fs.renameSync(worker, handler);

fs.writeFileSync(worker, `import handler from './opennext-handler.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/aiwriter')) {
      const targetUrl = new URL(request.url);
      targetUrl.hostname = 'ai-proposal-intelligence.vercel.app';
      targetUrl.port = '';
      targetUrl.protocol = 'https:';
      return fetch(targetUrl.toString(), {
        method: request.method,
        headers: request.headers,
        body: request.method !== 'GET' && request.method !== 'HEAD'
          ? request.body
          : undefined,
      });
    }
    return handler.fetch(request, env, ctx);
  },
};
`);

console.log('Router shim injected into .open-next/worker.js');
