import { Link } from 'react-router-dom'
import { useActivities } from '../../contexts/ActivitiesContext'
import { useEffect, useMemo, useState } from 'react'
import { LuBuilding2, LuCalendarX, LuClipboardList, LuHandshake, LuHourglass } from 'react-icons/lu'
import ActivityCard from '../../components/ActivityCard/ActivityCard'
import NewsCard from '../../components/NewsCard/NewsCard'
import { api } from '../../lib/api'
import type { Announcement } from '../../lib/announcement'
import { CATEGORY_LABEL, sortByNextOccurrence, type ActivityCategory } from '../../lib/activity'
import './Home.css'

export default function Home() {
  const { activities, loading } = useActivities()
  const [news, setNews] = useState<Announcement[]>([])

  useEffect(() => {
    api.get('/announcements?limit=3')
      .then((data: Announcement[]) => setNews(data))
      .catch(() => {})
  }, [])

  const preview = useMemo(() => sortByNextOccurrence(activities).slice(0, 6), [activities])

  // Atalhos só para categorias que têm atividade, das mais populares para as menos.
  const categories = useMemo(() => {
    const counts = new Map<ActivityCategory, number>()
    for (const a of activities) counts.set(a.category, (counts.get(a.category) ?? 0) + 1)
    return [...counts.entries()].sort((x, y) => y[1] - x[1])
  }, [activities])

  return (
    <main className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <h1>Jaraguá Mais Saudável</h1>
          <p className="hero-subtitle">
            Encontre academias, escolinhas esportivas, programas de bem-estar e muito mais.
          </p>
          <div className="hero-actions">
            <Link to="/atividades" className="btn-primary">Ver Atividades</Link>
            <Link to="/cadastro" className="btn-outline">Cadastre sua empresa</Link>
          </div>
        </div>
        <div className="hero-image">
          <img src="/jaraguasaudavel.png" alt="Saúde Mais" />
        </div>
      </section>

      {/* Notícias — só aparece quando o admin publicou algo */}
      {news.length > 0 && (
        <section className="news-section">
          <div className="preview-header">
            <div>
              <h2>Notícias e avisos</h2>
              <p>Eventos, campanhas e novidades da ORG Saúde Mais.</p>
            </div>
            <Link to="/noticias" className="btn-outline">Ver todas</Link>
          </div>
          <div className="news-grid">
            {news.map((item) => (
              <NewsCard key={item.id} announcement={item} compact />
            ))}
          </div>
        </section>
      )}

      {/* Como funciona */}
      <section className="how-it-works">
        <h2>Como funciona</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-icon"><LuBuilding2 /></div>
            <h3>Cadastre sua empresa</h3>
            <p>
              Registre sua empresa de saúde na plataforma e crie seu perfil
              com todas as informações necessárias.
            </p>
          </div>
          <div className="step-card">
            <div className="step-icon"><LuClipboardList /></div>
            <h3>Publique atividades</h3>
            <p>
              Adicione as atividades que você oferece: academias, escolinhas,
              natação, yoga e muito mais.
            </p>
          </div>
          <div className="step-card">
            <div className="step-icon"><LuHandshake /></div>
            <h3>Conecte-se</h3>
            <p>
              Alunos e interessados encontram suas atividades e entram em contato
              diretamente com sua empresa.
            </p>
          </div>
        </div>
      </section>

      {/* Prévia de atividades */}
      <section className="preview-activities">
        <div className="preview-header">
          <div>
            <h2>Próximas atividades</h2>
            <p>O que está acontecendo em Jaraguá — fale direto com quem organiza.</p>
          </div>
          <Link to="/atividades" className="btn-outline">Ver todas</Link>
        </div>

        {categories.length > 0 && (
          <div className="category-shortcuts">
            {categories.map(([category, count]) => (
              <Link key={category} to={`/atividades?categoria=${category}`} className="category-shortcut">
                {CATEGORY_LABEL[category]}
                <span>{count}</span>
              </Link>
            ))}
          </div>
        )}

        {loading ? (
          <div className="preview-empty">
            <LuHourglass />
            <p>Carregando atividades...</p>
          </div>
        ) : preview.length === 0 ? (
          <div className="preview-empty">
            <LuCalendarX />
            <p>Ainda não há atividades publicadas.</p>
            <Link to="/cadastro" className="btn-primary">Cadastre sua empresa e publique a primeira</Link>
          </div>
        ) : (
          <div className="preview-grid">
            {preview.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} compact />
            ))}
          </div>
        )}

        {activities.length > preview.length && (
          <div className="preview-more">
            <Link to="/atividades" className="btn-primary">
              Ver todas as {activities.length} atividades
            </Link>
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2>Quer ver o que está disponível?</h2>
        <p>Explore todas as atividades cadastradas na plataforma gratuitamente.</p>
        <Link to="/atividades" className="btn-primary">Explorar atividades</Link>
      </section>
    </main>
  )
}
