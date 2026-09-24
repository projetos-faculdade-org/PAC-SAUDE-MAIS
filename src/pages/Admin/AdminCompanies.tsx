import { useState, useEffect } from 'react'
import { LuBuilding2, LuCheck, LuHourglass, LuPencil, LuPower, LuTrash2, LuX } from 'react-icons/lu'
import { adminApi } from '../../lib/api'
import { formatPhone } from '../../lib/phone'
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal'
import AdminTopbar from './AdminTopbar'

type CompanyStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

interface CompanyItem {
  id: string
  name: string
  email: string
  responsible: string
  phone: string | null
  status: CompanyStatus
  rejectionReason: string | null
  active: boolean
  activitiesCount: number
  createdAt: string
}

type Filter = 'ALL' | CompanyStatus | 'DISABLED'

const STATUS_LABEL: Record<CompanyStatus, string> = {
  PENDING: 'Pendente',
  APPROVED: 'Aprovada',
  REJECTED: 'Recusada',
}

const FILTER_LABEL: Record<Filter, string> = {
  ALL: 'Todas',
  PENDING: 'Pendentes',
  APPROVED: 'Aprovadas',
  REJECTED: 'Recusadas',
  DISABLED: 'Desativadas',
}

type EditForm = { name: string; responsible: string; email: string; phone: string }

function matchesFilter(c: CompanyItem, filter: Filter) {
  if (filter === 'ALL') return true
  if (filter === 'DISABLED') return !c.active
  return c.status === filter
}

