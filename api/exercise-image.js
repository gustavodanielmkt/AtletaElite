module.exports = async function handler(req, res) {
  const { id } = req.query;
  if (!id) return res.status(400).end();

  const urls = [
    `https://exercisedb.p.rapidapi.com/exercises/image/${id}`,
    `https://exercisedb.p.rapidapi.com/image/${id}`,
  ];

  for (const url of urls) {
    try {
      const response = await fetch(url, {
        headers: {
          'x-rapidapi-key':  process.env.VITE_RAPIDAPI_KEY,
          'x-rapidapi-host': 'exercisedb.p.rapidapi.com',
        },
      });
      console.log(`[proxy] ${url} -> ${response.status}`);
      if (!response.ok) continue;

      const contentType = response.headers.get('content-type') || 'image/gif';
      if (!contentType.startsWith('image/')) continue;

      const buffer = await response.arrayBuffer();
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.end(Buffer.from(buffer));
    } catch (err) {
      console.error(`[proxy] error for ${url}:`, err.message);
    }
  }

  res.status(404).end();
};
