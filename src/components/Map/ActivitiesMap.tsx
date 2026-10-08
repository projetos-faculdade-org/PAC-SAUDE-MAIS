import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { CATEGORY_LABEL, formatSchedule, hasCoordinates, type Activity } from '../../lib/activity'
import { JARAGUA_CENTER, TILE_ATTRIBUTION, TILE_URL, markerIconDefault } from '../../lib/map'
import './Map.css'

interface Props {
  activities: Activity[]
  /** Altura do mapa (CSS). */
  height?: string
  /** Esconde o link "Ver detalhes" no popup — usado na própria página de detalhe. */
  hideDetailsLink?: boolean
}

// Enquadra todos os pontos sempre que a lista (filtros) muda.
function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap()
  const key = points.map((p) => p.join(',')).join('|')

  useEffect(() => {
    if (points.length === 0) return
    if (points.length === 1) map.setView(points[0], 15)
    else map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 15 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, key])

  return null
}

export default function ActivitiesMap({ activities, height = '520px', hideDetailsLink = false }: Props) {
  const located = activities.filter(hasCoordinates)
  const points = located.map((a) => [a.latitude, a.longitude] as [number, number])

  return (
    <div className="activities-map" style={{ height }}>
      <MapContainer center={JARAGUA_CENTER} zoom={13} scrollWheelZoom={false} style={{ height: '100%' }}>
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
        <FitBounds points={points} />
        {located.map((a) => (
          <Marker key={a.id} position={[a.latitude, a.longitude]} icon={markerIconDefault}>
            <Popup>
              <div className="map-popup">
                <strong>{a.name}</strong>
                <span>{a.companyName} · {CATEGORY_LABEL[a.category]}</span>
                <span>{formatSchedule(a)}</span>
                {(a.location || a.neighborhood) && (
                  <span>{[a.location, a.neighborhood].filter(Boolean).join(' — ')}</span>
                )}
                {!hideDetailsLink && <Link to={`/atividades/${a.id}`}>Ver detalhes</Link>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
