import { useState, useEffect, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useActivities, type Activity, type ActivityInput } from '../../contexts/ActivitiesContext'
import { api, ApiError } from '../../lib/api'
import {
  CATEGORIES,
  CATEGORY_LABEL,
  WEEKDAY_SHORT,
  formatSchedule,
  isPast,
  type ActivityCategory,
  type ScheduleType,
} from '../../lib/activity'
import { formatPhone } from '../../lib/phone'
import { LuCircleX, LuClipboardList, LuHourglass, LuMenu, LuPencil, LuTrash2, LuTriangleAlert, LuX } from 'react-icons/lu'
import './Dashboard.css'

type ActivityFormData = {
  name: string
  description: string
  category: ActivityCategory
  scheduleType: ScheduleType
  date: string
  weekdays: number[]
  startTime: string
  endTime: string
  schedule: string
  location: string
  neighborhood: string
  isFree: boolean
  price: string
  whatsapp: string
}

const EMPTY_FORM: ActivityFormData = {
  name: '',
  description: '',
  category: 'OUTRO',
  scheduleType: 'WEEKLY',
  date: '',
  weekdays: [],
  startTime: '',
  endTime: '',
  schedule: '',
  location: '',
  neighborhood: '',
  isFree: true,
  price: '',
  whatsapp: '',
}

const SCHEDULE_TYPE_LABEL: Record<ScheduleType, string> = {
  WEEKLY: 'Dias da semana',
  ONCE: 'Data específica',
  FLEXIBLE: 'Outro',
}

function StatusLayout({ onLogout, children }: { onLogout: () => void; children: ReactNode }) {
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
      <main className="dashboard-main">{children}</main>
    </div>
  )
}

function PendingScreen({ onLogout }: { onLogout: () => void }) {
  return (
    <StatusLayout onLogout={onLogout}>
      <div className="dashboard-empty status-screen">
        <LuHourglass className="empty-icon" />
        <h3>Aguardando aprovação</h3>
        <p>Seu cadastro foi recebido e está sendo analisado pela equipe administrativa.<br />Você será notificado assim que sua conta for aprovada.</p>
      </div>
    </StatusLayout>
  )
}

