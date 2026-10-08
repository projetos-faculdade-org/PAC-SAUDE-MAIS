import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { LuArrowLeft, LuClipboardList, LuHourglass, LuSearchX } from 'react-icons/lu'
import { api, ApiError } from '../../lib/api'
import { CATEGORY_LABEL, hasCoordinates, sortByNextOccurrence, type Activity } from '../../lib/activity'
import ActivityCard from '../../components/ActivityCard/ActivityCard'
import ActivitiesMap from '../../components/Map/ActivitiesMap'
import '../Atividades/Atividades.css'
import '../AtividadeDetalhe/AtividadeDetalhe.css'
import './EmpresaPerfil.css'

interface CompanyProfile {
  id: string
  name: string
  memberSince: string // YYYY-MM-DD
  activities: Activity[]
}

export default function EmpresaPerfil() {
  const { id } = useParams<{ id: string }>()
  // Guarda o id junto do resultado: ao navegar para outro id, o "carregando" vem de graça.
  const [result, setResult] = useState<{ id?: string; data?: CompanyProfile; status?: number }>({})
  const loading = result.id !== id
  const company = loading ? null : result.data ?? null
  const notFound = !loading && result.status === 404
  const error = !loading && !company && !notFound

  useEffect(() => {
    api.get(`/companies/${id}`)
      .then((data: CompanyProfile) => setResult({ id, data }))
      .catch((err) => setResult({ id, status: err instanceof ApiError ? err.status : 0 }))
  }, [id])

  useEffect(() => {
    if (company) document.title = `${company.name} — Jaraguá Mais Saudável`
    return () => { document.title = 'Jaraguá Mais Saudável' }
  }, [company])

  const activities = useMemo(() => (company ? sortByNextOccurrence(company.activities) : []), [company])
  const categories = useMemo(() => [...new Set(activities.map((a) => CATEGORY_LABEL[a.category]))], [activities])
  const neighborhoods = useMemo(
    () => [...new Set(activities.map((a) => a.neighborhood).filter((n): n is string => !!n))],
    [activities]
  )

  if (loading) {
    return (
      <main className="atividades-page">
        <div className="empty-state">
          <LuHourglass className="empty-icon" />
          <h3>Carregando empresa...</h3>
        </div>
      </main>
    )
  }

  if (notFound || error || !company) {
    return (
      <main className="atividades-page">
        <div className="empty-state">
          <LuSearchX className="empty-icon" />
          <h3>{notFound ? 'Empresa não encontrada' : 'Não foi possível carregar a empresa'}</h3>
          <p>{notFound ? 'O link pode estar errado ou a empresa não está mais na plataforma.' : 'Tente novamente em alguns instantes.'}</p>
          <Link to="/atividades" className="detail-back">Ver todas as atividades</Link>
        </div>
      </main>
    )
  }

  const memberYear = company.memberSince.slice(0, 4)

  return (
    <main className="atividades-page">
      <div className="atividades-header detail-header">
        <Link to="/atividades" className="detail-back-light"><LuArrowLeft /> Todas as atividades</Link>
        <div className="profile-heading">
          <div className="profile-avatar" aria-hidden>{company.name.charAt(0).toUpperCase()}</div>
          <div>
            <h1>{company.name}</h1>
            <p>Empresa parceira desde {memberYear}</p>
          </div>
        </div>

        <div className="profile-stats">
          <div>
            <strong>{activities.length}</strong>
            <span>{activities.length === 1 ? 'atividade' : 'atividades'}</span>
          </div>
          {categories.length > 0 && (
            <div>
              <strong>{categories.length}</strong>
              <span>{categories.length === 1 ? 'categoria' : 'categorias'}</span>
            </div>
          )}
          {neighborhoods.length > 0 && (
            <div>
              <strong>{neighborhoods.length}</strong>
              <span>{neighborhoods.length === 1 ? 'bairro' : 'bairros'}</span>
            </div>
          )}
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="empty-state">
          <LuClipboardList className="empty-icon" />
          <h3>Nenhuma atividade no momento</h3>
          <p>Esta empresa ainda não tem atividades publicadas.</p>
        </div>
      ) : (
        <>
          {activities.some(hasCoordinates) && (
            <section className="profile-map">
              <h2>Onde acontecem</h2>
              <ActivitiesMap activities={activities} height="360px" />
            </section>
          )}

          <h2 className="profile-section-title">Atividades</h2>
          <div className="activities-grid profile-grid">
            {activities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} hideCompany />
            ))}
          </div>
        </>
      )}
    </main>
  )
}
