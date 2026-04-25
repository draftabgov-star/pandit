export const metadata = {
  title: 'Pandit AI - Vedic Astrology & Kundli Predictions Online',
  description: 'Get instant AI-powered Vedic astrology predictions, daily horoscope, kundli analysis, and birth chart insights from Pandit AI. Accurate zodiac readings.',
  keywords: 'pandit, vedic astrology, kundli, horoscope, zodiac, birth chart, astrology predictions, daily horoscope, online pandit, jyotish, rashi',
  openGraph: {
    title: 'Pandit AI - Vedic Astrology Predictions',
    description: 'AI-powered astrology and kundli analysis',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white antialiased min-h-screen">{children}</body>
    </html>
  )
}
