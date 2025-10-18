import { NextRequest, NextResponse } from 'next/server'

// Ensure this route runs on the Node.js runtime (not Edge) so OpenAI SDK works reliably in serverless
export const runtime = 'nodejs'
// Avoid caching responses for correctness
export const dynamic = 'force-dynamic'
import OpenAI from 'openai'

const GEOCODING_API = 'https://geocoding-api.open-meteo.com/v1/search'
const WEATHER_API = 'https://api.open-meteo.com/v1/forecast'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

type GeoResult = { name: string; country: string; admin1?: string; latitude: number; longitude: number }
function dedupeGeo(results: GeoResult[]): GeoResult[] {
  const seen = new Set<string>()
  const out: GeoResult[] = []
  for (const r of results) {
    const key1 = `${r.name.toLowerCase()}|${(r.admin1 || '').toLowerCase()}|${r.country.toLowerCase()}`
    const key2 = `${Math.round(r.latitude * 100) / 100}|${Math.round(r.longitude * 100) / 100}` // ~1km cells
    const key = key1 + '|' + key2
    if (!seen.has(key)) {
      seen.add(key)
      out.push(r)
    }
  }
  return out
}

function extractLocationFromMessage(message: string): { city: string; country?: string } | null {
  const original = message.trim()
  const lower = original.toLowerCase()

  // Helper to build result ensuring city present and optional country
  const build = (cityRaw: string, countryRaw?: string) => {
    const city = cityRaw.trim().replace(/^[,\s]+|[,\s]+$/g, '')
    const country = countryRaw?.trim().replace(/^[,\s]+|[,\s]+$/g, '')
    return city ? { city, country: country || undefined } : null
  }

  // Pattern 1: "in/for/at <city>[, <country>]"
  const m1 = lower.match(/(?:\bin|\bfor|\bat)\s+([^?!.]+)$/)
  if (m1 && m1[1]) {
    const raw = original.substring(lower.indexOf(m1[1]), lower.indexOf(m1[1]) + m1[1].length)
    const [cityPart, countryPart] = raw.split(',')
    const res = build(cityPart || raw, countryPart)
    if (res) return res
  }

  // Pattern 2: "<city>, <country>" anywhere in the message
  const m2 = lower.match(/([a-z\s.'-]{2,})\s*,\s*([a-z\s.'-]{2,})/)
  if (m2 && m2[1] && m2[2]) {
    // Use original casing slice
    const start = lower.indexOf(m2[0])
    const raw = start >= 0 ? original.substring(start, start + m2[0].length) : m2[0]
    const [cityPart, countryPart] = raw.split(',')
    const res = build(cityPart, countryPart)
    if (res) return res
  }

  // Pattern 3: short messages treated as a city query
  if (original.length <= 40) return build(original) as any
  return null
}

async function geocodeCity(query: string) {
  const res = await fetch(
    `${GEOCODING_API}?name=${encodeURIComponent(query)}&count=1&language=en&format=json`
  )
  if (!res.ok) throw new Error('Failed to geocode location')
  const data = await res.json()
  if (!data.results || data.results.length === 0) return null
  const r = data.results[0]
  return {
    name: r.name as string,
    country: r.country as string,
    latitude: r.latitude as number,
    longitude: r.longitude as number,
  }
}

async function fetchWeather(lat: number, lon: number) {
  const url = `${WEATHER_API}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&forecast_days=6`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch weather data')
  return res.json()
}

