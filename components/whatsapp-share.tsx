'use client'

type Props = {
  name: string
  sign: string
}

export function WhatsAppShare({ name, sign }: Props) {
  const share = () => {
    const text = `${name} discovered their zodiac sign is ${sign} 🔮`
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  return (
    <button
      onClick={share}
      className="bg-green-500 text-black px-4 py-2 rounded-xl"
    >
      Share on WhatsApp
    </button>
  )
}
