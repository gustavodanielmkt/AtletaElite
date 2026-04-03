export default async function handler(req, res) {
  const { url } = req.query;

  if (!url || !url.startsWith('https://v2.exercisedb.io/')) {
    return res.status(400).end();
  }

  try {
    const response = await fetch(url, {
      headers: {
        'x-rapidapi-key':  process.env.VITE_RAPIDAPI_KEY,
        'x-rapidapi-host': process.env.VITE_RAPIDAPI_HOST,
      },
    });

    if (!response.ok) return res.status(response.status).end();

    const buffer = await response.arrayBuffer();
    res.setHeader('Content-Type', response.headers.get('content-type') || 'image/gif');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(Buffer.from(buffer));
  } catch {
    res.status(500).end();
  }
}
