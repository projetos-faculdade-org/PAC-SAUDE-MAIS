import type { ReactNode } from 'react'
import { LuMenu } from 'react-icons/lu'

interface Props {
  title: string
  subtitle: string
  onMenu: () => void
  action?: ReactNode
}

export default function AdminTopbar({ title, subtitle, onMenu, action }: Props) {
  return (
    <div className="dashboard-topbar">
      <div className="topbar-left">
        <button className="sidebar-toggle" aria-label="Abrir menu" onClick={onMenu}>
          <LuMenu />
        </button>
        <div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>
      {action}
    </div>
  )
}
