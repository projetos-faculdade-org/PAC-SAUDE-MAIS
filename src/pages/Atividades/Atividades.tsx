import { useState } from 'react'
import { useActivities } from '../../contexts/ActivitiesContext'
import './Atividades.css'

export default function Atividades() {
  const { activities } = useActivities()
  const [search, setSearch] = useState('')

  const filtered = activities.filter(
    (act) =>
      act.name.toLowerCase().includes(search.toLowerCase()) ||
      act.companyName.toLowerCase().includes(search.toLowerCase()) ||
      act.description.toLowerCase().includes(search.toLowerCase())
  )

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

      {filtered.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🔍</span>
          <h3>Nenhuma atividade encontrada</h3>
          <p>Tente buscar por outro termo ou limpe o filtro.</p>
        </div>
      ) : (
        <div className="activities-grid">
          {filtered.map((activity) => (
            <div key={activity.id} className="activity-card">
              <div className="activity-card-header">
                <h2>{activity.name}</h2>
                <span className="company-badge">{activity.companyName}</span>
              </div>

              <p className="activity-description">{activity.description}</p>

              <div className="activity-info">
                <div className="info-item">
                  <span className="info-icon">🕐</span>
                  <span>{activity.schedule}</span>
                </div>
                {activity.location && (
                  <div className="info-item">
                    <span className="info-icon">📍</span>
                    <span>{activity.location}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
