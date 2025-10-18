# Weather Dashboard

A modern, responsive weather dashboard built with Next.js, React, TypeScript, and Tailwind CSS. The application displays current weather conditions and a 5-day forecast using the free Open-Meteo API.

## Features

- 🌤️ **Current Weather**: Real-time temperature, weather conditions, wind speed, and humidity
- 📅 **5-Day Forecast**: Daily weather predictions with high/low temperatures and precipitation
- 🔍 **City Search**: Search for any city worldwide with autocomplete suggestions
- 📱 **Responsive Design**: Beautiful UI that works seamlessly on mobile and desktop
- 🎨 **Modern UI**: Clean design with glassmorphism effects and smooth animations
- ⚡ **Fast & Lightweight**: Built with Next.js 14 for optimal performance
- 🆓 **No API Key Required**: Uses the free Open-Meteo API
- 🌡️ **Temperature Units**: Toggle between Celsius and Fahrenheit

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **API**: Open-Meteo (weather data) & Open-Meteo Geocoding (location search)

## Getting Started

### Prerequisites

- Node.js 18+ installed on your machine
- npm, yarn, or pnpm package manager

### Installation

1. Clone or navigate to the project directory:
```bash
cd weather-dashboard
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

1. **Default Location**: The app loads with New York weather by default
2. **Search**: Use the search bar to find any city worldwide
3. **View Details**: See current conditions including temperature, weather description, wind speed, and humidity
4. **Check Forecast**: Scroll down to view the 5-day forecast with daily highs, lows, and precipitation

## Project Structure

```
weather-dashboard/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles and Tailwind imports
├── components/
│   ├── WeatherDashboard.tsx # Main dashboard component
│   ├── CurrentWeather.tsx   # Current weather display
│   ├── ForecastCard.tsx     # Individual forecast card
│   └── SearchBar.tsx        # Search input with autocomplete
├── types/
│   └── weather.ts          # TypeScript interfaces
├── utils/
│   ├── api.ts              # API functions for fetching data
│   └── weatherCodes.ts     # Weather code mappings
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

## API Information

This project uses two free APIs from Open-Meteo:

- **Weather Forecast API**: Provides current weather and forecast data
- **Geocoding API**: Enables city search functionality

No API key is required, making it easy to deploy and use.

## Building for Production

To create an optimized production build:

```bash
npm run build
npm start
```

## Deployment

This Next.js application can be easily deployed to share with others:

### Quick Deploy (Recommended)

**Vercel** - Easiest option:
1. Push your code to GitHub
2. Visit [vercel.com](https://vercel.com) and sign up
3. Click "New Project" and import your repository
4. Click "Deploy" - Done! Get a live URL in 2 minutes

**Other Options:**
- **Netlify**: Similar to Vercel, great alternative
- **GitHub Pages**: Free static hosting (already configured)
- **Railway**: Good for full-stack apps

📖 **See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed step-by-step guides for all platforms**

## Customization

### Change Default Location

Edit `components/WeatherDashboard.tsx` and modify the `useEffect` hook:

```typescript
useEffect(() => {
  loadWeather(YOUR_LAT, YOUR_LON, 'Your City', 'Your Country')
}, [])
```

### Modify Color Scheme

Edit the gradient in `app/page.tsx`:

```typescript
<main className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600">
```

### Add More Weather Details

The Open-Meteo API provides many additional parameters. Check their [documentation](https://open-meteo.com/en/docs) to add more features.

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Weather data provided by [Open-Meteo](https://open-meteo.com/)
- Icons from [Lucide React](https://lucide.dev/)
- Built with [Next.js](https://nextjs.org/) and [Tailwind CSS](https://tailwindcss.com/)
