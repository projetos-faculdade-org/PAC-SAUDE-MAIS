import { useEffect, useState } from 'react'
import { LuHourglass, LuMegaphone, LuTriangleAlert } from 'react-icons/lu'
import { api } from '../../lib/api'
import type { Announcement } from '../../lib/announcement'
import NewsCard from '../../components/NewsCard/NewsCard'
import '../Atividades/Atividades.css'
import './Noticias.css'

export default function Noticias() {
  const [news, setNews] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    api.get('/announcements')
      .then((data: Announcement[]) => setNews(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="atividades-page">
      <div className="atividades-header">
        <h1>Notícias e avisos</h1>
        <p>Eventos, campanhas e novidades da ORG Saúde Mais.</p>
      </div>

      {loading ? (
        <div className="empty-state">
          <LuHourglass className="empty-icon" />
          <h3>Carregando notícias...</h3>
        </div>
      ) : error ? (
        <div className="empty-state">
          <LuTriangleAlert className="empty-icon empty-icon-error" />
          <h3>Não foi possível carregar as notícias</h3>
          <p>Tente novamente em alguns instantes.</p>
        </div>
      ) : news.length === 0 ? (
        <div className="empty-state">
          <LuMegaphone className="empty-icon" />
          <h3>Nenhuma notícia por enquanto</h3>
          <p>Volte em breve para ver as novidades.</p>
        </div>
      ) : (
        <div className="news-list">
          {news.map((item) => (
            <NewsCard key={item.id} announcement={item} />
          ))}
        </div>
      )}
    </main>
  )
}
