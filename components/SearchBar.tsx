import { Search, MapPin, X } from 'lucide-react'
import { GeocodingResult } from '@/types/weather'
import { useLanguage } from '@/context/LanguageContext'
import { t } from '@/utils/strings'

interface SearchBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  searchResults: GeocodingResult[]
  showResults: boolean
  onLocationSelect: (location: GeocodingResult) => void
  onClose: () => void
}

export default function SearchBar({
  searchQuery,
  onSearchChange,
  searchResults,
  showResults,
  onLocationSelect,
  onClose,
}: SearchBarProps) {
  const { lang } = useLanguage()
  return (
    <div className="relative mb-8 max-w-2xl mx-auto">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder={t(lang, 'search_placeholder')}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-12 pr-12 py-4 rounded-xl bg-white/90 backdrop-blur-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-800 placeholder-gray-500 shadow-lg"
        />
        {searchQuery && (
          <button
            onClick={() => {
              onSearchChange('')
              onClose()
            }}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && searchResults.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-10">
          {searchResults.map((result, index) => (
            <button
              key={index}
              onClick={() => onLocationSelect(result)}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-blue-50 transition-colors text-left border-b border-gray-100 last:border-b-0"
            >
              <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-800 truncate">
                  {result.name}
                </div>
                <div className="text-sm text-gray-500 truncate">
                  {(() => {
                    const admin1 = (result.admin1 || '').trim()
                    const country = (result.country || '').trim()
                    const usTerritories = [
                      'puerto rico',
                      'guam',
                      'u.s. virgin islands',
                      'united states virgin islands',
                      'american samoa',
                      'northern mariana islands',
                      'commonwealth of the northern mariana islands',
                    ]
                    const isTerritory = country === 'United States' && usTerritories.includes(admin1.toLowerCase())
                    // Build parts and join to avoid dangling commas
                    const parts: string[] = []
                    if (admin1) {
                      parts.push(isTerritory ? admin1 : admin1)
                    }
                    if (country && !isTerritory) {
                      parts.push(country)
                    }
                    return parts.join(', ') || country || admin1
                  })()}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No Results Message */}
      {showResults && searchQuery.length >= 2 && searchResults.length === 0 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-2xl border border-gray-200 p-4 text-center text-gray-500">
          {t(lang, 'no_results')}
        </div>
      )}
    </div>
  )
}
