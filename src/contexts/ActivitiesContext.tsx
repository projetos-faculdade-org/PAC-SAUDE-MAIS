import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { api } from '../lib/api'
import type { Activity, ActivityInput } from '../lib/activity'

export type { Activity, ActivityInput } from '../lib/activity'

interface ActivitiesContextData {
  activities: Activity[]
  loading: boolean
  error: string | null
  addActivity: (data: ActivityInput) => Promise<Activity>
  editActivity: (id: string, data: ActivityInput) => Promise<Activity>
  deleteActivity: (id: string) => Promise<void>
}

const ActivitiesContext = createContext<ActivitiesContextData>(
  {} as ActivitiesContextData
)

export function ActivitiesProvider({ children }: { children: ReactNode }) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Lista pública: o backend já filtra empresas não aprovadas e datas que passaram.
  const reload = useCallback(() => {
    return api.get('/activities')
      .then((data: Activity[]) => {
        setActivities(data)
        setError(null)
      })
      .catch(() => setError('Não foi possível carregar as atividades.'))
  }, [])

  useEffect(() => {
    reload().finally(() => setLoading(false))
  }, [reload])

  async function addActivity(data: ActivityInput): Promise<Activity> {
    const created: Activity = await api.post('/activities', data)
    reload()
    return created
  }

  async function editActivity(id: string, data: ActivityInput): Promise<Activity> {
    const updated: Activity = await api.put(`/activities/${id}`, data)
    reload()
    return updated
  }

  async function deleteActivity(id: string) {
    await api.delete(`/activities/${id}`)
    setActivities((prev) => prev.filter((a) => a.id !== id))
  }

  return (
    <ActivitiesContext.Provider
      value={{ activities, loading, error, addActivity, editActivity, deleteActivity }}
    >
      {children}
    </ActivitiesContext.Provider>
  )
}

export function useActivities() {
  return useContext(ActivitiesContext)
}
