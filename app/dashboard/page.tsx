'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
// ... other imports

export default function Dashboard() {
  const searchParams = useSearchParams()
  const paid = searchParams.get('paid') === 'success'
  const [unlocked, setUnlocked] = useState(false)
  
  // Auto-unlock if returning from successful payment
  useEffect(() => {
    if (paid) setUnlocked(true)
  }, [paid])
  
  // ... rest of your component
}
