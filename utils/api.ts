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

export async function searchLocation(query: string): Promise<GeocodingResult[]> {
  try {
    const response = await fetch(
      `${GEOCODING_API}?name=${encodeURIComponent(query)}&count=5&language=en&format=json`
    )
    
    if (!response.ok) {
      throw new Error('Failed to fetch location data')
    }
    
    const data = await response.json()
    const results: GeocodingResult[] = data.results || []
    const unique = dedupeGeocoding(results)
    return unique.slice(0, 5)
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
