import { LuArrowUpRight, LuCalendar } from 'react-icons/lu'
import { formatAnnouncementDate, type Announcement } from '../../lib/announcement'
import './NewsCard.css'

interface Props {
  announcement: Announcement
  /** Texto limitado a 4 linhas — usado na landing page. */
  compact?: boolean
}

export default function NewsCard({ announcement, compact = false }: Props) {
  return (
    <article className={`news-card${compact ? ' compact' : ''}`}>
      <span className="news-date">
        <LuCalendar /> {formatAnnouncementDate(announcement.createdAt)}
      </span>
      <h3>{announcement.title}</h3>
      <p className="news-content">{announcement.content}</p>
      {announcement.linkUrl && (
        <a className="news-link" href={announcement.linkUrl} target="_blank" rel="noopener noreferrer">
          Saiba mais <LuArrowUpRight />
        </a>
      )}
    </article>
  )
}
