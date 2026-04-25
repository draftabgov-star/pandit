export async function generateStaticParams() {
  return [
    { sign: 'aries' }, { sign: 'taurus' }, { sign: 'gemini' },
    { sign: 'cancer' }, { sign: 'leo' }, { sign: 'virgo' },
    { sign: 'libra' }, { sign: 'scorpio' }, { sign: 'sagittarius' },
    { sign: 'capricorn' }, { sign: 'aquarius' }, { sign: 'pisces' },
  ]
}

export async function generateMetadata({ params }: { params: { sign: string } }) {
  const s = params.sign.charAt(0).toUpperCase() + params.sign.slice(1)
  return {
    title: `${s} Kundli 2026 — Free Horoscope & Astrology Predictions | OnlyPandit`,
    description: `Free ${s} kundli analysis, daily horoscope, and Vedic astrology predictions. Get your personalized ${s} birth chart reading online.`,
    keywords: `${s} kundli, ${s} horoscope, ${s} astrology, ${s} rashifal, ${s} love prediction, ${s} career, online ${s} pandit`,
  }
}

const content: Record<string, { planet: string; traits: string; love: string; career: string; health: string }> = {
  aries: { planet: 'Mars', traits: 'Bold, ambitious, passionate', love: 'Aries lovers are intense and direct. 2026 brings a fated encounter in March.', career: 'Leadership roles open up. Avoid impulsive decisions in Q2.', health: 'Channel energy into sports. Watch your temper.' },
  taurus: { planet: 'Venus', traits: 'Loyal, sensual, stubborn', love: 'Taurus seeks stability. A past connection may resurface.', career: 'Financial growth is steady. Real estate favors you.', health: 'Throat and neck need attention. Try neck yoga.' },
  gemini: { planet: 'Mercury', traits: 'Curious, witty, dual-natured', love: 'Communication is your superpower. A witty match appears.', career: 'Media, writing, or tech brings success.', health: 'Nervous system needs calming. Meditation helps.' },
  cancer: { planet: 'Moon', traits: 'Emotional, nurturing, protective', love: 'Deep emotional bonds form. Family introductions likely.', career: 'Caregiving or food industries prosper.', health: 'Stomach and digestion. Eat warm foods.' },
  leo: { planet: 'Sun', traits: 'Confident, dramatic, generous', love: 'You attract attention effortlessly. A fire sign matches.', career: 'Creative projects shine. Ask for that raise.', health: 'Heart and spine. Back-bending yoga is ideal.' },
  virgo: { planet: 'Mercury', traits: 'Analytical, helpful, perfectionist', love: 'Practical love blooms. Someone notices your details.', career: 'Healthcare or analytics fields reward you.', health: 'Gut health is key. Avoid processed sugar.' },
  libra: { planet: 'Venus', traits: 'Charming, balanced, indecisive', love: 'Partnership is your theme. A proposal or commitment nears.', career: 'Law, design, or diplomacy suits you.', health: 'Kidneys and skin. Hydrate constantly.' },
  scorpio: { planet: 'Pluto', traits: 'Intense, secretive, magnetic', love: 'Transformation through love. A secret admirer reveals.', career: 'Research, finance, or occult fields thrive.', health: 'Reproductive health. Deep breathing exercises.' },
  sagittarius: { planet: 'Jupiter', traits: 'Adventurous, honest, blunt', love: 'A foreign or distant connection sparks.', career: 'Travel, teaching, or publishing expands.', health: 'Hips and thighs. Stretch daily.' },
  capricorn: { planet: 'Saturn', traits: 'Disciplined, ambitious, reserved', love: 'Slow and steady wins. A mature partner arrives.', career: 'Promotion after hard work. Real estate gains.', health: 'Knees and bones. Calcium-rich diet.' },
  aquarius: { planet: 'Saturn', traits: 'Innovative, detached, humanitarian', love: 'Unconventional love story. Friendship turns romantic.', career: 'Tech, AI, or social causes reward you.', health: 'Circulation. Leg elevation and walks.' },
  pisces: { planet: 'Jupiter', traits: 'Dreamy, artistic, empathetic', love: 'Soulmate connection deepens. Trust your intuition.', career: 'Arts, healing, or spiritual work calls.', health: 'Feet and lymphatic system. Foot soaks help.' },
}

