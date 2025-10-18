export function kmhToMph(kmh: number): number {
  return Math.round(kmh * 0.621371)
}

export function convertWindSpeed(kmh: number, unit: 'kmh' | 'mph'): number {
  return unit === 'mph' ? kmhToMph(kmh) : kmh
}

export function getWindSpeedUnit(unit: 'kmh' | 'mph'): string {
  return unit === 'kmh' ? 'km/h' : 'mph'
}
