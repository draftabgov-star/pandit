// After reading is generated:
fetch('/api/event', { 
  method: 'POST', 
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ type: 'reading_generated', data: { sign: result.sign } }) 
})

// After email is submitted:
fetch('/api/event', { 
  method: 'POST', 
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ type: 'email_captured', data: { email } }) 
})
