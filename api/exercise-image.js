import https from 'https';

export default function handler(req, res) {
  const { id } = req.query;
  if (!id) return res.status(400).end();

  const options = {
    hostname: 'exercisedb.p.rapidapi.com',
    path: `/exercises/image/${id}`,
    method: 'GET',
    headers: {
      'x-rapidapi-key':  process.env.VITE_RAPIDAPI_KEY,
      'x-rapidapi-host': 'exercisedb.p.rapidapi.com',
    },
  };

  return new Promise((resolve) => {
    const request = https.request(options, (response) => {
      console.log(`[proxy] status: ${response.statusCode}`);

      if (response.statusCode !== 200) {
        res.status(response.statusCode).end();
        return resolve();
      }

      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => {
        const buffer = Buffer.concat(chunks);
        res.setHeader('Content-Type', response.headers['content-type'] || 'image/gif');
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.end(buffer);
        resolve();
      });
    });

    request.on('error', (err) => {
      console.error('[proxy] error:', err.message);
      res.status(500).end();
      resolve();
    });

    request.end();
  });
}
