export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).end();
  }

  try {
    const url = `https://exercisedb.p.rapidapi.com/exercises/image/${id}`;

    const response = await fetch(url, {
      headers: {
        'x-rapidapi-key':  process.env.VITE_RAPIDAPI_KEY,
        'x-rapidapi-host': process.env.VITE_RAPIDAPI_HOST,
      },
    });

    console.log('Proxy fetch:', url, '-> status:', response.status);

    if (!response.ok) return res.status(response.status).end();

    const buffer = await response.arrayBuffer();
    res.setHeader('Content-Type', response.headers.get('content-type') || 'image/gif');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end(Buffer.from(buffer));
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(500).end();
  }
}
