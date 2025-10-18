export const weatherCodeMap: Record<number, { descriptions: { en: string; es: string }; icon: string }> = {
  0: { descriptions: { en: 'Clear sky', es: 'Cielo despejado' }, icon: '☀️' },
  1: { descriptions: { en: 'Mainly clear', es: 'Mayormente despejado' }, icon: '🌤️' },
  2: { descriptions: { en: 'Partly cloudy', es: 'Parcialmente nublado' }, icon: '⛅' },
  3: { descriptions: { en: 'Overcast', es: 'Nublado' }, icon: '☁️' },
  45: { descriptions: { en: 'Foggy', es: 'Neblinoso' }, icon: '🌫️' },
  48: { descriptions: { en: 'Depositing rime fog', es: 'Niebla con escarcha' }, icon: '🌫️' },
  51: { descriptions: { en: 'Light drizzle', es: 'Llovizna ligera' }, icon: '🌦️' },
  53: { descriptions: { en: 'Moderate drizzle', es: 'Llovizna moderada' }, icon: '🌦️' },
  55: { descriptions: { en: 'Dense drizzle', es: 'Llovizna intensa' }, icon: '🌧️' },
  56: { descriptions: { en: 'Light freezing drizzle', es: 'Llovizna helada ligera' }, icon: '🌧️' },
  57: { descriptions: { en: 'Dense freezing drizzle', es: 'Llovizna helada intensa' }, icon: '🌧️' },
  61: { descriptions: { en: 'Slight rain', es: 'Lluvia ligera' }, icon: '🌧️' },
  63: { descriptions: { en: 'Moderate rain', es: 'Lluvia moderada' }, icon: '🌧️' },
  65: { descriptions: { en: 'Heavy rain', es: 'Lluvia intensa' }, icon: '⛈️' },
  66: { descriptions: { en: 'Light freezing rain', es: 'Lluvia helada ligera' }, icon: '🌧️' },
  67: { descriptions: { en: 'Heavy freezing rain', es: 'Lluvia helada intensa' }, icon: '🌧️' },
  71: { descriptions: { en: 'Slight snow', es: 'Nieve ligera' }, icon: '🌨️' },
  73: { descriptions: { en: 'Moderate snow', es: 'Nieve moderada' }, icon: '🌨️' },
  75: { descriptions: { en: 'Heavy snow', es: 'Nieve intensa' }, icon: '❄️' },
  77: { descriptions: { en: 'Snow grains', es: 'Granos de nieve' }, icon: '🌨️' },
  80: { descriptions: { en: 'Slight rain showers', es: 'Chubascos ligeros' }, icon: '🌦️' },
  81: { descriptions: { en: 'Moderate rain showers', es: 'Chubascos moderados' }, icon: '🌧️' },
  82: { descriptions: { en: 'Violent rain showers', es: 'Chubascos fuertes' }, icon: '⛈️' },
  85: { descriptions: { en: 'Slight snow showers', es: 'Nevadas ligeras' }, icon: '🌨️' },
  86: { descriptions: { en: 'Heavy snow showers', es: 'Nevadas intensas' }, icon: '❄️' },
  95: { descriptions: { en: 'Thunderstorm', es: 'Tormenta' }, icon: '⛈️' },
  96: { descriptions: { en: 'Thunderstorm with slight hail', es: 'Tormenta con granizo leve' }, icon: '⛈️' },
  99: { descriptions: { en: 'Thunderstorm with heavy hail', es: 'Tormenta con granizo fuerte' }, icon: '⛈️' },
}

export function getWeatherDescription(code: number, lang: 'en' | 'es' = 'en'): string {
  const entry = weatherCodeMap[code]
  if (!entry) return lang === 'es' ? 'Desconocido' : 'Unknown'
  return entry.descriptions[lang] || entry.descriptions.en
}

export function getWeatherIcon(code: number): string {
  return weatherCodeMap[code]?.icon || '🌡️'
}
