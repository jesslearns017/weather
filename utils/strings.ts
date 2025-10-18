export type Lang = 'en' | 'es'

const STRINGS: Record<Lang, Record<string, string>> = {
  en: {
    title: 'Weather Dashboard',
    subtitle: 'Current conditions and 5-day forecast',
    forecast: '5-Day Forecast',
    search_placeholder: 'Search for a city...',
    no_results: 'No locations found. Try a different search term.',
    wind_speed: 'Wind Speed',
    humidity: 'Humidity',
    change_degrees_btn: 'Change degrees',
    change_to_mph: 'Change to mph',
    change_to_kmh: 'Change to km/h',
  },
  es: {
    title: 'Panel del Clima',
    subtitle: 'Condiciones actuales y pronóstico de 5 días',
    forecast: 'Pronóstico de 5 días',
    search_placeholder: 'Busca una ciudad...',
    no_results: 'No se encontraron lugares. Prueba con otro término.',
    wind_speed: 'Velocidad del viento',
    humidity: 'Humedad',
    change_degrees_btn: 'Cambiar grados',
    change_to_mph: 'Cambiar a mph',
    change_to_kmh: 'Cambiar a km/h',
  },
}

export function t(lang: Lang, key: string): string {
  return STRINGS[lang]?.[key] ?? STRINGS.en[key] ?? key
}
