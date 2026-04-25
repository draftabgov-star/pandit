export default function sitemap() {
  const base = 'https://pandit-ten.vercel.app'
  const signs = ['aries','taurus','gemini','cancer','leo','virgo','libra','scorpio','sagittarius','capricorn','aquarius','pisces']
  
  const signPages = signs.map(sign => ({
    url: `${base}/kundli/${sign}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))

  const dates = []
  for (let m = 1; m <= 12; m++) {
    for (let d = 1; d <= 28; d++) {
      dates.push(`2026-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`)
    }
  }
  
  const datePages = dates.map(date => ({
    url: `${base}/horoscope/${date}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  return [
    { url: base, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${base}/dashboard`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    ...signPages,
    ...datePages,
  ]
}
