'use client'

import { useFavorites } from '@/context/FavoritesContext'

type Props = {
  onSelect: (lat: number, lon: number, name: string, country?: string, admin1?: string) => void
}

export default function FavoritesBar({ onSelect }: Props) {
  const { favorites, removeFavorite } = useFavorites()

  if (!favorites.length) return null

  return (
    <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
      {favorites.map((f) => (
        <div key={`${f.latitude}|${f.longitude}`} className="relative">
          <button
            onClick={() => onSelect(f.latitude, f.longitude, f.name, f.country, f.admin1)}
            className="px-3 py-1.5 rounded-full bg-white/10 text-white border border-white/20 hover:bg-white/20 text-sm whitespace-nowrap"
            title={`${f.name}${f.admin1 ? ', ' + f.admin1 : ''}`}
          >
            {f.name}{f.admin1 ? `, ${f.admin1}` : ''}
          </button>
          <button
            onClick={() => removeFavorite(f.latitude, f.longitude)}
            className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 text-[10px] flex items-center justify-center"
            aria-label="Remove favorite"
            title="Remove"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
