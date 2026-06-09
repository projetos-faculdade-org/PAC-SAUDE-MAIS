import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useActivities, type Activity } from '../../contexts/ActivitiesContext'
import './Dashboard.css'

type ActivityFormData = {
  name: string
  description: string
  schedule: string
  location: string
}

const EMPTY_FORM: ActivityFormData = {
  name: '',
  description: '',
  schedule: '',
  location: '',
}

function PendingScreen({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="dashboard-page">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <a href="/"><img src="/jaraguasaudavel.png" alt="Saúde Mais" /></a>
        </div>
        <nav className="sidebar-nav">
          <span className="sidebar-nav-item active">Minha Conta</span>
        </nav>
        <div className="sidebar-footer">
          <button onClick={onLogout} className="btn-logout">Sair</button>
        </div>
      </aside>
      <main className="dashboard-main">
        <div className="dashboard-empty status-screen">
          <span className="empty-icon">⏳</span>
          <h3>Aguardando aprovação</h3>
          <p>Seu cadastro foi recebido e está sendo analisado pela equipe administrativa.<br />Você será notificado assim que sua conta for aprovada.</p>
        </div>
      </main>
    </div>
  )
}

function RejectedScreen({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="dashboard-page">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <a href="/"><img src="/jaraguasaudavel.png" alt="Saúde Mais" /></a>
        </div>
        <nav className="sidebar-nav">
          <span className="sidebar-nav-item active">Minha Conta</span>
        </nav>
        <div className="sidebar-footer">
          <button onClick={onLogout} className="btn-logout">Sair</button>
        </div>
      </aside>
      <main className="dashboard-main">
        <div className="dashboard-empty status-screen">
          <span className="empty-icon">❌</span>
          <h3>Cadastro recusado</h3>
          <p>Infelizmente seu cadastro não foi aprovado pela equipe administrativa.<br />Entre em contato conosco para mais informações.</p>
        </div>
      </main>
    </div>
  )
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const { activities, addActivity, editActivity, deleteActivity } = useActivities()
  const navigate = useNavigate()

  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Activity | null>(null)
  const [form, setForm] = useState<ActivityFormData>(EMPTY_FORM)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const myActivities = activities.filter((a) => a.companyId === user?.id)

  if (user?.status === 'PENDING') return <PendingScreen onLogout={() => { logout(); navigate('/login') }} />
  if (user?.status === 'REJECTED') return <RejectedScreen onLogout={() => { logout(); navigate('/login') }} />

  function handleLogout() {
    logout()
    navigate('/login')
  }

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setShowModal(true)
  }

  function openEdit(activity: Activity) {
    setEditing(activity)
    setForm({
      name: activity.name,
      description: activity.description,
      schedule: activity.schedule,
      location: activity.location ?? '',
    })
    setFormError('')
    setShowModal(true)
  }

  function closeModal() {
    if (saving) return
    setShowModal(false)
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormError('')
  }

  function handleFormChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    setFormError('')

    if (!form.name.trim() || !form.description.trim() || !form.schedule.trim()) {
      setFormError('Preencha todos os campos obrigatórios.')
      return
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      schedule: form.schedule.trim(),
      location: form.location.trim() || undefined,
    }

    setSaving(true)
    try {
      if (editing) {
        await editActivity(editing.id, payload)
      } else {
        await addActivity(payload)
      }
      closeModal()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erro ao salvar atividade.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    setDeleting(true)
    try {
      await deleteActivity(id)
      setDeleteConfirm(null)
    } catch {
      setDeleteConfirm(null)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="dashboard-page">
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="sidebar-logo">
          <a href="/" onClick={() => setSidebarOpen(false)}>
            <img src="/jaraguasaudavel.png" alt="Saúde Mais" />
          </a>
        </div>
        <nav className="sidebar-nav">
          <span className="sidebar-nav-item active">Minhas Atividades</span>
          <a className="sidebar-nav-item active" href='/' onClick={() => setSidebarOpen(false)}>Voltar para Home</a>
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">{user?.name.charAt(0)}</div>
            <div className="user-info">
              <strong>{user?.name}</strong>
              <small>{user?.email}</small>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-logout">
            Sair
          </button>
        </div>
      </aside>

      {/* Main content */}
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
              <h1>Minhas Atividades</h1>
              <p>Gerencie as atividades da sua empresa.</p>
            </div>
          </div>
          <button onClick={openCreate} className="btn-new">
            + Nova atividade
          </button>
        </div>

        {myActivities.length === 0 ? (
          <div className="dashboard-empty">
            <span className="empty-icon">📋</span>
            <h3>Nenhuma atividade cadastrada</h3>
            <p>Clique em "Nova atividade" para começar.</p>
          </div>
        ) : (
          <div className="activities-table-wrapper">
            <table className="activities-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Descrição</th>
                  <th>Horário</th>
                  <th>Local</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {myActivities.map((activity) => (
                  <tr key={activity.id}>
                    <td>
                      <strong>{activity.name}</strong>
                    </td>
                    <td className="td-description">{activity.description}</td>
                    <td className="td-schedule">
                      <span className="schedule-tag">{activity.schedule}</span>
                    </td>
                    <td>{activity.location ?? '—'}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-edit"
                          onClick={() => openEdit(activity)}
                          title="Editar"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => setDeleteConfirm(activity.id)}
                          title="Excluir"
                        >
                          🗑️ Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Modal: criar / editar */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? 'Editar atividade' : 'Nova atividade'}</h2>
              <button className="modal-close" onClick={closeModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="name">Nome da atividade *</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Ex.: Yoga Matinal"
                  value={form.name}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Descrição *</label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Descreva a atividade, nível de dificuldade, público-alvo..."
                  value={form.description}
                  onChange={handleFormChange}
                  rows={4}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="schedule">Horário *</label>
                <input
                  id="schedule"
                  name="schedule"
                  type="text"
                  placeholder="Ex.: Seg / Qua / Sex • 07h – 08h"
                  value={form.schedule}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="location">Local <span className="optional">(opcional)</span></label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  placeholder="Ex.: Salão Principal, Piscina Olímpica..."
                  value={form.location}
                  onChange={handleFormChange}
                />
              </div>

              {formError && <p className="auth-error">{formError}</p>}

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={closeModal} disabled={saving}>
                  Cancelar
                </button>
                <button type="submit" className="btn-save" disabled={saving}>
                  {saving ? 'Salvando...' : editing ? 'Salvar alterações' : 'Criar atividade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: confirmar exclusão */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => !deleting && setDeleteConfirm(null)}>
          <div className="modal modal-confirm" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon">⚠️</div>
            <h2>Excluir atividade?</h2>
            <p>
              Esta ação não pode ser desfeita. A atividade será removida da plataforma.
            </p>
            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
              >
                Cancelar
              </button>
              <button
                className="btn-delete-confirm"
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleting}
              >
                {deleting ? 'Excluindo...' : 'Sim, excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
