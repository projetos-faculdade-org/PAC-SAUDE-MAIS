import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FaWhatsapp } from 'react-icons/fa'
import { LuArrowLeft, LuBuilding2, LuClock, LuHourglass, LuMapPin, LuSearchX, LuShare2, LuTag } from 'react-icons/lu'
import { api, ApiError } from '../../lib/api'
import {
  CATEGORY_LABEL,
  formatSchedule,
  hasCoordinates,
  isPast,
  whatsappLink,
  type Activity,
} from '../../lib/activity'
import ActivitiesMap from '../../components/Map/ActivitiesMap'
import '../Atividades/Atividades.css'
import './AtividadeDetalhe.css'

export default function AtividadeDetalhe() {
  const { id } = useParams<{ id: string }>()
  // Guarda o id junto do resultado: ao navegar para outro id, o "carregando" vem de graça.
  const [result, setResult] = useState<{ id?: string; data?: Activity; status?: number }>({})
  const loading = result.id !== id
  const activity = loading ? null : result.data ?? null
  const notFound = !loading && result.status === 404
  const error = !loading && !activity && !notFound
  const [shareMessage, setShareMessage] = useState('')

  useEffect(() => {
    api.get(`/activities/${id}`)
      .then((data: Activity) => setResult({ id, data }))
      .catch((err) => setResult({ id, status: err instanceof ApiError ? err.status : 0 }))
  }, [id])

  useEffect(() => {
    if (activity) document.title = `${activity.name} — Jaraguá Mais Saudável`
    return () => { document.title = 'Jaraguá Mais Saudável' }
  }, [activity])

  async function handleShare() {
    if (!activity) return
    const url = window.location.href
    // No celular abre a folha de compartilhamento nativa; no computador copia o link.
    if (navigator.share) {
      try {
        await navigator.share({ title: activity.name, text: `${activity.name} — ${activity.companyName}`, url })
      } catch {
        // usuário cancelou
      }
      return
    }
    try {
      await navigator.clipboard.writeText(url)
      setShareMessage('Link copiado!')
    } catch {
      setShareMessage(url)
    }
    setTimeout(() => setShareMessage(''), 3000)
  }

  if (loading) {
    return (
      <main className="atividades-page">
        <div className="empty-state">
          <LuHourglass className="empty-icon" />
          <h3>Carregando atividade...</h3>
        </div>
      </main>
    )
  }

  if (notFound || error || !activity) {
    return (
      <main className="atividades-page">
        <div className="empty-state">
          <LuSearchX className="empty-icon" />
          <h3>{notFound ? 'Atividade não encontrada' : 'Não foi possível carregar a atividade'}</h3>
          <p>{notFound ? 'Ela pode ter sido removida pela empresa.' : 'Tente novamente em alguns instantes.'}</p>
          <Link to="/atividades" className="detail-back">Ver todas as atividades</Link>
        </div>
      </main>
    )
  }

  const link = whatsappLink(activity)
  const past = isPast(activity)

  return (
    <main className="atividades-page">
      <div className="atividades-header detail-header">
        <Link to="/atividades" className="detail-back-light"><LuArrowLeft /> Todas as atividades</Link>
        <h1>{activity.name}</h1>
        <div className="detail-header-tags">
          <span className="detail-tag">{CATEGORY_LABEL[activity.category]}</span>
          <span className={`detail-tag${activity.isFree ? ' free' : ''}`}>
            {activity.isFree ? 'Gratuita' : activity.price}
          </span>
          {past && <span className="detail-tag past">Encerrada</span>}
        </div>
      </div>

      <div className="detail-layout">
        <section className="detail-main">
          <h2>Sobre a atividade</h2>
          <p className="detail-description">{activity.description}</p>

          {hasCoordinates(activity) && (
            <>
              <h2>Onde fica</h2>
              <ActivitiesMap activities={[activity]} height="320px" hideDetailsLink />
            </>
          )}
        </section>

        <aside className="detail-side">
          <div className="detail-card">
            <div className="detail-info">
              <LuClock className="info-icon" />
              <div>
                <strong>Quando</strong>
                <span>{formatSchedule(activity)}</span>
                {activity.scheduleType !== 'FLEXIBLE' && activity.schedule && <small>{activity.schedule}</small>}
              </div>
            </div>

            {(activity.location || activity.neighborhood) && (
              <div className="detail-info">
                <LuMapPin className="info-icon" />
                <div>
                  <strong>Onde</strong>
                  {activity.location && <span>{activity.location}</span>}
                  {activity.neighborhood && <small>{activity.neighborhood}</small>}
                </div>
              </div>
            )}

            <div className="detail-info">
              <LuTag className="info-icon" />
              <div>
                <strong>Valor</strong>
                <span>{activity.isFree ? 'Gratuita' : activity.price}</span>
              </div>
            </div>

            {link && !past && (
              <a className="btn-participate" href={link} target="_blank" rel="noopener noreferrer">
                <FaWhatsapp /> Quero participar
              </a>
            )}

            <button type="button" className="btn-share" onClick={handleShare}>
              <LuShare2 /> {shareMessage || 'Compartilhar'}
            </button>
          </div>

          <Link to={`/empresas/${activity.companyId}`} className="detail-card detail-company">
            <LuBuilding2 className="detail-company-icon" />
            <div>
              <small>Oferecida por</small>
              <strong>{activity.companyName}</strong>
              <span>Ver perfil e outras atividades</span>
            </div>
          </Link>
        </aside>
      </div>
    </main>
  )
}
