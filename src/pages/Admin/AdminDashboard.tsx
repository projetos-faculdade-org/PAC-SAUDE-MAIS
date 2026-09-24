import { useState, type ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { LuBuilding2, LuClipboardList, LuMegaphone } from 'react-icons/lu'
import { useAuth } from '../../contexts/AuthContext'
import AdminCompanies from './AdminCompanies'
import AdminActivities from './AdminActivities'
import AdminNews from './AdminNews'
import '../Empresa/Dashboard.css'
import './AdminDashboard.css'

type Section = 'empresas' | 'atividades' | 'noticias'

const SECTIONS: { key: Section; label: string; icon: ReactNode }[] = [
  { key: 'empresas', label: 'Empresas', icon: <LuBuilding2 /> },
  { key: 'atividades', label: 'Atividades', icon: <LuClipboardList /> },
  { key: 'noticias', label: 'Notícias', icon: <LuMegaphone /> },
]

export default function AdminDashboard() {
  const { adminLogout } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const param = searchParams.get('secao') as Section | null
  const section: Section = SECTIONS.some((s) => s.key === param) ? param! : 'empresas'

  function goTo(key: Section) {
    setSearchParams({ secao: key })
    setSidebarOpen(false)
  }

  function handleLogout() {
    adminLogout()
    navigate('/login')
  }

  const toggleSidebar = () => setSidebarOpen((prev) => !prev)

  return (
    <div className="dashboard-page">
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="sidebar-logo">
          <a href="/" onClick={() => setSidebarOpen(false)}>
            <img src="/jaraguasaudavel.png" alt="Saúde Mais" />
          </a>
        </div>
        <nav className="sidebar-nav">
          {SECTIONS.map((s) => (
            <button
              key={s.key}
              type="button"
              className={`sidebar-nav-item${section === s.key ? ' active' : ''}`}
              onClick={() => goTo(s.key)}
            >
              {s.icon} {s.label}
            </button>
          ))}
          <a className="sidebar-nav-item" href="/" onClick={() => setSidebarOpen(false)}>Voltar para Home</a>
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar admin-avatar">A</div>
            <div className="user-info">
              <strong>Administrador</strong>
              <small>Painel Admin</small>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-logout">
            Sair
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        {section === 'empresas' && <AdminCompanies onMenu={toggleSidebar} />}
        {section === 'atividades' && <AdminActivities onMenu={toggleSidebar} />}
        {section === 'noticias' && <AdminNews onMenu={toggleSidebar} />}
      </main>
    </div>
  )
}
