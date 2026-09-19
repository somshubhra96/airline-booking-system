import { useEffect, useState } from 'react'
import './App.css'
import TravelChat from './components/TravelChat'

const fallbackAirports = [
  { city: 'New Delhi', iataCode: 'DEL', name: 'Indira Gandhi International Airport' },
  { city: 'Mumbai', iataCode: 'BOM', name: 'Chhatrapati Shivaji Maharaj International Airport' },
  { city: 'Bengaluru', iataCode: 'BLR', name: 'Kempegowda International Airport' },
]

function PlaneIcon() { return <span className="plane-icon" aria-hidden="true">{'\u2726'}</span> }

const getStoredUser = () => {
  try {
    const user = JSON.parse(localStorage.getItem('aerora_user'))
    return localStorage.getItem('aerora_token') && user?.name ? user : null
  } catch {
    return null
  }
}

const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function App() {
  const [tripType, setTripType] = useState('Round trip')
  const [airports, setAirports] = useState(fallbackAirports)
  const [origin, setOrigin] = useState('DEL')
  const [destination, setDestination] = useState('BOM')
  const [searched, setSearched] = useState(false)
  const [flights, setFlights] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [authMessage, setAuthMessage] = useState('')
  const [authSucceeded, setAuthSucceeded] = useState(false)
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false)
  const [user, setUser] = useState(getStoredUser)

  useEffect(() => {
    const loadAirports = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/airports')
        if (!response.ok) throw new Error('Unable to load airports.')
        const data = await response.json()
        if (data.airports?.length) setAirports(data.airports)
      } catch {
        // The default airports keep the form usable while the server is offline.
      }
    }
    loadAirports()
  }, [])

  const originAirport = airports.find((airport) => airport.iataCode === origin) || fallbackAirports[0]
  const destinationAirport = airports.find((airport) => airport.iataCode === destination) || fallbackAirports[1]
  const swapCities = () => { setOrigin(destination); setDestination(origin) }

  const searchFlights = async () => {
    setSearched(true)
    setIsSearching(true)
    setSearchError('')
    try {
      const response = await fetch(`http://localhost:5000/api/flights?from=${origin}&to=${destination}`)
      if (!response.ok) throw new Error('Unable to load flights.')
      const data = await response.json()
      setFlights(data.flights)
    } catch {
      setFlights([])
      setSearchError('Could not reach the flight service. Make sure the server is running on port 5000.')
    } finally { setIsSearching(false) }
  }

  const openAuth = (mode) => {
    setAuthMode(mode)
    setAuthMessage('')
    setAuthSucceeded(false)
    setIsAuthOpen(true)
  }

  const submitAuth = async (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    if (authMode === 'signup' && formData.get('password') !== formData.get('confirmPassword')) {
      setAuthMessage('Passwords do not match.')
      setAuthSucceeded(false)
      return
    }
    setIsSubmittingAuth(true)
    setAuthMessage('')
    setAuthSucceeded(false)
    try {
      const payload = {
        email: formData.get('email'),
        password: formData.get('password'),
      }
      if (authMode === 'signup') payload.name = formData.get('name')
      const response = await fetch(`http://localhost:5000/api/auth/${authMode === 'login' ? 'login' : 'register'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Authentication failed.')
      localStorage.setItem('aerora_token', data.token)
      localStorage.setItem('aerora_user', JSON.stringify(data.user))
      setUser(data.user)
      setAuthMessage(authMode === 'login' ? `Welcome back, ${data.user.name}!` : `Welcome to Aerora, ${data.user.name}!`)
      setAuthSucceeded(true)
      form.reset()
      setIsAuthOpen(false)
    } catch (error) {
      setAuthMessage(error.message || 'Could not connect to the account service.')
    } finally {
      setIsSubmittingAuth(false)
    }
  }

  const signOut = () => {
    localStorage.removeItem('aerora_token')
    localStorage.removeItem('aerora_user')
    setUser(null)
  }

  const firstName = user?.name?.trim().split(/\s+/)[0]

  return (
    <main>
      <nav className="navbar" aria-label="Main navigation"><a className="brand" href="#top"><PlaneIcon /> aerora</a><div className="nav-links"><a className="active" href="#book">Book a flight</a><a href="#manage">Manage booking</a><a href="#offers">Offers</a></div>{user ? <div className="account-actions"><span className="greeting">{getGreeting()}, {firstName}</span><button className="sign-in" type="button" onClick={signOut}>Sign out <span>{'\u2192'}</span></button></div> : <button className="sign-in" type="button" onClick={() => openAuth('login')}>Sign in <span>{'\u2192'}</span></button>}</nav>
      <section className="hero" id="top"><div className="hero-copy"><p className="eyebrow">YOUR NEXT JOURNEY STARTS HERE</p><h1>See more of the<br /><em>world.</em></h1><p className="hero-text">Thoughtful journeys, seamless connections, and a little more room to dream.</p></div><div className="sky-art" aria-hidden="true"><div className="sun" /><div className="cloud cloud-one" /><div className="cloud cloud-two" /><div className="flight-path" /><div className="aircraft">{'\u2708'}</div></div></section>
      <section className="booking-panel" id="book">
        <div className="trip-tabs" role="group" aria-label="Trip type">{['Round trip', 'One way', 'Multi-city'].map((type) => <button key={type} type="button" className={tripType === type ? 'selected' : ''} onClick={() => setTripType(type)}>{type}</button>)}</div>
        <div className="search-fields">
          <label className="field location-field"><span className="field-label">From</span><select value={origin} onChange={(event) => setOrigin(event.target.value)}>{airports.map((airport) => <option value={airport.iataCode} key={airport.iataCode}>{airport.city} ({airport.iataCode})</option>)}</select><small>{originAirport.name}</small></label>
          <button className="swap" type="button" onClick={swapCities} aria-label="Swap origin and destination">{'\u21c4'}</button>
          <label className="field location-field"><span className="field-label">To</span><select value={destination} onChange={(event) => setDestination(event.target.value)}>{airports.map((airport) => <option value={airport.iataCode} key={airport.iataCode}>{airport.city} ({airport.iataCode})</option>)}</select><small>{destinationAirport.name}</small></label>
          <label className="field date-field"><span className="field-label">Depart</span><input type="date" defaultValue="2026-09-18" /></label><label className="field date-field return-field"><span className="field-label">Return</span><input type="date" defaultValue="2026-09-25" disabled={tripType === 'One way'} /></label>
          <label className="field passenger-field"><span className="field-label">Travellers</span><select defaultValue="1 traveller, Economy"><option>1 traveller, Economy</option><option>2 travellers, Economy</option><option>1 traveller, Business</option></select></label>
          <button className="search-button" type="button" onClick={searchFlights} disabled={isSearching}>{isSearching ? 'Searching...' : <>Search flights <span>{'\u2192'}</span></>}</button>
        </div>
        {searched && <div className="flight-results"><p className="search-note">{flights.length} flight{flights.length === 1 ? '' : 's'} found from {origin} to {destination}.</p>{searchError && <p className="search-error">{searchError}</p>}{flights.map((flight) => <article className="flight-card" key={flight.id}><div><strong>{flight.airline}</strong><small>{flight.flightNumber}</small></div><div className="flight-time"><strong>{flight.departureTime}</strong><span>{flight.from}</span></div><div className="flight-duration"><span>{flight.duration}</span><i /><small>{flight.stops}</small></div><div className="flight-time"><strong>{flight.arrivalTime}</strong><span>{flight.to}</span></div><div className="flight-price"><small>from</small><strong>{'\u20b9'}{flight.price.toLocaleString('en-IN')}</strong></div><button type="button" className="select-flight">Select</button></article>)}</div>}
      </section>
      <section className="experience" id="offers"><div><p className="eyebrow">THE AERORA DIFFERENCE</p><h2>Travel, beautifully considered.</h2></div><p className="experience-copy">From the first search to final arrival, every detail is designed to make travel feel lighter.</p><div className="benefits"><article><span className="benefit-number">01</span><h3>Flexible by design</h3><p>Change plans with ease and keep your journey in your hands.</p></article><article><span className="benefit-number">02</span><h3>Comfort in every class</h3><p>Thoughtful spaces and generous service, wherever you sit.</p></article><article><span className="benefit-number">03</span><h3>Here when you need us</h3><p>Real support from real people, around the clock.</p></article></div></section>
      <TravelChat />
      {isAuthOpen && <div className="auth-backdrop" role="presentation" onMouseDown={() => setIsAuthOpen(false)}><section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title" onMouseDown={(event) => event.stopPropagation()}><button className="close-auth" type="button" aria-label="Close account form" onClick={() => setIsAuthOpen(false)}>×</button><p className="eyebrow">AERORA ACCOUNT</p><h2 id="auth-title">{authMode === 'login' ? 'Welcome back.' : 'Create your account.'}</h2><p className="auth-intro">{authMode === 'login' ? 'Sign in to manage your bookings and saved journeys.' : 'Save your details and make every journey simpler.'}</p><div className="auth-tabs"><button type="button" className={authMode === 'login' ? 'selected' : ''} onClick={() => openAuth('login')}>Sign in</button><button type="button" className={authMode === 'signup' ? 'selected' : ''} onClick={() => openAuth('signup')}>Create account</button></div><form className="auth-form" onSubmit={submitAuth}>{authMode === 'signup' && <label>Full name<input name="name" type="text" placeholder="Your full name" required /></label>}<label>Email address<input name="email" type="email" placeholder="you@example.com" required /></label><label>Password<input name="password" type="password" placeholder="At least 8 characters" minLength="8" required /></label>{authMode === 'signup' && <label>Confirm password<input name="confirmPassword" type="password" placeholder="Repeat your password" minLength="8" required /></label>}<button className="auth-submit" type="submit" disabled={isSubmittingAuth}>{isSubmittingAuth ? 'Please wait...' : <>{authMode === 'login' ? 'Sign in to Aerora' : 'Create account'} <span>{'\u2192'}</span></>}</button>{authMessage && <p className={authSucceeded ? 'auth-success' : 'auth-error'}>{authMessage}</p>}</form>{authMode === 'login' ? <p className="auth-switch">New to Aerora? <button type="button" onClick={() => openAuth('signup')}>Create an account</button></p> : <p className="auth-switch">Already have an account? <button type="button" onClick={() => openAuth('login')}>Sign in</button></p>}</section></div>}
    </main>
  )
}

export default App
