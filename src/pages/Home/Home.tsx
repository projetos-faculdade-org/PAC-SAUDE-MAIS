import { Link } from 'react-router-dom'
import { useActivities } from '../../contexts/ActivitiesContext'
import './Home.css'

export default function Home() {
  const { activities } = useActivities()
  const preview = activities.slice(0, 3)

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

      {/* Como funciona */}
      <section className="how-it-works">
        <h2>Como funciona</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-icon">🏢</div>
            <h3>Cadastre sua empresa</h3>
            <p>
              Registre sua empresa de saúde na plataforma e crie seu perfil
              com todas as informações necessárias.
            </p>
          </div>
          <div className="step-card">
            <div className="step-icon">📋</div>
            <h3>Publique atividades</h3>
            <p>
              Adicione as atividades que você oferece: academias, escolinhas,
              natação, yoga e muito mais.
            </p>
          </div>
          <div className="step-card">
            <div className="step-icon">🤝</div>
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
            <h2>Atividades em destaque</h2>
            <p>Veja algumas das atividades disponíveis na plataforma.</p>
          </div>
          <Link to="/atividades" className="btn-outline">Ver todas</Link>
        </div>

        <div className="preview-grid">
          {preview.map((activity) => (
            <div key={activity.id} className="preview-card">
              <div className="preview-card-top">
                <h3>{activity.name}</h3>
                <span className="preview-badge">{activity.companyName}</span>
              </div>
              <p className="preview-description">{activity.description}</p>
              <div className="preview-info">
                <span>🕐 {activity.schedule}</span>
                {activity.location && <span>📍 {activity.location}</span>}
              </div>
            </div>
          ))}
        </div>

        {activities.length > 3 && (
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
