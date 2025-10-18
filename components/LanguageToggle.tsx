'use client'

import { useLanguage } from '@/context/LanguageContext'

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage()
  const next = lang === 'en' ? 'es' : 'en'
  return (
    <button
      onClick={() => setLang(next)}
      className="ml-auto bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-1.5 text-white font-medium transition-all duration-200 hover:scale-105 shadow-lg text-xs"
      aria-label="Toggle language"
      title={`Switch to ${next.toUpperCase()}`}
    >
      {lang.toUpperCase()}
    </button>
  )
}
