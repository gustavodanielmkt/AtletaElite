export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, instructions } = req.body;

  if (!name && (!instructions || !instructions.length)) {
    return res.status(400).json({ error: 'Missing name or instructions' });
  }

  const apiKey = (process.env.GEMINI_API_KEY || '').trim();

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    console.error('[translate] No valid GEMINI_API_KEY configured');
    return res.status(200).json({
      translatedName: name || '',
      translatedInstructions: instructions || [],
      _error: 'no_api_key',
    });
  }

  try {
    const prompt = buildPrompt(name, instructions);

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errBody = await geminiRes.text();
      console.error('[translate] Gemini API error:', geminiRes.status, errBody);
      return res.status(200).json({
        translatedName: name || '',
        translatedInstructions: instructions || [],
        _error: `gemini_${geminiRes.status}`,
      });
    }

    const geminiData = await geminiRes.json();
    const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Parse the JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[translate] Could not parse Gemini response:', text);
      return res.status(200).json({
        translatedName: name || '',
        translatedInstructions: instructions || [],
        _error: 'parse_error',
      });
    }

    const result = JSON.parse(jsonMatch[0]);

    // Validate
    if (result.translatedName && result.translatedName.length > 200) {
      result.translatedName = name;
    }

    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.status(200).json({
      translatedName: result.translatedName || name || '',
      translatedInstructions: Array.isArray(result.translatedInstructions)
        ? result.translatedInstructions
        : instructions || [],
    });
  } catch (err) {
    console.error('[translate] Error:', err.message || err);
    return res.status(200).json({
      translatedName: name || '',
      translatedInstructions: instructions || [],
      _error: 'exception',
    });
  }
}

function buildPrompt(name, instructions) {
  const parts = [];

  parts.push(
    'Você é um tradutor especializado em exercícios físicos e fitness. ' +
    'Traduza do inglês para o português brasileiro (pt-BR). ' +
    'Use terminologia técnica de educação física e fisioterapia.\n\n' +
    'Responda APENAS com um JSON válido no formato especificado, sem markdown, sem ```.\n\n'
  );

  if (name) {
    parts.push(
      `Nome do exercício em inglês: "${name}"\n` +
      'Traduza o nome para português. Exemplos:\n' +
      '- "Barbell Squat" → "Agachamento com Barra"\n' +
      '- "Bench Press" → "Supino Reto"\n' +
      '- "Deadlift" → "Levantamento Terra"\n' +
      '- "Pull Up" → "Barra Fixa"\n' +
      '- "Dumbbell Curl" → "Rosca com Haltere"\n' +
      '- "Jack Burpee" → "Burpee com Polichinelo"\n\n'
    );
  }

  if (instructions && instructions.length > 0) {
    parts.push(
      'Instruções em inglês para traduzir:\n' +
      instructions.map((instr, i) => `${i + 1}. ${instr}`).join('\n') + '\n\n'
    );
  }

  parts.push(
    'Responda com este JSON exato (sem markdown):\n' +
    '{\n' +
    (name ? '  "translatedName": "nome traduzido em português",\n' : '') +
    (instructions && instructions.length > 0
      ? '  "translatedInstructions": ["instrução 1 traduzida", "instrução 2 traduzida"]\n'
      : '') +
    '}'
  );

  return parts.join('');
}
