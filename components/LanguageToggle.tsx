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
          ? 'bg-blue-600 text-white border-blue-600 shadow'
          : 'bg-slate-200 text-slate-700 border-slate-300 hover:bg-slate-300'
      }`}
      aria-pressed={lang === code}
    >
      {code.toUpperCase()}
    </button>
  )

  return (
    <div className="ml-auto inline-flex items-center gap-2 bg-slate-100 rounded-lg p-1 border border-slate-300">
      {btn('en')}
      {btn('es')}
    </div>
  )
}
