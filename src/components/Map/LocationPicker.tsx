import { useEffect, useState } from 'react'
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { JARAGUA_CENTER, TILE_ATTRIBUTION, TILE_URL, geocode, markerIconDefault } from '../../lib/map'
import './Map.css'

type Point = [number, number]

interface Props {
  value: Point | null
  onChange: (value: Point | null) => void
  /** Usados pelo botão "Buscar pelo endereço". */
  location: string
  neighborhood: string
}

function ClickToPlace({ onPick }: { onPick: (p: Point) => void }) {
  useMapEvents({
    click: (e) => onPick([e.latlng.lat, e.latlng.lng]),
  })
  return null
}

function FlyTo({ point }: { point: Point | null }) {
  const map = useMap()
  useEffect(() => {
    if (point) map.setView(point, Math.max(map.getZoom(), 15))
  }, [map, point])
  return null
}

export default function LocationPicker({ value, onChange, location, neighborhood }: Props) {
  const [searching, setSearching] = useState(false)
  const [message, setMessage] = useState('')
  // Só recentraliza quando o ponto vem da busca — ao clicar, o mapa fica onde está.
  const [flyTarget, setFlyTarget] = useState<Point | null>(value)

  async function handleSearch() {
    if (!location.trim() && !neighborhood.trim()) {
      setMessage('Preencha o local ou o bairro para buscar.')
      return
    }
    setSearching(true)
    setMessage('')
    try {
      const found = await geocode(location, neighborhood)
      if (found) {
        onChange(found)
        setFlyTarget(found)
        setMessage('Confira o ponto e arraste o marcador se precisar ajustar.')
      } else {
        setMessage('Endereço não encontrado. Clique no mapa para marcar o local.')
      }
    } catch {
      setMessage('Não foi possível buscar agora. Clique no mapa para marcar o local.')
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="location-picker">
      <div className="location-picker-actions">
        <button type="button" onClick={handleSearch} disabled={searching}>
          {searching ? 'Buscando...' : 'Buscar pelo endereço'}
        </button>
        {value && (
          <button type="button" className="link-button" onClick={() => onChange(null)}>
            Remover do mapa
          </button>
        )}
      </div>

      <div className="location-picker-map">
        <MapContainer center={value ?? JARAGUA_CENTER} zoom={value ? 15 : 13} style={{ height: '100%' }}>
          <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
          <ClickToPlace onPick={onChange} />
          <FlyTo point={flyTarget} />
          {value && (
            <Marker
              position={value}
              icon={markerIconDefault}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const { lat, lng } = e.target.getLatLng()
                  onChange([lat, lng])
                },
              }}
            />
          )}
        </MapContainer>
      </div>

      <small className="field-hint">
        {message || (value ? 'Arraste o marcador para ajustar.' : 'Clique no mapa para marcar onde a atividade acontece.')}
      </small>
    </div>
  )
}
