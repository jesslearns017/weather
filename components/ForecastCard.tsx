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
    <div className="bg-white rounded-xl p-4 border border-blue-200 shadow hover:shadow-md transition-all duration-200 hover:scale-105">
      {/* Day and Date */}
      <div className="text-center mb-3">
        <div className="text-slate-900 font-semibold text-lg">{day}</div>
        <div className="text-slate-600 text-sm">{date}</div>
      </div>

      {/* Weather Icon */}
      <div className="text-5xl text-center mb-3" role="img" aria-label={description}>
        {icon}
      </div>

      {/* Description */}
      <div className="text-slate-600 text-sm text-center mb-4 h-10 flex items-center justify-center">
        {description}
      </div>

      {/* Temperature Range */}
      <div className="flex justify-center items-center gap-2 mb-3">
        <span className="text-slate-900 font-bold text-xl">{convertTemperature(tempMax, unit)}°{unit}</span>
        <span className="text-slate-500">/</span>
        <span className="text-slate-700 text-lg">{convertTemperature(tempMin, unit)}°{unit}</span>
      </div>

      {/* Precipitation */}
      {precipitation > 0 && (
        <div className="flex items-center justify-center gap-1 text-blue-700 text-sm">
          <Droplets className="w-4 h-4" />
          <span>{precipitation.toFixed(1)} mm</span>
        </div>
      )}
    </div>
  )
}
