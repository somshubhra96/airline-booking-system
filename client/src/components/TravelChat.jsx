import { useState } from 'react'

const initialMessages = [
  { role: 'bot', text: 'Hi, I am Sky, your Aerora travel assistant. How can I help with your journey?' },
]

function TravelChat() {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState(initialMessages)

  const sendChatMessage = (event) => {
    event.preventDefault()
    const message = chatInput.trim()
    if (!message) return

    const question = message.toLowerCase()
    let reply = 'I can help with flights, bookings, baggage, check-in, and account questions. Could you share a little more?'
    if (question.includes('baggage') || question.includes('luggage')) reply = 'For most Aerora economy fares, one cabin bag and one checked bag are included. Your final allowance will appear on the booking confirmation.'
    if (question.includes('cancel') || question.includes('change')) reply = 'You can change or cancel eligible bookings from Manage booking. Fees and fare differences may apply depending on your fare type.'
    if (question.includes('check') || question.includes('boarding')) reply = 'Online check-in opens 48 hours before departure and closes 60 minutes before domestic flights.'
    if (question.includes('book') || question.includes('flight') || question.includes('search')) reply = 'Use the flight search above to choose your route and dates. Once you find a suitable flight, select it to continue.'
    if (question.includes('hello') || question.includes('hi ')) reply = 'Hello! Where would you like to fly today?'

    setChatMessages((messages) => [...messages, { role: 'user', text: message }, { role: 'bot', text: reply }])
    setChatInput('')
  }

  return <>
    <button className="chat-toggle" type="button" onClick={() => setIsChatOpen((open) => !open)} aria-expanded={isChatOpen} aria-controls="travel-chat">{isChatOpen ? '×' : '✦'} <span>{isChatOpen ? 'Close' : 'Need help?'}</span></button>
    {isChatOpen && <section className="chat-widget" id="travel-chat" aria-label="Aerora travel assistant"><header><div><span className="chat-avatar">✦</span><div><strong>Sky from Aerora</strong><small>Typically replies instantly</small></div></div><button type="button" onClick={() => setIsChatOpen(false)} aria-label="Close chat">×</button></header><div className="chat-messages">{chatMessages.map((message, index) => <p className={message.role} key={`${message.role}-${index}`}>{message.text}</p>)}</div><div className="chat-prompts"><button type="button" onClick={() => setChatInput('What is the baggage allowance?')}>Baggage allowance</button><button type="button" onClick={() => setChatInput('How can I change a booking?')}>Change a booking</button></div><form onSubmit={sendChatMessage}><input value={chatInput} onChange={(event) => setChatInput(event.target.value)} placeholder="Ask Sky a question..." aria-label="Chat message" /><button type="submit" aria-label="Send message">{'\u2192'}</button></form></section>}
  </>
}

export default TravelChat
