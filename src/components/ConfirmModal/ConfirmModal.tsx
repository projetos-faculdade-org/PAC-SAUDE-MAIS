import type { ReactNode } from 'react'
import { LuTriangleAlert } from 'react-icons/lu'
import '../../pages/Empresa/Dashboard.css'

interface Props {
  title: string
  children: ReactNode
  confirmLabel: string
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({ title, children, confirmLabel, loading = false, onConfirm, onCancel }: Props) {
  return (
    <div className="modal-overlay" onClick={() => !loading && onCancel()}>
      <div className="modal modal-confirm" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-icon"><LuTriangleAlert /></div>
        <h2>{title}</h2>
        <p>{children}</p>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onCancel} disabled={loading}>
            Cancelar
          </button>
          <button className="btn-delete-confirm" onClick={onConfirm} disabled={loading}>
            {loading ? 'Aguarde...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
