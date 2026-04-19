// 🎙️ ElevenLabs TTS proxy — gera audio de voz a partir de texto
// API key fica SERVER-SIDE (nunca expor no client)
// User precisa configurar ELEVENLABS_API_KEY em Vercel env vars

export default async function handler(req, res) {
  const { text, voice_id, lang = 'pt' } = req.query || {}

  if (!text) {
    res.status(400).json({ error: 'text param required' })
    return
  }

  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) {
    res.status(503).json({ error: 'ELEVENLABS_API_KEY not configured' })
    return
  }

  // Voice IDs populares ElevenLabs (podem ser customizados via param voice_id):
  // Rachel (EN) - 21m00Tcm4TlvDq8ikWAM
  // Antoni (EN) - ErXwobaYiN019PkySvjV
  // Bella (EN) - EXAVITQu4vr4xnSDxMaL
  // Pra PT-BR: uso voice id 'Brian' que tem multilingual support
  const DEFAULT_VOICES = {
    pt: 'nPczCjzI2devNBz1zQrb', // Brian multilingual
    en: 'EXAVITQu4vr4xnSDxMaL', // Bella
    es: 'nPczCjzI2devNBz1zQrb', // Brian multilingual
    fr: 'nPczCjzI2devNBz1zQrb',
    de: 'nPczCjzI2devNBz1zQrb',
    it: 'nPczCjzI2devNBz1zQrb',
    ja: 'nPczCjzI2devNBz1zQrb',
    zh: 'nPczCjzI2devNBz1zQrb',
  }

  const finalVoice = voice_id || DEFAULT_VOICES[lang] || DEFAULT_VOICES.pt
  const safeText = String(text).slice(0, 300) // limita pra evitar abuso de quota

  try {
    const r = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${finalVoice}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text: safeText,
          model_id: 'eleven_multilingual_v2', // suporta 29 linguas
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.7,
            style: 0.3,
            use_speaker_boost: true,
          },
        }),
      }
    )

    if (!r.ok) {
      const body = await r.text()
      res.status(r.status).json({ error: 'elevenlabs error', detail: body.slice(0, 200) })
      return
    }

    const audioBuffer = await r.arrayBuffer()
    res.setHeader('Content-Type', 'audio/mpeg')
    res.setHeader('Cache-Control', 'public, max-age=3600') // cache 1h (mesmo texto = mesmo audio)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.status(200).send(Buffer.from(audioBuffer))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
