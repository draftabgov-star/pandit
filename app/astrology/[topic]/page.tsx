export async function generateStaticParams() {
  return [
    { topic: 'love-breakup' }, { topic: 'cheating-signs' }, { topic: 'marriage-compatibility' },
    { topic: 'career-success' }, { topic: 'money-wealth' }, { topic: 'health-problems' },
    { topic: 'enemy-detection' }, { topic: 'property-dispute' }, { topic: 'child-future' },
  ]
}

export async function generateMetadata({ params }: { params: { topic: string } }) {
  const t = params.topic.replace(/-/g, ' ')
  return {
    title: `${t} — AI Astrology Reading | OnlyPandit`,
    description: `Discover ${t} through Vedic astrology. Free AI-powered prediction.`,
  }
}

export default function TopicPage({ params }: { params: { topic: string } }) {
  const t = params.topic.replace(/-/g, ' ')
  return (
    <main className="min-h-screen bg-[#030305] text-white p-8 max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold capitalize mb-4">{t}</h1>
      <p className="text-gray-400 mb-8">AI astrology insights on {t}. Get your personalized reading.</p>
      <a href="/dashboard" className="bg-amber-500 text-black font-bold py-3 px-6 rounded-xl">Get Reading →</a>
    </main>
  )
}