export default function SignPage({ params }: { params: { sign: string } }) {
  const sign = params.sign
  const s = sign.charAt(0).toUpperCase() + sign.slice(1)
  const c = content[sign] || content.aries

  return (
    <main className="min-h-screen bg-[#030305] text-white p-6 md:p-12 max-w-3xl mx-auto">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          { "@type": "Question", "name": `What is ${s} kundli?`, "acceptedAnswer": { "@type": "Answer", "text": `${s} kundli is a Vedic birth chart analyzing planetary positions at birth to reveal destiny patterns.` } },
          { "@type": "Question", "name": `Is ${s} lucky in 2026?`, "acceptedAnswer": { "@type": "Answer", "text": `Our AI astrologer reveals personalized ${s} predictions for love, career, and health in 2026.` } },
          { "@type": "Question", "name": `Who is ${s} compatible with?`, "acceptedAnswer": { "@type": "Answer", "text": `${s} is most compatible with signs that complement their ${c.traits.toLowerCase()} nature.` } }
        ]
      })}} />

      <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent mb-4 capitalize">
        {s} Kundli & Horoscope 2026
      </h1>
      <p className="text-gray-400 text-lg mb-8">
        Free {s} astrology reading. Discover your 2026 predictions for love, career, money, and health. Ruled by <strong className="text-amber-400">{c.planet}</strong>.
      </p>

      <div className="grid gap-6 mb-10">
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
          <h2 className="text-amber-400 font-bold text-lg mb-2">♥ Love & Relationships</h2>
          <p className="text-gray-300 leading-relaxed">{c.love}</p>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
          <h2 className="text-amber-400 font-bold text-lg mb-2">💼 Career & Money</h2>
          <p className="text-gray-300 leading-relaxed">{c.career}</p>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
          <h2 className="text-amber-400 font-bold text-lg mb-2">🧘 Health & Wellness</h2>
          <p className="text-gray-300 leading-relaxed">{c.health}</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-8 text-center">
        <h3 className="text-2xl font-bold mb-2">Want Your Personalized {s} Reading?</h3>
        <p className="text-gray-400 mb-6">Our AI Pandit analyzes your exact birth chart — not just your sun sign.</p>
        <a href="/dashboard" className="inline-block bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold py-4 px-8 rounded-xl hover:scale-105 transition-transform">
          Get My {s} Kundli →
        </a>
      </div>

      <div className="mt-12 text-sm text-gray-600">
        <p>Related: <a href="/kundli/aries" className="text-gray-500 hover:text-amber-400">Aries</a> · <a href="/kundli/taurus" className="text-gray-500 hover:text-amber-400">Taurus</a> · <a href="/kundli/gemini" className="text-gray-500 hover:text-amber-400">Gemini</a> · <a href="/kundli/cancer" className="text-gray-500 hover:text-amber-400">Cancer</a> · <a href="/kundli/leo" className="text-gray-500 hover:text-amber-400">Leo</a> · <a href="/kundli/virgo" className="text-gray-500 hover:text-amber-400">Virgo</a> · <a href="/kundli/libra" className="text-gray-500 hover:text-amber-400">Libra</a> · <a href="/kundli/scorpio" className="text-gray-500 hover:text-amber-400">Scorpio</a> · <a href="/kundli/sagittarius" className="text-gray-500 hover:text-amber-400">Sagittarius</a> · <a href="/kundli/capricorn" className="text-gray-500 hover:text-amber-400">Capricorn</a> · <a href="/kundli/aquarius" className="text-gray-500 hover:text-amber-400">Aquarius</a> · <a href="/kundli/pisces" className="text-gray-500 hover:text-amber-400">Pisces</a></p>
      </div>
    </main>
  )
}
