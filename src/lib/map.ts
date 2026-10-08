import L from 'leaflet'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

/** Centro de Jaraguá do Sul — posição inicial dos mapas. */
export const JARAGUA_CENTER: [number, number] = [-26.4851, -49.0713]

export const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
export const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'

// O ícone padrão do Leaflet aponta para caminhos relativos que o Vite não resolve.
export const markerIconDefault = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

async function searchNominatim(query: string): Promise<[number, number] | null> {
  const params = new URLSearchParams({
    q: `${query}, Jaraguá do Sul, SC, Brasil`,
    format: 'json',
    limit: '1',
    countrycodes: 'br',
  })
  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
    headers: { 'Accept-Language': 'pt-BR' },
  })
  if (!res.ok) return null
  const [first] = (await res.json()) as { lat: string; lon: string }[]
  return first ? [Number(first.lat), Number(first.lon)] : null
}

/**
 * Busca as coordenadas em Jaraguá do Sul (Nominatim / OpenStreetMap). O Nominatim costuma não achar
 * "local + bairro" juntos, então tenta do mais específico ao mais genérico: local + bairro, só o
 * local e só o bairro. Espera 1s entre as tentativas (limite de uso do serviço).
 */
export async function geocode(location: string, neighborhood: string): Promise<[number, number] | null> {
  const candidates = [...new Set([
    [location, neighborhood].filter(Boolean).join(', '),
    location,
    neighborhood,
  ].map((c) => c.trim()).filter(Boolean))]

  for (const [i, query] of candidates.entries()) {
    if (i > 0) await new Promise((resolve) => setTimeout(resolve, 1000))
    const found = await searchNominatim(query)
    if (found) return found
  }
  return null
}
