export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).end();
  }

  try {
    const decodedUrl = decodeURIComponent(url);

    // Imagens do exercisedb são públicas — não enviar headers de auth
    const response = await fetch(decodedUrl);

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
