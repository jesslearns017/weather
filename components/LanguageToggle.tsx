'use client'

import { useLanguage } from '@/context/LanguageContext'

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage()
  const btn = (code: 'en' | 'es') => (
    <button
      key={code}
      onClick={() => setLang(code)}
      className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-all duration-200 ${
        lang === code
          ? 'bg-white text-blue-700 border-white shadow'
          : 'bg-white/10 text-white border-white/30 hover:bg-white/20'
      }`}
      aria-pressed={lang === code}
    >
      {code.toUpperCase()}
    </button>
  )

  return (
    <div className="ml-auto inline-flex items-center gap-2 bg-white/10 rounded-lg p-1 border border-white/20">
      {btn('en')}
      {btn('es')}
    </div>
  )
}
