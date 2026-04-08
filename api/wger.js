import https from 'https';

// Proxies requests to https://wger.de/api/v2/
// Usage: /api/wger?path=exercisecategory%2F%3Fformat%3Djson
//        /api/wger?path=exerciseinfo%2F%3Fformat%3Djson%26category%3D12%26limit%3D20
export default function handler(req, res) {
  const rawPath = req.query.path;
  if (!rawPath) return res.status(400).end();

  const wgerPath = `/api/v2/${decodeURIComponent(rawPath)}`;

  const options = {
    hostname: 'wger.de',
    path: wgerPath,
    method: 'GET',
    headers: { Accept: 'application/json' },
  };

  return new Promise((resolve) => {
    const request = https.request(options, (response) => {
      if (response.statusCode !== 200) {
        res.status(response.statusCode).end();
        return resolve();
      }

      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.end(Buffer.concat(chunks).toString('utf-8'));
        resolve();
      });
    });

    request.on('error', (err) => {
      console.error('[wger-proxy] error:', err.message);
      res.status(500).end();
      resolve();
    });

    request.end();
  });
}
