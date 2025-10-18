export interface WeatherData {
  current: {
    temperature: number
    weatherCode: number
    windSpeed: number
    humidity: number
    time: string
  }
  daily: {
    time: string[]
    temperatureMax: number[]
    temperatureMin: number[]
    weatherCode: number[]
    precipitation: number[]
  }
  location: {
    city: string
    country: string
    admin1?: string
    latitude: number
    longitude: number
  }
}

export interface GeocodingResult {
  name: string
  country: string
  latitude: number
  longitude: number
  admin1?: string
}
