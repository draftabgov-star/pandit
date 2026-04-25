const [email, setEmail] = useState('')
// ...
{result && !email ? (
  <EmailGate onSubmit={(e) => setEmail(e)} />
) : (
  // show result
)}
