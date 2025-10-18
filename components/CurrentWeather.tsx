import { MapPin, Wind, Droplets } from 'lucide-react'
import { WeatherData } from '@/types/weather'
import { getWeatherDescription, getWeatherIcon } from '@/utils/weatherCodes'
import { convertTemperature } from '@/utils/temperature'
import { convertWindSpeed, getWindSpeedUnit } from '@/utils/windSpeed'
import { useLanguage } from '@/context/LanguageContext'
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
  return (
    <div className="bg-blue-800/40 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-blue-300/10">
      {/* Location */}
      <div className="flex items-center gap-2 mb-6">
        <MapPin className="w-5 h-5 text-blue-200" />
        <h2 className="text-2xl font-semibold text-white">
          {weatherData.location.city}, {weatherData.location.admin1 || weatherData.location.country}
        </h2>
      </div>

      {/* Main Weather Display */}
      <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
        {/* Temperature and Icon */}
        <div className="flex items-center gap-6">
          <div className="text-8xl" role="img" aria-label="weather icon">
            {getWeatherIcon(weatherData.current.weatherCode)}
          </div>
          <div>
            <div className="text-7xl font-bold text-white">
              {convertTemperature(weatherData.current.temperature, unit)}°{unit}
            </div>
            <div className="text-xl text-blue-100 mt-2">
              {getWeatherDescription(weatherData.current.weatherCode)}
            </div>
            {/* Temperature Unit Toggle Button */}
            <button
              onClick={onToggleUnit}
              className="mt-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-1.5 text-white font-medium transition-all duration-200 hover:scale-105 shadow-lg text-xs flex items-center gap-1.5"
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
          <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Wind className="w-5 h-5 text-blue-200" />
              <span className="text-blue-200 text-sm">{t(lang, 'wind_speed')}</span>
            </div>
            <div className="text-2xl font-bold text-white mb-2">
              {convertWindSpeed(weatherData.current.windSpeed, windSpeedUnit)} <span className="text-lg">{getWindSpeedUnit(windSpeedUnit)}</span>
            </div>
            {/* Wind Speed Unit Toggle Button */}
            <button
              onClick={onToggleWindSpeedUnit}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded px-2 py-1 text-white font-medium transition-all duration-200 hover:scale-105 text-xs"
              aria-label="Toggle wind speed unit"
              title={`Switch to ${windSpeedUnit === 'kmh' ? 'mph' : 'km/h'}`}
            >
              {windSpeedUnit === 'kmh' ? t(lang, 'change_to_mph') : t(lang, 'change_to_kmh')}
            </button>
          </div>

          <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="w-5 h-5 text-blue-200" />
              <span className="text-blue-200 text-sm">{t(lang, 'humidity')}</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {weatherData.current.humidity}<span className="text-lg">%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Last Updated */}
      <div className="mt-6 text-blue-200 text-sm">
        Last updated: {new Date(weatherData.current.time).toLocaleString()}
      </div>
    </div>
  )
}
