// 🌍 Geo detection via Vercel Edge headers
// Vercel injeta x-vercel-ip-country (ISO 3166-1 alpha-2) em toda request.
// Fallback: ipapi.co se user nao estiver atras do Vercel (improvavel em producao).

const COUNTRY_TO_LANG = {
  // Portugues
  BR: 'pt', PT: 'pt', AO: 'pt', MZ: 'pt', CV: 'pt',
  // English (primary)
  US: 'en', GB: 'en', CA: 'en', AU: 'en', NZ: 'en', IE: 'en', IN: 'en',
  ZA: 'en', NG: 'en', KE: 'en', GH: 'en', PH: 'en', SG: 'en', MY: 'en',
  // Espanol
  ES: 'es', MX: 'es', AR: 'es', CL: 'es', CO: 'es', PE: 'es', VE: 'es',
  UY: 'es', PY: 'es', EC: 'es', BO: 'es', CR: 'es', PA: 'es', CU: 'es',
  DO: 'es', GT: 'es', HN: 'es', SV: 'es', NI: 'es',
  // Francais
  FR: 'fr', BE: 'fr', LU: 'fr', MC: 'fr', CD: 'fr', CI: 'fr', SN: 'fr',
  ML: 'fr', CM: 'fr', MG: 'fr', BF: 'fr', NE: 'fr', TG: 'fr', BJ: 'fr',
  GN: 'fr', TD: 'fr', RW: 'fr', BI: 'fr', HT: 'fr',
  // Deutsch
  DE: 'de', AT: 'de', LI: 'de',
  // Italiano
  IT: 'it', SM: 'it', VA: 'it',
  // Japones
  JP: 'ja',
  // Chines
  CN: 'zh', TW: 'zh', HK: 'zh', MO: 'zh',
  // Suica (multiple, default DE)
  CH: 'de',
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 'public, max-age=3600') // 1h cache

  // Vercel injeta esses headers automaticamente em prod
  const country = (
    req.headers['x-vercel-ip-country'] ||
    req.headers['cf-ipcountry'] || // Cloudflare compat
    ''
  ).toUpperCase()

  const language = COUNTRY_TO_LANG[country] || 'en' // default EN global

  const city = req.headers['x-vercel-ip-city']
    ? decodeURIComponent(req.headers['x-vercel-ip-city'])
    : null
  const region = req.headers['x-vercel-ip-country-region']
    ? decodeURIComponent(req.headers['x-vercel-ip-country-region'])
    : null

  res.status(200).json({
    country: country || 'UNKNOWN',
    language,
    city,
    region,
  })
}
