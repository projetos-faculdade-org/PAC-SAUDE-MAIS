import { useState, useEffect } from 'react'
import { LuHourglass, LuMegaphone, LuPencil, LuTrash2, LuX } from 'react-icons/lu'
import { adminApi } from '../../lib/api'
import { formatAnnouncementDate, type Announcement } from '../../lib/announcement'
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal'
import AdminTopbar from './AdminTopbar'

type NewsForm = { title: string; content: string; linkUrl: string; published: boolean }

const EMPTY_FORM: NewsForm = { title: '', content: '', linkUrl: '', published: true }

export default function AdminNews({ onMenu }: { onMenu: () => void }) {
  const [news, setNews] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Announcement | null>(null)
  const [form, setForm] = useState<NewsForm>(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const [deleting, setDeleting] = useState<Announcement | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    adminApi.get('/admin/announcements')
      .then((data: Announcement[]) => setNews(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setShowModal(true)
  }

  function openEdit(item: Announcement) {
    setEditing(item)
    setForm({ title: item.title, content: item.content, linkUrl: item.linkUrl ?? '', published: item.published })
    setFormError('')
    setShowModal(true)
  }

  function closeModal() {
    if (saving) return
    setShowModal(false)
    setEditing(null)
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    setFormError('')
    if (!form.title.trim() || !form.content.trim()) {
      setFormError('Preencha o título e o texto.')
      return
    }

    setSaving(true)
    try {
      if (editing) {
        const updated: Announcement = await adminApi.put(`/admin/announcements/${editing.id}`, form)
        setNews((prev) => prev.map((n) => (n.id === updated.id ? updated : n)))
      } else {
        const created: Announcement = await adminApi.post('/admin/announcements', form)
        setNews((prev) => [created, ...prev])
      }
      setShowModal(false)
      setEditing(null)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erro ao salvar notícia.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleting) return
    setBusy(true)
    try {
      await adminApi.delete(`/admin/announcements/${deleting.id}`)
      setNews((prev) => prev.filter((n) => n.id !== deleting.id))
    } catch {
      // mantém a lista como está
    } finally {
      setBusy(false)
      setDeleting(null)
    }
  }

  return (
    <>
      <AdminTopbar
        title="Notícias e avisos"
        subtitle="Publicações que aparecem na página inicial e em /noticias."
        onMenu={onMenu}
        action={<button onClick={openCreate} className="btn-new">+ Nova notícia</button>}
      />

      {loading ? (
        <div className="dashboard-empty">
          <LuHourglass className="empty-icon" />
          <h3>Carregando notícias...</h3>
        </div>
      ) : news.length === 0 ? (
        <div className="dashboard-empty">
          <LuMegaphone className="empty-icon" />
          <h3>Nenhuma notícia publicada</h3>
          <p>Clique em "Nova notícia" para divulgar um evento, campanha ou aviso.</p>
        </div>
      ) : (
        <div className="activities-table-wrapper">
          <table className="activities-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Data</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {news.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.title}</strong>
                    <div className="td-sub td-clamp">{item.content}</div>
                  </td>
                  <td className="td-nowrap">{formatAnnouncementDate(item.createdAt)}</td>
                  <td>
                    {item.published
                      ? <span className="status-badge status-approved">Publicada</span>
                      : <span className="status-badge status-disabled">Rascunho</span>}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-edit" onClick={() => openEdit(item)}>
                        <LuPencil /> Editar
                      </button>
                      <button className="btn-delete" onClick={() => setDeleting(item)}>
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

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? 'Editar notícia' : 'Nova notícia'}</h2>
              <button className="modal-close" onClick={closeModal} aria-label="Fechar"><LuX /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="news-title">Título *</label>
                <input
                  id="news-title"
                  placeholder="Ex.: Mutirão de saúde no Parque Malwee"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="news-content">Texto *</label>
                <textarea
                  id="news-content"
                  rows={6}
                  placeholder="Conte o que vai acontecer, quando, onde e como participar."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="news-link">Link para saber mais <span className="optional">(opcional)</span></label>
                <input
                  id="news-link"
                  type="text"
                  inputMode="url"
                  placeholder="Ex.: jaraguadosul.sc.gov.br/evento"
                  value={form.linkUrl}
                  onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={(e) => setForm({ ...form, published: e.target.checked })}
                  />
                  Publicar no site
                </label>
                <small className="field-hint">Desmarcado, fica salva como rascunho e só aparece aqui.</small>
              </div>

              {formError && <p className="auth-error">{formError}</p>}

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={closeModal} disabled={saving}>
                  Cancelar
                </button>
                <button type="submit" className="btn-save" disabled={saving}>
                  {saving ? 'Salvando...' : editing ? 'Salvar alterações' : 'Criar notícia'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleting && (
        <ConfirmModal
          title="Excluir notícia?"
          confirmLabel="Sim, excluir"
          loading={busy}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        >
          "{deleting.title}" será removida do site. Esta ação não pode ser desfeita.
        </ConfirmModal>
      )}
    </>
  )
}
