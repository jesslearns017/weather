import { Droplets } from 'lucide-react'
import { convertTemperature } from '@/utils/temperature'

interface ForecastCardProps {
  day: string
  date: string
  icon: string
  description: string
  tempMax: number
  tempMin: number
  precipitation: number
  unit: 'C' | 'F'
}

export default function ForecastCard({
  day,
  date,
  icon,
  description,
  tempMax,
  tempMin,
  precipitation,
  unit,
}: ForecastCardProps) {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-200 hover:scale-105">
      {/* Day and Date */}
      <div className="text-center mb-3">
        <div className="text-white font-semibold text-lg">{day}</div>
        <div className="text-blue-200 text-sm">{date}</div>
      </div>

      {/* Weather Icon */}
      <div className="text-5xl text-center mb-3" role="img" aria-label={description}>
        {icon}
      </div>

      {/* Description */}
      <div className="text-blue-100 text-sm text-center mb-4 h-10 flex items-center justify-center">
        {description}
      </div>

      {/* Temperature Range */}
      <div className="flex justify-center items-center gap-2 mb-3">
        <span className="text-white font-bold text-xl">{convertTemperature(tempMax, unit)}°{unit}</span>
        <span className="text-blue-200">/</span>
        <span className="text-blue-300 text-lg">{convertTemperature(tempMin, unit)}°{unit}</span>
      </div>

      {/* Precipitation */}
      {precipitation > 0 && (
        <div className="flex items-center justify-center gap-1 text-blue-200 text-sm">
          <Droplets className="w-4 h-4" />
          <span>{precipitation.toFixed(1)} mm</span>
        </div>
      )}
    </div>
  )
}
