import { useMemo, useState } from 'react'
import { useActivities } from '../../contexts/ActivitiesContext'
import {
  CATEGORIES,
  CATEGORY_LABEL,
  formatSchedule,
  nextOccurrence,
  whatsappLink,
  type Activity,
  type ActivityCategory,
} from '../../lib/activity'
import './Atividades.css'

type WhenFilter = 'ALL' | 'TODAY' | 'WEEK'
type PriceFilter = 'ALL' | 'FREE' | 'PAID'

const DAY_MS = 24 * 60 * 60 * 1000

function matchesWhen(activity: Activity, when: WhenFilter, today: Date) {
  if (when === 'ALL') return true
  const next = nextOccurrence(activity, today)
  if (!next) return false
  const days = Math.round((next.getTime() - new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) / DAY_MS)
  return when === 'TODAY' ? days === 0 : days < 7
}

export default function Atividades() {
  const { activities, loading, error } = useActivities()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<ActivityCategory | 'ALL'>('ALL')
  const [neighborhood, setNeighborhood] = useState('ALL')
  const [price, setPrice] = useState<PriceFilter>('ALL')
  const [when, setWhen] = useState<WhenFilter>('ALL')

  const neighborhoods = useMemo(
    () => [...new Set(activities.map((a) => a.neighborhood).filter((n): n is string => !!n))].sort(),
    [activities]
  )

  const filtered = useMemo(() => {
    const today = new Date()
    const term = search.toLowerCase()

    return activities
      .filter(
        (act) =>
          act.name.toLowerCase().includes(term) ||
          act.companyName.toLowerCase().includes(term) ||
          act.description.toLowerCase().includes(term)
      )
      .filter((act) => category === 'ALL' || act.category === category)
      .filter((act) => neighborhood === 'ALL' || act.neighborhood === neighborhood)
      .filter((act) => price === 'ALL' || (price === 'FREE') === act.isFree)
      .filter((act) => matchesWhen(act, when, today))
      // Mais próximas primeiro; horários em texto livre vão para o fim.
      .map((act) => ({ act, next: nextOccurrence(act, today)?.getTime() ?? Infinity }))
      .sort((a, b) => a.next - b.next)
      .map(({ act }) => act)
  }, [activities, search, category, neighborhood, price, when])

  const hasFilters = search || category !== 'ALL' || neighborhood !== 'ALL' || price !== 'ALL' || when !== 'ALL'

  function clearFilters() {
    setSearch('')
    setCategory('ALL')
    setNeighborhood('ALL')
    setPrice('ALL')
    setWhen('ALL')
  }

  return (
    <main className="atividades-page">
      <div className="atividades-header">
        <h1>Atividades disponíveis</h1>
        <p>Explore todas as atividades cadastradas por empresas parceiras.</p>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar por nome, empresa ou descrição..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="filters-bar">
        <div className="chip-group" role="group" aria-label="Quando">
          {([['ALL', 'Qualquer dia'], ['TODAY', 'Hoje'], ['WEEK', 'Esta semana']] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={`chip${when === value ? ' active' : ''}`}
              onClick={() => setWhen(value)}
            >
              {label}
            </button>
          ))}
        </div>

        <select value={category} onChange={(e) => setCategory(e.target.value as ActivityCategory | 'ALL')} aria-label="Categoria">
          <option value="ALL">Todas as categorias</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>
          ))}
        </select>

        <select value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} aria-label="Bairro">
          <option value="ALL">Todos os bairros</option>
          {neighborhoods.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>

        <select value={price} onChange={(e) => setPrice(e.target.value as PriceFilter)} aria-label="Valor">
          <option value="ALL">Gratuitas e pagas</option>
          <option value="FREE">Só gratuitas</option>
          <option value="PAID">Só pagas</option>
        </select>

        {hasFilters && (
          <button type="button" className="btn-clear-filters" onClick={clearFilters}>
            Limpar filtros
          </button>
        )}
      </div>

      {loading ? (
        <div className="empty-state">
          <span className="empty-icon">⏳</span>
          <h3>Carregando atividades...</h3>
        </div>
      ) : error ? (
        <div className="empty-state">
          <span className="empty-icon">⚠️</span>
          <h3>Não foi possível carregar as atividades</h3>
          <p>Tente novamente em alguns instantes.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🔍</span>
          <h3>Nenhuma atividade encontrada</h3>
          <p>Tente buscar por outro termo ou limpe os filtros.</p>
        </div>
      ) : (
        <div className="activities-grid">
          {filtered.map((activity) => {
            const link = whatsappLink(activity)
            return (
              <div key={activity.id} className="activity-card">
                <div className="activity-card-header">
                  <h2>{activity.name}</h2>
                  <span className="company-badge">{activity.companyName}</span>
                </div>

                <div className="activity-tags">
                  <span className="category-tag">{CATEGORY_LABEL[activity.category]}</span>
                  <span className={`price-tag${activity.isFree ? ' free' : ''}`}>
                    {activity.isFree ? 'Gratuita' : activity.price}
                  </span>
                </div>

                <p className="activity-description">{activity.description}</p>

                <div className="activity-info">
                  <div className="info-item">
                    <span className="info-icon">🕐</span>
                    <span>
                      {formatSchedule(activity)}
                      {activity.scheduleType !== 'FLEXIBLE' && activity.schedule && (
                        <small className="info-note">{activity.schedule}</small>
                      )}
                    </span>
                  </div>
                  {(activity.location || activity.neighborhood) && (
                    <div className="info-item">
                      <span className="info-icon">📍</span>
                      <span>{[activity.location, activity.neighborhood].filter(Boolean).join(' — ')}</span>
                    </div>
                  )}
                </div>

                {link && (
                  <a className="btn-participate" href={link} target="_blank" rel="noopener noreferrer">
                    Quero participar
                  </a>
                )}
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