export default function AdminCompanies({ onMenu }: { onMenu: () => void }) {
  const [companies, setCompanies] = useState<CompanyItem[]>([])
  const [filter, setFilter] = useState<Filter>('ALL')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const [rejecting, setRejecting] = useState<CompanyItem | null>(null)
  const [reason, setReason] = useState('')
  const [rejectError, setRejectError] = useState('')

  const [editing, setEditing] = useState<CompanyItem | null>(null)
  const [editForm, setEditForm] = useState<EditForm>({ name: '', responsible: '', email: '', phone: '' })
  const [editError, setEditError] = useState('')

  const [deleting, setDeleting] = useState<CompanyItem | null>(null)

  useEffect(() => {
    adminApi.get('/admin/companies')
      .then((data: CompanyItem[]) => setCompanies(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // As rotas de ação devolvem só os campos da empresa; mantém a contagem de atividades.
  function applyUpdate(updated: Partial<CompanyItem> & { id: string }) {
    setCompanies((prev) => prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)))
  }

  async function runAction(key: string, fn: () => Promise<void>) {
    setActionLoading(key)
    try {
      await fn()
    } finally {
      setActionLoading(null)
    }
  }

  function handleApprove(id: string) {
    return runAction(id + '-approve', async () => {
      applyUpdate(await adminApi.put(`/admin/companies/${id}/approve`, {}))
    })
  }

  function handleToggleActive(company: CompanyItem) {
    const action = company.active ? 'disable' : 'enable'
    return runAction(company.id + '-active', async () => {
      applyUpdate(await adminApi.put(`/admin/companies/${company.id}/${action}`, {}))
    })
  }

  function openReject(company: CompanyItem) {
    setRejecting(company)
    setReason('')
    setRejectError('')
  }

  async function handleReject(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!rejecting) return
    if (!reason.trim()) {
      setRejectError('Informe o motivo para a empresa saber o que corrigir.')
      return
    }

    const id = rejecting.id
    try {
      await runAction(id + '-reject', async () => {
        applyUpdate(await adminApi.put(`/admin/companies/${id}/reject`, { reason: reason.trim() }))
      })
      setRejecting(null)
    } catch (err) {
      setRejectError(err instanceof Error ? err.message : 'Erro ao recusar empresa.')
    }
  }

  function openEdit(company: CompanyItem) {
    setEditing(company)
    setEditForm({
      name: company.name,
      responsible: company.responsible,
      email: company.email,
      phone: formatPhone(company.phone),
    })
    setEditError('')
  }

  async function handleEdit(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!editing) return
    if (!editForm.name.trim() || !editForm.responsible.trim() || !editForm.email.trim()) {
      setEditError('Preencha nome, responsável e e-mail.')
      return
    }

    const id = editing.id
    try {
      await runAction(id + '-edit', async () => {
        applyUpdate(await adminApi.put(`/admin/companies/${id}`, editForm))
      })
      setEditing(null)
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Erro ao salvar empresa.')
    }
  }

  async function handleDelete() {
    if (!deleting) return
    const id = deleting.id
    await runAction(id + '-delete', async () => {
      await adminApi.delete(`/admin/companies/${id}`)
      setCompanies((prev) => prev.filter((c) => c.id !== id))
    }).catch(() => {})
    setDeleting(null)
  }

  const filtered = companies.filter((c) => matchesFilter(c, filter))
  const busy = actionLoading !== null

  return (
    <>
      <AdminTopbar
        title="Empresas"
        subtitle="Aprove, recuse, edite ou desative as empresas cadastradas."
        onMenu={onMenu}
      />

      <div className="admin-filters">
        {(Object.keys(FILTER_LABEL) as Filter[]).map((f) => (
          <button
            key={f}
            className={`filter-btn${filter === f ? ' active' : ''}${f !== 'ALL' ? ` filter-${f.toLowerCase()}` : ''}`}
            onClick={() => setFilter(f)}
          >
            {FILTER_LABEL[f]}
            <span className="filter-count">{companies.filter((c) => matchesFilter(c, f)).length}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="dashboard-empty">
          <LuHourglass className="empty-icon" />
          <h3>Carregando empresas...</h3>
        </div>
      ) : filtered.length === 0 ? (
        <div className="dashboard-empty">
          <LuBuilding2 className="empty-icon" />
          <h3>Nenhuma empresa encontrada</h3>
          <p>Não há empresas com o filtro selecionado.</p>
        </div>
      ) : (
        <div className="activities-table-wrapper">
          <table className="activities-table">
            <thead>
              <tr>
                <th>Empresa</th>
                <th>Contato</th>
                <th>Cadastro</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((company) => (
                <tr key={company.id} className={company.active ? undefined : 'row-past'}>
                  <td>
                    <strong>{company.name}</strong>
                    <div className="td-sub">
                      {company.activitiesCount} {company.activitiesCount === 1 ? 'atividade' : 'atividades'}
                    </div>
                  </td>
                  <td>
                    {company.responsible}
                    <div className="td-sub">{company.email}</div>
                    {company.phone && <div className="td-sub">{formatPhone(company.phone)}</div>}
                  </td>
                  <td>{new Date(company.createdAt).toLocaleDateString('pt-BR')}</td>
                  <td>
                    <span className={`status-badge status-${company.status.toLowerCase()}`}>
                      {STATUS_LABEL[company.status]}
                    </span>
                    {!company.active && <span className="status-badge status-disabled">Desativada</span>}
                    {company.status === 'PENDING' && company.rejectionReason && (
                      <div className="status-note">Reenviado após recusa</div>
                    )}
                    {company.rejectionReason && (
                      <div className="status-note" title={company.rejectionReason}>
                        Motivo: {company.rejectionReason}
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      {company.status !== 'APPROVED' && (
                        <button className="btn-approve" onClick={() => handleApprove(company.id)} disabled={busy}>
                          {actionLoading === company.id + '-approve' ? '...' : <><LuCheck /> Aprovar</>}
                        </button>
                      )}
                      {company.status !== 'REJECTED' && (
                        <button className="btn-reject" onClick={() => openReject(company)} disabled={busy}>
                          <LuX /> Recusar
                        </button>
                      )}
                      <button className="btn-icon" title="Editar" aria-label="Editar" onClick={() => openEdit(company)} disabled={busy}>
                        <LuPencil />
                      </button>
                      <button
                        className={`btn-icon${company.active ? '' : ' btn-icon-on'}`}
                        title={company.active ? 'Desativar' : 'Reativar'}
                        aria-label={company.active ? 'Desativar' : 'Reativar'}
                        onClick={() => handleToggleActive(company)}
                        disabled={busy}
                      >
                        <LuPower />
                      </button>
                      <button className="btn-icon btn-icon-danger" title="Excluir" aria-label="Excluir" onClick={() => setDeleting(company)} disabled={busy}>
                        <LuTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: recusar */}
      {rejecting && (
        <div className="modal-overlay" onClick={() => !busy && setRejecting(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Recusar {rejecting.name}</h2>
              <button className="modal-close" onClick={() => setRejecting(null)} aria-label="Fechar"><LuX /></button>
            </div>
            <form onSubmit={handleReject} className="modal-form">
              <div className="form-group">
                <label htmlFor="reason">Motivo da recusa *</label>
                <textarea
                  id="reason"
                  rows={4}
                  placeholder="Ex.: Não conseguimos confirmar o CNPJ informado. Atualize o nome da empresa conforme o registro."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  autoFocus
                />
                <small className="field-hint">A empresa verá esta mensagem no painel e poderá reenviar o cadastro.</small>
              </div>

              {rejectError && <p className="auth-error">{rejectError}</p>}

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setRejecting(null)} disabled={busy}>
                  Cancelar
                </button>
                <button type="submit" className="btn-delete-confirm" disabled={busy}>
                  {busy ? 'Recusando...' : 'Recusar empresa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: editar */}
      {editing && (
        <div className="modal-overlay" onClick={() => !busy && setEditing(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Editar empresa</h2>
              <button className="modal-close" onClick={() => setEditing(null)} aria-label="Fechar"><LuX /></button>
            </div>
            <form onSubmit={handleEdit} className="modal-form">
              <div className="form-group">
                <label htmlFor="edit-name">Nome da empresa *</label>
                <input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-responsible">Responsável *</label>
                <input
                  id="edit-responsible"
                  value={editForm.responsible}
                  onChange={(e) => setEditForm({ ...editForm, responsible: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-email">E-mail de acesso *</label>
                <input
                  id="edit-email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  required
                />
                <small className="field-hint">A empresa passa a entrar com este e-mail.</small>
              </div>
              <div className="form-group">
                <label htmlFor="edit-phone">Telefone <span className="optional">(opcional)</span></label>
                <input
                  id="edit-phone"
                  type="tel"
                  placeholder="(47) 99999-9999"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: formatPhone(e.target.value) })}
                />
              </div>

              {editError && <p className="auth-error">{editError}</p>}

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setEditing(null)} disabled={busy}>
                  Cancelar
                </button>
                <button type="submit" className="btn-save" disabled={busy}>
                  {busy ? 'Salvando...' : 'Salvar alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: excluir */}
      {deleting && (
        <ConfirmModal
          title={`Excluir ${deleting.name}?`}
          confirmLabel="Sim, excluir"
          loading={busy}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        >
          {deleting.activitiesCount === 0
            ? 'A conta da empresa será apagada.'
            : `A conta da empresa e ${deleting.activitiesCount === 1 ? 'a atividade publicada' : `as ${deleting.activitiesCount} atividades publicadas`} serão apagadas.`}{' '}
          Esta ação não pode ser desfeita. Para apenas bloquear o acesso, use "Desativar".
        </ConfirmModal>
      )}
    </>
  )
}
