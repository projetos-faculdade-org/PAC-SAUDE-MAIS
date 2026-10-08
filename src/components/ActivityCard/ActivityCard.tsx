import { Link } from 'react-router-dom'
import { FaWhatsapp } from 'react-icons/fa'
import { LuClock, LuMapPin } from 'react-icons/lu'
import { CATEGORY_LABEL, formatSchedule, whatsappLink, type Activity } from '../../lib/activity'
import './ActivityCard.css'

interface Props {
  activity: Activity
  /** Descrição limitada a 3 linhas — usado na landing page. */
  compact?: boolean
  /** Esconde o selo da empresa — usado no perfil da própria empresa. */
  hideCompany?: boolean
}

export default function ActivityCard({ activity, compact = false, hideCompany = false }: Props) {
  const link = whatsappLink(activity)

  return (
    <div className={`activity-card${compact ? ' compact' : ''}`}>
      <div className="activity-card-header">
        <h2>
          <Link to={`/atividades/${activity.id}`} className="activity-card-title">{activity.name}</Link>
        </h2>
        {!hideCompany && (
          <Link to={`/empresas/${activity.companyId}`} className="company-badge">{activity.companyName}</Link>
        )}
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
          <LuClock className="info-icon" />
          <span>
            {formatSchedule(activity)}
            {activity.scheduleType !== 'FLEXIBLE' && activity.schedule && (
              <small className="info-note">{activity.schedule}</small>
            )}
          </span>
        </div>
        {(activity.location || activity.neighborhood) && (
          <div className="info-item">
            <LuMapPin className="info-icon" />
            <span>{[activity.location, activity.neighborhood].filter(Boolean).join(' — ')}</span>
          </div>
        )}
      </div>

      <Link to={`/atividades/${activity.id}`} className="activity-card-more">Ver detalhes</Link>

      {link && (
        <a className="btn-participate" href={link} target="_blank" rel="noopener noreferrer">
          <FaWhatsapp /> Quero participar
        </a>
      )}
    </div>
  )
}
