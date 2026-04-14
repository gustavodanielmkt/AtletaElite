export default async function handler(req, res) {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: 'Missing query parameter q' });

  const apiKey = (process.env.PEXELS_API_KEY || '').trim();
  if (!apiKey) {
    console.warn('[pexels] PEXELS_API_KEY not configured');
    return res.status(200).json({ photo: null });
  }

  try {
    const pexelsRes = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=square`,
      { headers: { Authorization: apiKey } }
    );

    if (!pexelsRes.ok) {
      console.error('[pexels] API error:', pexelsRes.status);
      return res.status(200).json({ photo: null });
    }

    const data = await pexelsRes.json();
    const photo = data.photos?.[0];

    if (!photo) return res.status(200).json({ photo: null });

    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.status(200).json({
      photo: photo.src.medium,
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
    });
  } catch (err) {
    console.error('[pexels] Exception:', err.message || err);
    return res.status(200).json({ photo: null });
  }
}
