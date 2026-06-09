import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { adminApi } from '../../lib/api'
import '../Empresa/Dashboard.css'
import './AdminDashboard.css'

type CompanyStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

interface CompanyItem {
  id: string
  name: string
  email: string
  responsible: string
  phone?: string
  status: CompanyStatus
  createdAt: string
}

type FilterStatus = 'ALL' | CompanyStatus

const STATUS_LABEL: Record<CompanyStatus, string> = {
  PENDING: 'Pendente',
  APPROVED: 'Aprovada',
  REJECTED: 'Recusada',
}

export default function AdminDashboard() {
  const { adminLogout } = useAuth()
  const navigate = useNavigate()

  const [companies, setCompanies] = useState<CompanyItem[]>([])
  const [filter, setFilter] = useState<FilterStatus>('ALL')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const fetchCompanies = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminApi.get('/admin/companies')
      setCompanies(data)
    } catch {
      // mantém lista vazia
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCompanies()
  }, [fetchCompanies])

  function handleLogout() {
    adminLogout()
    navigate('/admin/login')
  }

  async function handleApprove(id: string) {
    setActionLoading(id + '-approve')
    try {
      const updated = await adminApi.put(`/admin/companies/${id}/approve`, {})
      setCompanies(prev => prev.map(c => c.id === id ? { ...c, status: updated.status } : c))
    } finally {
      setActionLoading(null)
    }
  }

  async function handleReject(id: string) {
    setActionLoading(id + '-reject')
    try {
      const updated = await adminApi.put(`/admin/companies/${id}/reject`, {})
      setCompanies(prev => prev.map(c => c.id === id ? { ...c, status: updated.status } : c))
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = filter === 'ALL' ? companies : companies.filter(c => c.status === filter)

  const counts = {
    ALL: companies.length,
    PENDING: companies.filter(c => c.status === 'PENDING').length,
    APPROVED: companies.filter(c => c.status === 'APPROVED').length,
    REJECTED: companies.filter(c => c.status === 'REJECTED').length,
  }

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
          <span className="sidebar-nav-item active">Empresas Cadastradas</span>
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
        <div className="dashboard-topbar">
          <div className="topbar-left">
            <button
              className="sidebar-toggle"
              aria-label="Abrir menu"
              onClick={() => setSidebarOpen(prev => !prev)}
            >
              ☰
            </button>
            <div>
              <h1>Empresas Cadastradas</h1>
              <p>Aprove ou recuse empresas que se cadastraram na plataforma.</p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="admin-filters">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as FilterStatus[]).map(s => (
            <button
              key={s}
              className={`filter-btn${filter === s ? ' active' : ''}${s !== 'ALL' ? ` filter-${s.toLowerCase()}` : ''}`}
              onClick={() => setFilter(s)}
            >
              {s === 'ALL' ? 'Todas' : STATUS_LABEL[s as CompanyStatus]}
              <span className="filter-count">{counts[s]}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="dashboard-empty">
            <span className="empty-icon">⏳</span>
            <h3>Carregando empresas...</h3>
          </div>
        ) : filtered.length === 0 ? (
          <div className="dashboard-empty">
            <span className="empty-icon">🏢</span>
            <h3>Nenhuma empresa encontrada</h3>
            <p>Não há empresas com o filtro selecionado.</p>
          </div>
        ) : (
          <div className="activities-table-wrapper">
            <table className="activities-table">
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>Responsável</th>
                  <th>E-mail</th>
                  <th>Cadastro</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(company => (
                  <tr key={company.id}>
                    <td><strong>{company.name}</strong></td>
                    <td>{company.responsible}</td>
                    <td>{company.email}</td>
                    <td>{new Date(company.createdAt).toLocaleDateString('pt-BR')}</td>
                    <td>
                      <span className={`status-badge status-${company.status.toLowerCase()}`}>
                        {STATUS_LABEL[company.status]}
                      </span>
                    </td>
                    <td>
                      {company.status === 'PENDING' && (
                        <div className="action-buttons">
                          <button
                            className="btn-approve"
                            onClick={() => handleApprove(company.id)}
                            disabled={actionLoading !== null}
                          >
                            {actionLoading === company.id + '-approve' ? '...' : '✓ Aprovar'}
                          </button>
                          <button
                            className="btn-reject"
                            onClick={() => handleReject(company.id)}
                            disabled={actionLoading !== null}
                          >
                            {actionLoading === company.id + '-reject' ? '...' : '✗ Recusar'}
                          </button>
                        </div>
                      )}
                      {company.status === 'APPROVED' && (
                        <button
                          className="btn-reject"
                          onClick={() => handleReject(company.id)}
                          disabled={actionLoading !== null}
                        >
                          {actionLoading === company.id + '-reject' ? '...' : '✗ Recusar'}
                        </button>
                      )}
                      {company.status === 'REJECTED' && (
                        <button
                          className="btn-approve"
                          onClick={() => handleApprove(company.id)}
                          disabled={actionLoading !== null}
                        >
                          {actionLoading === company.id + '-approve' ? '...' : '✓ Aprovar'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
