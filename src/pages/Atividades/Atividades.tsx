import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useActivities } from '../../contexts/ActivitiesContext'
import {
  CATEGORIES,
  CATEGORY_LABEL,
  nextOccurrence,
  sortByNextOccurrence,
  type Activity,
  type ActivityCategory,
} from '../../lib/activity'
import { LuHourglass, LuSearchX, LuTriangleAlert } from 'react-icons/lu'
import ActivityCard from '../../components/ActivityCard/ActivityCard'
import './Atividades.css'

type WhenFilter = 'ALL' | 'TODAY' | 'WEEK'
type PriceFilter = 'ALL' | 'FREE' | 'PAID'

const DAY_MS = 24 * 60 * 60 * 1000

// Minúsculo e sem acento, para "danca" achar "Dança".
function normalize(text: string) {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function searchableText(act: Activity) {
  return normalize(
    [act.name, act.companyName, act.description, CATEGORY_LABEL[act.category], act.location, act.neighborhood]
      .filter(Boolean)
      .join(' ')
  )
}

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
  const [searchParams] = useSearchParams()
  const initialCategory = searchParams.get('categoria') as ActivityCategory | null
  const [category, setCategory] = useState<ActivityCategory | 'ALL'>(
    initialCategory && CATEGORIES.includes(initialCategory) ? initialCategory : 'ALL'
  )
  const [neighborhood, setNeighborhood] = useState('ALL')
  const [price, setPrice] = useState<PriceFilter>('ALL')
  const [when, setWhen] = useState<WhenFilter>('ALL')

  const neighborhoods = useMemo(
    () => [...new Set(activities.map((a) => a.neighborhood).filter((n): n is string => !!n))].sort(),
    [activities]
  )

  const filtered = useMemo(() => {
    const today = new Date()
    const terms = normalize(search).split(/\s+/).filter(Boolean)

    const matches = activities
      // Todas as palavras precisam aparecer em algum campo (nome, empresa, categoria, local...).
      .filter((act) => {
        const text = searchableText(act)
        return terms.every((t) => text.includes(t))
      })
      .filter((act) => category === 'ALL' || act.category === category)
      .filter((act) => neighborhood === 'ALL' || act.neighborhood === neighborhood)
      .filter((act) => price === 'ALL' || (price === 'FREE') === act.isFree)
      .filter((act) => matchesWhen(act, when, today))

    return sortByNextOccurrence(matches, today)
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
            placeholder="Buscar por atividade, categoria, empresa ou bairro..."
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
          <LuHourglass className="empty-icon" />
          <h3>Carregando atividades...</h3>
        </div>
      ) : error ? (
        <div className="empty-state">
          <LuTriangleAlert className="empty-icon empty-icon-error" />
          <h3>Não foi possível carregar as atividades</h3>
          <p>Tente novamente em alguns instantes.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <LuSearchX className="empty-icon" />
          <h3>Nenhuma atividade encontrada</h3>
          <p>Tente buscar por outro termo ou limpe os filtros.</p>
        </div>
      ) : (
        <div className="activities-grid">
          {filtered.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      )}
    </main>
  )
}