function RejectedScreen({ onLogout }: { onLogout: () => void }) {
  const { user, resubmit } = useAuth()
  const [form, setForm] = useState({
    companyName: user?.name ?? '',
    responsible: user?.responsible ?? '',
    phone: formatPhone(user?.phone),
  })
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    setError('')
    if (!form.companyName.trim() || !form.responsible.trim()) {
      setError('Preencha o nome da empresa e o responsável.')
      return
    }
    setSending(true)
    try {
      await resubmit({
        companyName: form.companyName.trim(),
        responsible: form.responsible.trim(),
        phone: form.phone.trim() || undefined,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao reenviar cadastro.')
    } finally {
      setSending(false)
    }
  }

  return (
    <StatusLayout onLogout={onLogout}>
      <div className="dashboard-empty status-screen">
        <LuCircleX className="empty-icon empty-icon-error" />
        <h3>Cadastro recusado</h3>
        <p>Seu cadastro não foi aprovado pela equipe administrativa. Corrija os dados abaixo e envie para uma nova análise.</p>

        {user?.rejectionReason && (
          <div className="rejection-reason">
            <strong>Motivo informado</strong>
            <p>{user.rejectionReason}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form resubmit-form">
          <div className="form-group">
            <label htmlFor="companyName">Nome da empresa *</label>
            <input
              id="companyName"
              value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="responsible">Responsável *</label>
            <input
              id="responsible"
              value={form.responsible}
              onChange={(e) => setForm({ ...form, responsible: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Telefone <span className="optional">(opcional)</span></label>
            <input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: formatPhone(e.target.value) })}
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="btn-save" disabled={sending}>
            {sending ? 'Enviando...' : 'Enviar para nova análise'}
          </button>
        </form>
      </div>
    </StatusLayout>
  )
}

export default function Dashboard() {
  const { user, logout, refreshUser } = useAuth()
  const { addActivity, editActivity, deleteActivity } = useActivities()
  const navigate = useNavigate()

  const [myActivities, setMyActivities] = useState<Activity[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Activity | null>(null)
  const [form, setForm] = useState<ActivityFormData>(EMPTY_FORM)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // O admin pode ter aprovado, recusado, desativado ou apagado a conta desde o login.
  useEffect(() => {
    refreshUser().catch((err) => {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        logout()
        navigate('/login', { replace: true, state: { message: err.message } })
      }
    })
  }, [refreshUser, logout, navigate])

  useEffect(() => {
    if (user?.status !== 'APPROVED') return
    api.get('/activities/mine')
      .then((data: Activity[]) => setMyActivities(data))
      .catch(() => {})
  }, [user?.status])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  if (user?.status === 'PENDING') return <PendingScreen onLogout={handleLogout} />
  if (user?.status === 'REJECTED') return <RejectedScreen onLogout={handleLogout} />

  function openCreate() {
    setEditing(null)
    setForm({ ...EMPTY_FORM, whatsapp: formatPhone(user?.phone) })
    setFormError('')
    setShowModal(true)
  }

  function openEdit(activity: Activity) {
    setEditing(activity)
    setForm({
      name: activity.name,
      description: activity.description,
      category: activity.category,
      scheduleType: activity.scheduleType,
      date: activity.date ?? '',
      weekdays: activity.weekdays,
      startTime: activity.startTime ?? '',
      endTime: activity.endTime ?? '',
      schedule: activity.schedule ?? '',
      location: activity.location ?? '',
      neighborhood: activity.neighborhood ?? '',
      isFree: activity.isFree,
      price: activity.price ?? '',
      whatsapp: formatPhone(activity.whatsapp),
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function toggleWeekday(day: number) {
    setForm((prev) => ({
      ...prev,
      weekdays: prev.weekdays.includes(day)
        ? prev.weekdays.filter((d) => d !== day)
        : [...prev.weekdays, day].sort(),
    }))
  }

  function toggleAllWeekdays() {
    setForm((prev) => ({
      ...prev,
      weekdays: prev.weekdays.length === 7 ? [] : [0, 1, 2, 3, 4, 5, 6],
    }))
  }

  function validate(): string | null {
    if (!form.name.trim() || !form.description.trim()) return 'Preencha o nome e a descrição.'
    if (form.scheduleType === 'FLEXIBLE' && !form.schedule.trim()) return 'Descreva o horário da atividade.'
    if (form.scheduleType === 'ONCE' && !form.date) return 'Informe a data da atividade.'
    if (form.scheduleType === 'WEEKLY' && form.weekdays.length === 0) return 'Selecione ao menos um dia da semana.'
    if (form.scheduleType !== 'FLEXIBLE' && !form.startTime) return 'Informe o horário de início.'
    if (form.endTime && form.startTime && form.endTime <= form.startTime) return 'O término deve ser depois do início.'
    if (!form.isFree && !form.price.trim()) return 'Informe o valor da atividade.'
    const digits = form.whatsapp.replace(/\D/g, '')
    if (digits.length < 10 || digits.length > 13) return 'Informe um WhatsApp válido com DDD.'
    return null
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    setFormError('')

    const invalid = validate()
    if (invalid) {
      setFormError(invalid)
      return
    }

    const payload: ActivityInput = {
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category,
      scheduleType: form.scheduleType,
      date: form.scheduleType === 'ONCE' ? form.date : null,
      weekdays: form.scheduleType === 'WEEKLY' ? form.weekdays : [],
      startTime: form.scheduleType === 'FLEXIBLE' ? null : form.startTime,
      endTime: form.scheduleType === 'FLEXIBLE' ? null : form.endTime || null,
      schedule: form.schedule.trim() || null,
      location: form.location.trim() || null,
      neighborhood: form.neighborhood.trim() || null,
      isFree: form.isFree,
      price: form.isFree ? null : form.price.trim(),
      whatsapp: form.whatsapp,
    }

    setSaving(true)
    try {
      if (editing) {
        const updated = await editActivity(editing.id, payload)
        setMyActivities((prev) => prev.map((a) => (a.id === updated.id ? updated : a)))
      } else {
        const created = await addActivity(payload)
        setMyActivities((prev) => [created, ...prev])
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
      setMyActivities((prev) => prev.filter((a) => a.id !== id))
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
              <LuMenu />
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
            <LuClipboardList className="empty-icon" />
            <h3>Nenhuma atividade cadastrada</h3>
            <p>Clique em "Nova atividade" para começar.</p>
          </div>
        ) : (
          <div className="activities-table-wrapper">
            <table className="activities-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Categoria</th>
                  <th>Quando</th>
                  <th>Local</th>
                  <th>WhatsApp</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {myActivities.map((activity) => (
                  <tr key={activity.id} className={isPast(activity) ? 'row-past' : undefined}>
                    <td>
                      <strong>{activity.name}</strong>
                      <div className="td-price">{activity.isFree ? 'Gratuita' : activity.price}</div>
                    </td>
                    <td>{CATEGORY_LABEL[activity.category]}</td>
                    <td className="td-schedule">
                      <span className="schedule-tag">{formatSchedule(activity)}</span>
                      {isPast(activity) && <span className="past-tag">Encerrada</span>}
                    </td>
                    <td>
                      {activity.location ?? '—'}
                      {activity.neighborhood && <div className="td-neighborhood">{activity.neighborhood}</div>}
                    </td>
                    <td className="td-nowrap">{formatPhone(activity.whatsapp) || '—'}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-edit"
                          onClick={() => openEdit(activity)}
                          title="Editar"
                        >
                          <LuPencil /> Editar
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => setDeleteConfirm(activity.id)}
                          title="Excluir"
                        >
                          <LuTrash2 /> Excluir
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
              <button className="modal-close" onClick={closeModal} aria-label="Fechar">
                <LuX />
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
                <label htmlFor="category">Categoria *</label>
                <select id="category" name="category" value={form.category} onChange={handleFormChange}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>
                  ))}
                </select>
              </div>

              <fieldset className="form-group form-fieldset">
                <legend>Quando acontece *</legend>
                <div className="segmented">
                  {(Object.keys(SCHEDULE_TYPE_LABEL) as ScheduleType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={form.scheduleType === t ? 'active' : undefined}
                      onClick={() => setForm({ ...form, scheduleType: t })}
                    >
                      {SCHEDULE_TYPE_LABEL[t]}
                    </button>
                  ))}
                </div>

                {form.scheduleType === 'WEEKLY' && (
                  <div className="weekday-picker">
                    {WEEKDAY_SHORT.map((label, day) => (
                      <button
                        key={day}
                        type="button"
                        className={form.weekdays.includes(day) ? 'active' : undefined}
                        onClick={() => toggleWeekday(day)}
                        aria-pressed={form.weekdays.includes(day)}
                      >
                        {label}
                      </button>
                    ))}
                    <button type="button" className="weekday-all" onClick={toggleAllWeekdays}>
                      {form.weekdays.length === 7 ? 'Limpar' : 'Todos os dias'}
                    </button>
                  </div>
                )}

                {form.scheduleType === 'ONCE' && (
                  <input
                    name="date"
                    type="date"
                    aria-label="Data"
                    value={form.date}
                    onChange={handleFormChange}
                  />
                )}

                {form.scheduleType !== 'FLEXIBLE' && (
                  <div className="form-row">
                    <label>
                      Início
                      <input name="startTime" type="time" value={form.startTime} onChange={handleFormChange} />
                    </label>
                    <label>
                      Término <span className="optional">(opcional)</span>
                      <input name="endTime" type="time" value={form.endTime} onChange={handleFormChange} />
                    </label>
                  </div>
                )}
              </fieldset>

              <div className="form-group">
                <label htmlFor="schedule">
                  {form.scheduleType === 'FLEXIBLE'
                    ? <>Descreva o horário *</>
                    : <>Observação sobre o horário <span className="optional">(opcional)</span></>}
                </label>
                <input
                  id="schedule"
                  name="schedule"
                  type="text"
                  placeholder={form.scheduleType === 'FLEXIBLE'
                    ? 'Ex.: Horário livre, das 6h às 22h'
                    : 'Ex.: Exceto feriados'}
                  value={form.schedule}
                  onChange={handleFormChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="location">Local <span className="optional">(opcional)</span></label>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    placeholder="Ex.: Parque Malwee"
                    value={form.location}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="neighborhood">Bairro <span className="optional">(opcional)</span></label>
                  <input
                    id="neighborhood"
                    name="neighborhood"
                    type="text"
                    placeholder="Ex.: Centro"
                    value={form.neighborhood}
                    onChange={handleFormChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={form.isFree}
                    onChange={(e) => setForm({ ...form, isFree: e.target.checked })}
                  />
                  Atividade gratuita
                </label>
                {!form.isFree && (
                  <input
                    name="price"
                    type="text"
                    aria-label="Valor"
                    placeholder="Ex.: R$ 80/mês"
                    value={form.price}
                    onChange={handleFormChange}
                  />
                )}
              </div>

              <div className="form-group">
                <label htmlFor="whatsapp">WhatsApp para inscrições *</label>
                <input
                  id="whatsapp"
                  name="whatsapp"
                  type="tel"
                  placeholder="(47) 99999-9999"
                  value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: formatPhone(e.target.value) })}
                  required
                />
                <small className="field-hint">O botão "Quero participar" abre uma conversa com este número.</small>
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
            <div className="confirm-icon"><LuTriangleAlert /></div>
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
