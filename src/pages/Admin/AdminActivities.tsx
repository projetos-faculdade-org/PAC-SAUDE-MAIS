import { useState, useEffect } from 'react'
import { LuClipboardList, LuHourglass, LuTrash2 } from 'react-icons/lu'
import { adminApi } from '../../lib/api'
import { CATEGORY_LABEL, formatSchedule, isPast, type Activity } from '../../lib/activity'
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal'
import AdminTopbar from './AdminTopbar'

type AdminActivity = Activity & {
  companyStatus: 'PENDING' | 'APPROVED' | 'REJECTED'
  companyActive: boolean
}

// Por que a atividade não aparece no site, se for o caso.
function hiddenReason(a: AdminActivity) {
  if (!a.companyActive) return 'Empresa desativada'
  if (a.companyStatus !== 'APPROVED') return 'Empresa não aprovada'
  if (isPast(a)) return 'Encerrada'
  return null
}

export default function AdminActivities({ onMenu }: { onMenu: () => void }) {
  const [activities, setActivities] = useState<AdminActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [removing, setRemoving] = useState<AdminActivity | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    adminApi.get('/admin/activities')
      .then((data: AdminActivity[]) => setActivities(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleRemove() {
    if (!removing) return
    setBusy(true)
    try {
      await adminApi.delete(`/admin/activities/${removing.id}`)
      setActivities((prev) => prev.filter((a) => a.id !== removing.id))
    } catch {
      // mantém a lista como está
    } finally {
      setBusy(false)
      setRemoving(null)
    }
  }

  const term = search.trim().toLowerCase()
  const filtered = term
    ? activities.filter((a) => `${a.name} ${a.companyName}`.toLowerCase().includes(term))
    : activities

  return (
    <>
      <AdminTopbar
        title="Atividades"
        subtitle="Todas as atividades publicadas na plataforma. Remova as inadequadas."
        onMenu={onMenu}
      />

      <div className="admin-search">
        <input
          type="text"
          placeholder="Buscar por atividade ou empresa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="dashboard-empty">
          <LuHourglass className="empty-icon" />
          <h3>Carregando atividades...</h3>
        </div>
      ) : filtered.length === 0 ? (
        <div className="dashboard-empty">
          <LuClipboardList className="empty-icon" />
          <h3>Nenhuma atividade encontrada</h3>
        </div>
      ) : (
        <div className="activities-table-wrapper">
          <table className="activities-table">
            <thead>
              <tr>
                <th>Atividade</th>
                <th>Empresa</th>
                <th>Quando</th>
                <th>No site</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((activity) => {
                const hidden = hiddenReason(activity)
                return (
                  <tr key={activity.id}>
                    <td>
                      <strong>{activity.name}</strong>
                      <div className="td-sub">{CATEGORY_LABEL[activity.category]}</div>
                    </td>
                    <td>{activity.companyName}</td>
                    <td className="td-schedule">
                      <span className="schedule-tag">{formatSchedule(activity)}</span>
                    </td>
                    <td>
                      {hidden
                        ? <span className="status-badge status-disabled">{hidden}</span>
                        : <span className="status-badge status-approved">Visível</span>}
                    </td>
                    <td>
                      <button className="btn-delete" onClick={() => setRemoving(activity)}>
                        <LuTrash2 /> Remover
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {removing && (
        <ConfirmModal
          title="Remover atividade?"
          confirmLabel="Sim, remover"
          loading={busy}
          onConfirm={handleRemove}
          onCancel={() => setRemoving(null)}
        >
          "{removing.name}", de {removing.companyName}, será apagada da plataforma. Esta ação não pode ser desfeita.
        </ConfirmModal>
      )}
    </>
  )
}
