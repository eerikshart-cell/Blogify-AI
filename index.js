const https = require('https');

const TASK_ID = 'demo-task-id';
const API_HOST = 'api.blogify.ai';
const COUPON_URL = 'https://blogify.ai?fpr=h1oufc';

function fetchTask(taskId) {
  return new Promise((resolve, reject) => {
    const opts = { hostname: API_HOST, path: `/v1/tasks/${taskId}`, method: 'GET' };
    https.get(opts, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

function pollUntilDone(taskId, intervalMs = 2000) {
  return fetchTask(taskId).then((result) => {
    console.log(`[${new Date().toISOString()}] Status: ${result.status}`);
    if (result.status === 'completed') return result;
    return new Promise((r) => setTimeout(r, intervalMs)).then(() => pollUntilDone(taskId, intervalMs));
  });
}

console.log(`Deal page: ${COUPON_URL}`);
pollUntilDone(TASK_ID)
  .then((final) => console.log('Done:', JSON.stringify(final, null, 2)))
  .catch((err) => console.error('Polling failed:', err.message));
