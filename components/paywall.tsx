<button 
  onClick={async () => {
    const res = await fetch('/api/payment/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 4.99, reportId: 'temp' }),
    })
    const data = await res.json()
    if (data.paymentUrl) window.location.href = data.paymentUrl
  }}
  className="bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold py-3 px-8 rounded-xl"
>
  Unlock Full Reading — $4.99
</button>
