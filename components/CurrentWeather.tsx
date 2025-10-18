import { MapPin, Wind, Droplets } from 'lucide-react'
import { WeatherData } from '@/types/weather'
import { getWeatherDescription, getWeatherIcon } from '@/utils/weatherCodes'
import { convertTemperature } from '@/utils/temperature'
import { convertWindSpeed, getWindSpeedUnit } from '@/utils/windSpeed'
import { useLanguage } from '@/context/LanguageContext'
import { useFavorites } from '@/context/FavoritesContext'
import { t } from '@/utils/strings'

interface CurrentWeatherProps {
  weatherData: WeatherData
  unit: 'C' | 'F'
  onToggleUnit: () => void
  windSpeedUnit: 'kmh' | 'mph'
  onToggleWindSpeedUnit: () => void
}

export default function CurrentWeather({ weatherData, unit, onToggleUnit, windSpeedUnit, onToggleWindSpeedUnit }: CurrentWeatherProps) {
  const { lang } = useLanguage()
  const { isFavorite, addFavorite, removeFavorite } = useFavorites()
  return (
    <div className="bg-blue-50 rounded-2xl p-8 shadow-2xl border border-blue-200">
      {/* Location */}
      <div className="flex items-center gap-2 mb-6">
        <MapPin className="w-5 h-5 text-slate-300" />
        <h2 className="text-2xl font-semibold text-slate-900">
          {weatherData.location.city}, {weatherData.location.admin1 || weatherData.location.country}
        </h2>
        <button
          onClick={() => {
            const lat = weatherData.location.latitude
            const lon = weatherData.location.longitude
            if (isFavorite(lat, lon)) {
              removeFavorite(lat, lon)
            } else {
              addFavorite({
                name: weatherData.location.city,
                admin1: weatherData.location.admin1 || undefined,
                country: weatherData.location.country || undefined,
                latitude: lat,
                longitude: lon,
                savedAt: Date.now(),
              })
            }
          }}
          className={`ml-2 px-2 py-1 text-xs rounded-md border ${
            isFavorite(weatherData.location.latitude, weatherData.location.longitude)
              ? 'bg-yellow-400 text-blue-900 border-yellow-300'
              : 'bg-blue-50 text-slate-700 border-blue-200 hover:bg-blue-100'
          }`}
          aria-label="Toggle favorite"
          title={isFavorite(weatherData.location.latitude, weatherData.location.longitude) ? 'Unsave' : 'Save'}
        >
          ★
        </button>
      </div>

      {/* Main Weather Display */}
      <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
        {/* Temperature and Icon */}
        <div className="flex items-center gap-6">
          <div className="text-8xl" role="img" aria-label="weather icon">
            {getWeatherIcon(weatherData.current.weatherCode)}
          </div>
          <div>
            <div className="text-7xl font-bold text-slate-900">
              {convertTemperature(weatherData.current.temperature, unit)}°{unit}
            </div>
            <div className="text-xl text-slate-600 mt-2">
              {getWeatherDescription(weatherData.current.weatherCode, lang)}
            </div>
            {/* Temperature Unit Toggle Button */}
            <button
              onClick={onToggleUnit}
              className="mt-3 bg-blue-600 hover:bg-blue-700 border border-blue-700 rounded-lg px-3 py-1.5 text-white font-medium transition-all duration-200 hover:scale-105 shadow-lg text-xs flex items-center gap-1.5"
              aria-label="Toggle temperature unit"
              title={`Switch to °${unit === 'C' ? 'F' : 'C'}`}
            >
              <span>{t(lang, 'change_degrees_btn')}</span>
              <span className="text-sm">°{unit === 'C' ? 'F' : 'C'}</span>
            </button>
          </div>
        </div>

        {/* Weather Details */}
        <div className="grid grid-cols-2 gap-6 md:gap-8">
          <div className="bg-blue-100 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Wind className="w-5 h-5 text-blue-600" />
              <span className="text-slate-600 text-sm">{t(lang, 'wind_speed')}</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-2">
              {convertWindSpeed(weatherData.current.windSpeed, windSpeedUnit)} <span className="text-lg">{getWindSpeedUnit(windSpeedUnit)}</span>
            </div>
            {/* Wind Speed Unit Toggle Button */}
            <button
              onClick={onToggleWindSpeedUnit}
              className="bg-blue-600 hover:bg-blue-700 border border-blue-700 rounded px-2 py-1 text-white font-medium transition-all duration-200 hover:scale-105 text-xs"
              aria-label="Toggle wind speed unit"
              title={`Switch to ${windSpeedUnit === 'kmh' ? 'mph' : 'km/h'}`}
            >
              {windSpeedUnit === 'kmh' ? t(lang, 'change_to_mph') : t(lang, 'change_to_kmh')}
            </button>
          </div>

          <div className="bg-blue-100 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="w-5 h-5 text-blue-600" />
              <span className="text-slate-600 text-sm">{t(lang, 'humidity')}</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {weatherData.current.humidity}<span className="text-lg">%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Last Updated */}
      <div className="mt-6 text-slate-500 text-sm">
        Last updated: {new Date(weatherData.current.time).toLocaleString()}
      </div>
    </div>
  )
}
