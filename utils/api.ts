import { WeatherData, GeocodingResult } from '@/types/weather'

const GEOCODING_API = 'https://geocoding-api.open-meteo.com/v1/search'
const WEATHER_API = 'https://api.open-meteo.com/v1/forecast'

function dedupeGeocoding(results: GeocodingResult[]): GeocodingResult[] {
  const seen = new Set<string>()
  const out: GeocodingResult[] = []
  for (const r of results) {
    const key1 = `${(r.name || '').toLowerCase()}|${(r.admin1 || '').toLowerCase()}|${(r.country || '').toLowerCase()}`
    const key2 = `${Math.round((r.latitude || 0) * 100) / 100}|${Math.round((r.longitude || 0) * 100) / 100}`
    const key = key1 + '|' + key2
    if (!seen.has(key)) {
      seen.add(key)
      out.push(r)
    }
  }
  return out
}

function stripDiacritics(s: string) {
  // Remove common combining marks after NFD normalization (no Unicode property escapes needed)
  return (s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function prioritizeByQuery(results: GeocodingResult[], query: string): GeocodingResult[] {
  const norm = (s: string) => stripDiacritics((s || '').toLowerCase().trim())
  const q = norm(query)
  // Try to infer a trailing region/country token from the query, e.g. "barranquitas puerto rico"
  const parts = q.split(/\s+/)
  const tail2 = parts.length >= 2 ? norm(parts.slice(-2).join(' ')) : ''
  const tail1 = parts.length >= 1 ? norm(parts[parts.length - 1]) : ''

  const score = (r: GeocodingResult) => {
    const name = norm(r.name)
    const admin1 = norm(r.admin1 || '')
    const country = norm(r.country || '')
    let s = 0
    if (q && name.includes(q)) s += 5
    if (tail2 && (admin1.includes(tail2) || country.includes(tail2))) s += 4
    if (tail1 && (admin1.includes(tail1) || country.includes(tail1))) s += 2
    // Favor Puerto Rico territory rendering when applicable
    if (admin1.includes('puerto rico')) s += 1
    return s
  }

  return [...results].sort((a, b) => score(b) - score(a))
}

export async function searchLocation(query: string, lang: string = 'en'): Promise<GeocodingResult[]> {
  try {
    const qRaw = query
    const response = await fetch(
      `${GEOCODING_API}?name=${encodeURIComponent(query)}&count=10&language=${encodeURIComponent(lang)}&format=json`
    )
    
    if (!response.ok) {
      throw new Error('Failed to fetch location data')
    }
    
    const data = await response.json()
    let results: GeocodingResult[] = data.results || []
    let unique = dedupeGeocoding(results)

    // If Puerto Rico is missing from the first pass and the user didn't already specify a country,
    // try a focused query with "puerto rico" appended and merge the results at the top.
    const norm = (s: string) => stripDiacritics((s || '').toLowerCase().trim())
    const hasCountryHint = /,|\b(usa|us|united states|puerto rico|guam|virgin islands|american samoa|northern mariana)\b/i.test(qRaw)
    const hasPuertoRico = unique.some(r => norm(r.admin1 || '').includes('puerto rico') || norm(r.country || '').includes('puerto rico'))
    if (!hasCountryHint && !hasPuertoRico) {
      try {
        const prRes = await fetch(
          `${GEOCODING_API}?name=${encodeURIComponent(query + ' puerto rico')}&count=5&language=${encodeURIComponent(lang)}&format=json`
        )
        if (prRes.ok) {
          const prData = await prRes.json()
          const prList: GeocodingResult[] = prData.results || []
          const merged = dedupeGeocoding([...prList, ...unique])
          unique = merged
        }
      } catch {}
    }

    const prioritized = prioritizeByQuery(unique, query)
    return prioritized.slice(0, 5)
  } catch (error) {
    console.error('Error searching location:', error)
    return []
  }
}

export async function getWeatherData(
  latitude: number,
  longitude: number,
  city: string,
  country: string,
  admin1?: string
): Promise<WeatherData> {
  try {
    const response = await fetch(
      `${WEATHER_API}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&forecast_days=6`
    )
    
    if (!response.ok) {
      throw new Error('Failed to fetch weather data')
    }
    
    const data = await response.json()
    
    return {
      current: {
        temperature: Math.round(data.current.temperature_2m),
        weatherCode: data.current.weather_code,
        windSpeed: Math.round(data.current.wind_speed_10m),
        humidity: data.current.relative_humidity_2m,
        time: data.current.time,
      },
      daily: {
        time: data.daily.time,
        temperatureMax: data.daily.temperature_2m_max.map((t: number) => Math.round(t)),
        temperatureMin: data.daily.temperature_2m_min.map((t: number) => Math.round(t)),
        weatherCode: data.daily.weather_code,
        precipitation: data.daily.precipitation_sum,
      },
      location: {
        city,
        country,
        admin1,
      },
    }
  } catch (error) {
    console.error('Error fetching weather data:', error)
    throw error
  }
}
