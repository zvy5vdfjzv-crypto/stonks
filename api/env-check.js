// 🔍 Diagnostic: mostra quais env vars estao disponiveis (so NOMES, nunca VALORES)
// Rota: /api/env-check
// Util pra debugar quando env var nao aparece.
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 'no-store')
  const keys = Object.keys(process.env)
  const stonksKeys = keys.filter(k =>
    k.startsWith('ELEVENLABS') ||
    k.startsWith('VITE_SUPABASE') ||
    k.startsWith('YOUTUBE') ||
    k === 'NODE_ENV' ||
    k === 'VERCEL' ||
    k === 'VERCEL_ENV' ||
    k === 'VERCEL_REGION'
  )
  const env = {}
  stonksKeys.forEach(k => {
    env[k] = process.env[k] ? `✓ defined (${process.env[k].length} chars)` : '✗ undefined'
  })
  res.status(200).json({
    checked_at: new Date().toISOString(),
    vercel_env: process.env.VERCEL_ENV || 'unknown',
    relevant_vars: env,
    total_env_count: keys.length,
  })
}
