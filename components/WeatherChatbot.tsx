'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, MessageCircle, X, Loader2 } from 'lucide-react'
import { WeatherData } from '@/types/weather'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface WeatherChatbotProps {
  weatherData: WeatherData | null
  unit: 'C' | 'F'
  windSpeedUnit: 'kmh' | 'mph'
}

export default function WeatherChatbot({ weatherData, unit, windSpeedUnit }: WeatherChatbotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '👋 Hi! I\'m your weather assistant. Ask me anything about the current weather or forecast!',
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  type Choice = { name: string; admin1?: string; country?: string; latitude: number; longitude: number }
  const [pendingChoices, setPendingChoices] = useState<Choice[] | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      // Prepare weather data with descriptions
      const enrichedWeatherData = weatherData
        ? {
            ...weatherData,
            current: {
              ...weatherData.current,
              description: getWeatherDescription(weatherData.current.weatherCode),
            },
            daily: {
              ...weatherData.daily,
              description: weatherData.daily.weatherCode.map((code: number) =>
                getWeatherDescription(code)
              ),
            },
          }
        : null

      // If user responds with a number while choices are pending, map to selection
      if (pendingChoices) {
        const idx = Number(userMessage)
        if (!Number.isNaN(idx) && idx >= 1 && idx <= pendingChoices.length) {
          const selected = pendingChoices[idx - 1]
          const resp = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: `Selected ${selected.name}`,
              selected,
              prefs: { unit, windSpeedUnit },
            }),
          })
          const dataSel = await resp.json()
          if (resp.ok) {
            setMessages((prev) => [...prev, { role: 'assistant', content: dataSel.reply }])
            setPendingChoices(null)
          } else {
            const errorMsg = dataSel.error || 'Sorry, I encountered an error.'
            setMessages((prev) => [...prev, { role: 'assistant', content: `❌ ${errorMsg}` }])
          }
          return
        }
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          weatherData: enrichedWeatherData,
          prefs: { unit, windSpeedUnit },
        }),
      })

      const data = await response.json()

      if (response.ok) {
        if (data.prompt === 'choose_city' && Array.isArray(data.choices)) {
          setPendingChoices(data.choices)
          const list = data.choices
            .map((c: Choice, i: number) => `${i + 1}. ${c.name}${c.admin1 ? `, ${c.admin1}` : ''}${c.country ? `, ${c.country}` : ''}`)
            .join('\n')
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: `${data.message}\n\n${list}` },
          ])
        } else {
          setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }])
        }
      } else {
        // Show the actual error message from the API
        const errorMsg = data.error || 'Sorry, I encountered an error. Please try again.'
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `❌ ${errorMsg}`,
          },
        ])
        console.error('API Error:', data)
      }
    } catch (error) {
      console.error('Connection error:', error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '❌ Failed to connect. Please check your connection and try again.',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Simple weather code to description mapping
  const getWeatherDescription = (code: number): string => {
    const descriptions: Record<number, string> = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Foggy',
      48: 'Depositing rime fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      71: 'Slight snow',
      73: 'Moderate snow',
      75: 'Heavy snow',
      80: 'Slight rain showers',
      81: 'Moderate rain showers',
      82: 'Violent rain showers',
      95: 'Thunderstorm',
    }
    return descriptions[code] || 'Unknown'
  }

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 shadow-2xl transition-all duration-200 hover:scale-110 z-50"
          aria-label="Open weather chat"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <h3 className="font-semibold">Weather Assistant</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 rounded-full p-1 transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    msg.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {pendingChoices && (
              <div className="mt-2 grid grid-cols-1 gap-2">
                {pendingChoices.map((c, i) => (
                  <button
                    key={`${c.name}-${i}`}
                    onClick={async () => {
                      if (isLoading) return
                      setIsLoading(true)
                      try {
                        const resp = await fetch('/api/chat', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            message: `Selected ${c.name}`,
                            selected: c,
                            prefs: { unit, windSpeedUnit },
                          }),
                        })
                        const dataSel = await resp.json()
                        if (resp.ok) {
                          setMessages((prev) => [
                            ...prev,
                            { role: 'assistant', content: dataSel.reply },
                          ])
                          setPendingChoices(null)
                        } else {
                          const errorMsg = dataSel.error || 'Sorry, I encountered an error.'
                          setMessages((prev) => [...prev, { role: 'assistant', content: `❌ ${errorMsg}` }])
                        }
                      } finally {
                        setIsLoading(false)
                      }
                    }}
                    className="justify-self-start text-left text-sm bg-blue-100 hover:bg-blue-200 text-blue-900 rounded-lg px-3 py-2"
                  >
                    {i + 1}. {c.name}{c.admin1 ? `, ${c.admin1}` : ''}{c.country ? `, ${c.country}` : ''}
                  </button>
                ))}
              </div>
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl px-4 py-2">
                  <Loader2 className="w-5 h-5 text-gray-600 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about the weather..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-full p-2 transition-colors"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