function weatherCodeDescription(code: number): string {
  const map: Record<number, string> = {
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
  return map[code] || 'Unknown conditions'
}

export async function POST(req: NextRequest) {
  try {
    const { message, weatherData, selected, prefs } = await req.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
    }

    // If the client passed a selected location (from a prior disambiguation), fetch directly
    if (selected && selected.latitude && selected.longitude && selected.name) {
      try {
        const data = await fetchWeather(Number(selected.latitude), Number(selected.longitude))
        const currentDesc = weatherCodeDescription(data.current.weather_code)
        // Unit conversions based on prefs
        const toF = (c: number) => Math.round((c * 9) / 5 + 32)
        const toMph = (k: number) => Math.round(k * 0.621371)
        const tempC = Math.round(data.current.temperature_2m)
        const windKmh = Math.round(data.current.wind_speed_10m)
        const tempStr = prefs?.unit === 'F' ? `${toF(tempC)}°F` : `${tempC}°C`
        const windStr = prefs?.windSpeedUnit === 'mph' ? `${toMph(windKmh)} mph` : `${windKmh} km/h`

        // Simple weekly outlook summary (most frequent description)
        const nextDescs = (data.daily.weather_code || [])
          .slice(1, 6)
          .map((code: number) => weatherCodeDescription(code))
        const freq: Record<string, number> = {}
        let top = 'mixed conditions'
        let topCount = 0
        for (const d of nextDescs) {
          freq[d] = (freq[d] || 0) + 1
          if (freq[d] > topCount) {
            top = d.toLowerCase()
            topCount = freq[d]
          }
        }

        const place = `${selected.name}${selected.admin1 ? `, ${selected.admin1}` : ''}${selected.country ? `, ${selected.country}` : ''}`
        const reply = `Right now in ${place}, it's ${currentDesc.toLowerCase()} around ${tempStr} with winds near ${windStr}. Looking ahead, the next few days look mostly ${top}.`
        return NextResponse.json({ reply })
      } catch (e: any) {
        return NextResponse.json({ error: 'Failed to fetch selected location weather' }, { status: 500 })
      }
    }

    // Try to detect a city in the message and fetch live weather for it
    let serverCityContext: string | null = null
    const detected = extractLocationFromMessage(message || '')
    if (detected) {
      try {
        // Get up to 5 results
        const res = await fetch(`${GEOCODING_API}?name=${encodeURIComponent(detected.city)}&count=5&language=en&format=json`)
        if (!res.ok) throw new Error('Failed to geocode location')
        const dataGeo = await res.json()
        let results: GeoResult[] = (dataGeo?.results || [])
          .map((r: any) => ({
            name: r.name as string,
            country: r.country as string,
            admin1: r.admin1 as string | undefined,
            latitude: r.latitude as number,
            longitude: r.longitude as number,
          }))
        results = dedupeGeo(results)
        // If the user specified a country, filter results to that country/admin1
        if (detected.country) {
          const norm = (s: string) => s.toLowerCase().trim()
          const countryToken = norm(detected.country)
          const filtered = results.filter(
            (r: any) => norm(r.country) === countryToken || norm(r.admin1 || '').includes(countryToken)
          )
          if (filtered.length > 0) {
            results = filtered
          } else {
            // No exact matches in the requested country; present choices rather than auto-correcting
            return NextResponse.json({
              prompt: 'choose_city',
              choices: results.slice(0, 5),
              message: `I couldn't find matches in "${detected.country}" for "${detected.city}". Here are the closest matches I found. Please pick 1-${Math.min(results.length,5)} or tap a button:`,
            })
          }
        } else {
          // Infer country token from the tail of the phrase like "bangkok indonesia" or "san juan puerto rico"
          const norm = (s: string) => s.toLowerCase().trim()
          const parts = detected.city.split(/\s+/)
          if (parts.length >= 2) {
            const lastTwo = norm(parts.slice(-2).join(' '))
            const byLastTwo = results.filter(r => norm(r.country).includes(lastTwo))
            if (byLastTwo.length > 0) {
              results = byLastTwo
            } else {
              const lastOne = norm(parts[parts.length - 1])
              const byLastOne = results.filter(r => norm(r.country).includes(lastOne))
              if (byLastOne.length > 0) {
                results = byLastOne
              }
            }
          }
        }
        if (results.length > 1) {
          // Ask client to choose
          return NextResponse.json({
            prompt: 'choose_city',
            choices: results.slice(0, 5),
            message: `I found a few places that match "${detected.city}${detected.country ? ', ' + detected.country : ''}" 😊\nPlease pick one by replying with 1-${Math.min(results.length,5)}, or tap a button below:`,
          })
        }
        const geo = results[0]
        if (geo) {
          // If a country was specified but the single match is a different country, ask the user to confirm instead of auto-answering
          const norm = (s: string) => s.toLowerCase().trim()
          if (detected.country && norm(geo.country) !== norm(detected.country)) {
            return NextResponse.json({
              prompt: 'choose_city',
              choices: [geo],
              message: `I couldn't find an exact match in "${detected.country}". Would you like the weather for ${geo.name}${geo.admin1 ? `, ${geo.admin1}` : ''}, ${geo.country}? Reply 1 to confirm or refine the city/country.`,
            })
          }
          const data = await fetchWeather(geo.latitude, geo.longitude)
          const currentDesc = weatherCodeDescription(data.current.weather_code)
          const forecastLines = (data.daily.time || [])
            .slice(1, 6)
            .map((date: string, i: number) => {
              const d = data.daily.weather_code?.[i + 1]
              const desc = weatherCodeDescription(d)
              const tmax = Math.round(data.daily.temperature_2m_max?.[i + 1])
              const tmin = Math.round(data.daily.temperature_2m_min?.[i + 1])
              return `- ${date}: High ${tmax}°C, Low ${tmin}°C, ${desc}`
            })
            .join('\n')

          serverCityContext = `Detected location: ${geo.name}${geo.admin1 ? `, ${geo.admin1}` : ''}, ${geo.country}
- Temperature: ${Math.round(data.current.temperature_2m)}°C
- Conditions: ${currentDesc}
- Wind Speed: ${Math.round(data.current.wind_speed_10m)} km/h
- Humidity: ${data.current.relative_humidity_2m}%

5-Day Forecast:
${forecastLines}`
        }
      } catch (e) {
        // Try a softer fallback: attempt geocoding the full message
        try {
          const res2 = await fetch(`${GEOCODING_API}?name=${encodeURIComponent(message)}&count=5&language=en&format=json`)
          if (res2.ok) {
            const dataGeo2 = await res2.json()
            let results2 = (dataGeo2?.results || []).map((r: any) => ({
              name: r.name as string,
              country: r.country as string,
              admin1: r.admin1 as string | undefined,
              latitude: r.latitude as number,
              longitude: r.longitude as number,
            })) as GeoResult[]
            results2 = dedupeGeo(results2)
            if (results2.length > 1) {
              return NextResponse.json({
                prompt: 'choose_city',
                choices: results2.slice(0, 5),
                message: `I found a few places related to your message 😊\nPlease choose 1-${Math.min(results2.length,5)}:`,
              })
            } else if (results2[0]) {
              // Single match; fetch and reply
              const g = results2[0]
              const data = await fetchWeather(g.latitude, g.longitude)
              const currentDesc = weatherCodeDescription(data.current.weather_code)
              const forecastLines = (data.daily.time || [])
                .slice(1, 6)
                .map((date: string, i: number) => {
                  const d = data.daily.weather_code?.[i + 1]
                  const desc = weatherCodeDescription(d)
                  const tmax = Math.round(data.daily.temperature_2m_max?.[i + 1])
                  const tmin = Math.round(data.daily.temperature_2m_min?.[i + 1])
                  return `- ${date}: High ${tmax}°C, Low ${tmin}°C, ${desc}`
                })
                .join('\n')
              const reply = `Here’s the latest for ${g.name}${g.admin1 ? `, ${g.admin1}` : ''}, ${g.country} ☀️\n\n- Temp: ${Math.round(data.current.temperature_2m)}°C · ${currentDesc}\n- Wind: ${Math.round(data.current.wind_speed_10m)} km/h · Humidity: ${data.current.relative_humidity_2m}%\n\n5-day outlook:\n${forecastLines}`
              return NextResponse.json({ reply })
            }
          }
        } catch {
          // Ignore and continue to general fallback
        }
        // Finally fall back to on-screen data
      }
    }

    // Fallback to on-screen weather data if present
    let fallbackContext = 'No weather data available. Ask the user to search for a location.'
    if (weatherData && weatherData.location) {
      try {
        const forecastLines = weatherData.daily?.time?.slice(1, 6)
          .map((date: string, i: number) => {
            const desc = weatherData.daily.description?.[i + 1] || 'Unknown'
            const tempMax = weatherData.daily.temperatureMax?.[i + 1] || 'N/A'
            const tempMin = weatherData.daily.temperatureMin?.[i + 1] || 'N/A'
            return `- ${date}: High ${tempMax}°C, Low ${tempMin}°C, ${desc}`
          })
          .join('\n') || 'No forecast data available'

        fallbackContext = `Current weather (on-screen data):
- Location: ${weatherData.location.city}, ${weatherData.location.country}
- Temperature: ${weatherData.current.temperature}°C
- Conditions: ${weatherData.current.description || 'Unknown'}
- Wind Speed: ${weatherData.current.windSpeed} km/h
- Humidity: ${weatherData.current.humidity}%

5-Day Forecast:
${forecastLines}`
      } catch {}
    }

    const systemContext = serverCityContext || fallbackContext

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a friendly, concise weather assistant.
Tone & style:
- Be warm and collaborative; avoid sounding corrective.
- Respond in ONE short paragraph (2–3 sentences). Do NOT enumerate days, and do NOT use bullet points or tables.
- Summarize only what's most useful: current conditions, temp with units, wind, and a brief outlook.
- If multiple cities match, list 2–5 numbered options and ask the user to pick.

When context is provided below, synthesize it into prose instead of copying it verbatim.
CONTEXT (may include current and a 5‑day forecast):\n${systemContext}`,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      temperature: 0.7,
      max_tokens: 120,
    })

    const reply = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.'

    return NextResponse.json({ reply })
  } catch (error: any) {
    console.error('OpenAI API error:', error)
    
    // Provide more specific error messages
    let errorMessage = 'Failed to get response from AI'
    
    if (error.code === 'invalid_api_key') {
      errorMessage = 'Invalid API key. Please check your OpenAI API key in .env.local'
    } else if (error.status === 401) {
      errorMessage = 'Authentication failed. Please verify your OpenAI API key.'
    } else if (error.status === 429) {
      errorMessage = 'Rate limit exceeded. Please try again in a moment.'
    } else if (error.message) {
      errorMessage = error.message
    }
    
    return NextResponse.json(
      { error: errorMessage, details: error.message },
      { status: 500 }
    )
  }
}
