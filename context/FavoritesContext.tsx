'use client'

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type Favorite = {
  name: string
  admin1?: string
  country?: string
  latitude: number
  longitude: number
  savedAt: number
}

type Ctx = {
  favorites: Favorite[]
  isFavorite: (lat: number, lon: number) => boolean
  addFavorite: (f: Favorite) => void
  removeFavorite: (lat: number, lon: number) => void
}

const FavoritesContext = createContext<Ctx | undefined>(undefined)

function keyFrom(lat: number, lon: number) {
  const a = Math.round(lat * 1000) / 1000
  const b = Math.round(lon * 1000) / 1000
  return `${a}|${b}`
}

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<Favorite[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('favorites')
      if (raw) setFavorites(JSON.parse(raw))
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('favorites', JSON.stringify(favorites))
    } catch {}
  }, [favorites])

  const map = useMemo(() => {
    const m = new Map<string, Favorite>()
    for (const f of favorites) m.set(keyFrom(f.latitude, f.longitude), f)
    return m
  }, [favorites])

  const isFavorite = (lat: number, lon: number) => map.has(keyFrom(lat, lon))

  const addFavorite = (f: Favorite) => {
    const k = keyFrom(f.latitude, f.longitude)
    if (map.has(k)) return
    setFavorites((prev) => [{ ...f, savedAt: Date.now() }, ...prev].slice(0, 15))
  }

  const removeFavorite = (lat: number, lon: number) => {
    const k = keyFrom(lat, lon)
    setFavorites((prev) => prev.filter((p) => keyFrom(p.latitude, p.longitude) !== k))
  }

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, addFavorite, removeFavorite }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider')
  return ctx
}
