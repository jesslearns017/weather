export function celsiusToFahrenheit(celsius: number): number {
  return Math.round((celsius * 9) / 5 + 32)
}

export function convertTemperature(celsius: number, unit: 'C' | 'F'): number {
  return unit === 'F' ? celsiusToFahrenheit(celsius) : celsius
}
