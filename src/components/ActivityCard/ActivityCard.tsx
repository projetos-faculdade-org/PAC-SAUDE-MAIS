import { FaWhatsapp } from 'react-icons/fa'
import { LuClock, LuMapPin } from 'react-icons/lu'
import { CATEGORY_LABEL, formatSchedule, whatsappLink, type Activity } from '../../lib/activity'
import './ActivityCard.css'

interface Props {
  activity: Activity
  /** Descrição limitada a 3 linhas — usado na landing page. */
  compact?: boolean
}

export default function ActivityCard({ activity, compact = false }: Props) {
  const link = whatsappLink(activity)

  return (
    <div className={`activity-card${compact ? ' compact' : ''}`}>
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

      {link && (
        <a className="btn-participate" href={link} target="_blank" rel="noopener noreferrer">
          <FaWhatsapp /> Quero participar
        </a>
      )}
    </div>
  )
}
