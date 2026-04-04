export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) return res.status(400).end();

  // Tenta o endpoint de imagem direto do RapidAPI
  const url = `https://exercisedb.p.rapidapi.com/exercises/image/${id}`;

  try {
    const response = await fetch(url, {
      headers: {
        'x-rapidapi-key':  process.env.VITE_RAPIDAPI_KEY,
        'x-rapidapi-host': 'exercisedb.p.rapidapi.com',
      },
    });

    console.log(`[proxy] ${url} -> ${response.status} ${response.headers.get('content-type')}`);

    if (!response.ok) return res.status(response.status).end();

    const contentType = response.headers.get('content-type') || 'image/gif';
    const buffer = await response.arrayBuffer();
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end(Buffer.from(buffer));
  } catch (err) {
    console.error('[proxy] error:', err.message);
    res.status(500).end();
  }
}
