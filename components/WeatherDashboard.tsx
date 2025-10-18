'use client'

import { useState, useEffect } from 'react'
import { Search, MapPin, Wind, Droplets, Loader2 } from 'lucide-react'
import { WeatherData, GeocodingResult } from '@/types/weather'
import { getWeatherData, searchLocation } from '@/utils/api'
import LanguageToggle from './LanguageToggle'
import { useLanguage } from '@/context/LanguageContext'
import { t } from '@/utils/strings'
import { getWeatherDescription, getWeatherIcon } from '@/utils/weatherCodes'
import CurrentWeather from './CurrentWeather'
import ForecastCard from './ForecastCard'
import SearchBar from './SearchBar'
import WeatherChatbot from './WeatherChatbot'
import FavoritesBar from './FavoritesBar'

export default function WeatherDashboard() {
  const { lang } = useLanguage()
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([])
  const [showResults, setShowResults] = useState(false)
  const [unit, setUnit] = useState<'C' | 'F'>('C')
  const [windSpeedUnit, setWindSpeedUnit] = useState<'kmh' | 'mph'>('kmh')

  // Load default location (New York) on mount
  useEffect(() => {
    loadWeather(40.7128, -74.0060, 'New York', 'United States', 'New York')
  }, [])

  const loadWeather = async (lat: number, lon: number, city: string, country: string, admin1?: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await getWeatherData(lat, lon, city, country, admin1)
      setWeatherData(data)
    } catch (err) {
      setError('Failed to load weather data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.length < 2) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    const results = await searchLocation(query, lang)
    setSearchResults(results)
    setShowResults(true)
  }

  const handleLocationSelect = (location: GeocodingResult) => {
    loadWeather(location.latitude, location.longitude, location.name, location.country, location.admin1)
    setSearchQuery('')
    setSearchResults([])
    setShowResults(false)
  }

  const getDayName = (dateString: string, index: number): string => {
    const locale = lang === 'es' ? 'es-ES' : 'en-US'
    if (index === 0) return lang === 'es' ? 'Hoy' : 'Today'
    const date = new Date(dateString)
    return date.toLocaleDateString(locale, { weekday: 'short' })
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
          {t(lang, 'title')}
        </h1>
        <p className="text-blue-100 text-lg">
          {t(lang, 'subtitle')}
        </p>
        <div className="mt-4 flex justify-end">
          <LanguageToggle />
        </div>

      {/* Favorites */}
      <FavoritesBar
        onSelect={(lat, lon, name, country, admin1) =>
          loadWeather(lat, lon, name, country || '', admin1)
        }
      />
      </div>

      {/* Search Bar */}
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
        searchResults={searchResults}
        showResults={showResults}
        onLocationSelect={handleLocationSelect}
        onClose={() => setShowResults(false)}
      />

      {/* Loading State */}
      {loading && (
        <div className="space-y-6">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/20 animate-pulse">
            <div className="h-6 w-40 bg-white/20 rounded mb-6" />
            <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-white/20 rounded-full" />
                <div>
                  <div className="h-16 w-40 bg-white/20 rounded mb-3" />
                  <div className="h-5 w-48 bg-white/20 rounded" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6 md:gap-8 w-full md:w-auto">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="h-4 w-24 bg-white/20 rounded mb-3" />
                  <div className="h-6 w-20 bg-white/20 rounded" />
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="h-4 w-24 bg-white/20 rounded mb-3" />
                  <div className="h-6 w-20 bg-white/20 rounded" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20">
            <div className="h-6 w-40 bg-white/20 rounded mb-6 animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 animate-pulse">
                  <div className="h-5 w-20 bg-white/20 rounded mx-auto mb-2" />
                  <div className="h-4 w-16 bg-white/20 rounded mx-auto mb-4" />
                  <div className="w-12 h-12 bg-white/20 rounded-full mx-auto mb-4" />
                  <div className="h-4 w-24 bg-white/20 rounded mx-auto mb-4" />
                  <div className="flex justify-center items-center gap-2">
                    <div className="h-6 w-10 bg-white/20 rounded" />
                    <div className="h-6 w-10 bg-white/10 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-white px-6 py-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Weather Content */}
      {!loading && weatherData && (
        <div className="space-y-6">
          {/* Current Weather */}
          <CurrentWeather 
            weatherData={weatherData} 
            unit={unit}
            onToggleUnit={() => setUnit(unit === 'C' ? 'F' : 'C')}
            windSpeedUnit={windSpeedUnit}
            onToggleWindSpeedUnit={() => setWindSpeedUnit(windSpeedUnit === 'kmh' ? 'mph' : 'kmh')}
          />

          {/* 5-Day Forecast */}
          <div className="bg-blue-500/15 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-blue-300/20" style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)' }}>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span>📅</span> {t(lang, 'forecast')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {weatherData.daily.time.slice(1, 6).map((date, index) => (
                <ForecastCard
                  key={date}
                  day={getDayName(date, index + 1)}
                  date={new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  icon={getWeatherIcon(weatherData.daily.weatherCode[index + 1])}
                  description={getWeatherDescription(weatherData.daily.weatherCode[index + 1], lang)}
                  tempMax={weatherData.daily.temperatureMax[index + 1]}
                  tempMin={weatherData.daily.temperatureMin[index + 1]}
                  precipitation={weatherData.daily.precipitation[index + 1]}
                  unit={unit}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center mt-8 text-blue-100 text-sm">
        <p>Weather data provided by Open-Meteo API</p>
      </div>

      {/* AI Chatbot */}
      <WeatherChatbot weatherData={weatherData} unit={unit} windSpeedUnit={windSpeedUnit} />
    </div>
  )
}
