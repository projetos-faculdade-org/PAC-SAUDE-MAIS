import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { api } from '../lib/api'

export interface Activity {
  id: string
  name: string
  description: string
  schedule: string
  location?: string
  companyId: string
  companyName: string
}

interface ActivitiesContextData {
  activities: Activity[]
  loading: boolean
  error: string | null
  addActivity: (data: Omit<Activity, 'id' | 'companyId' | 'companyName'>) => Promise<Activity>
  editActivity: (id: string, data: Omit<Activity, 'id' | 'companyId' | 'companyName'>) => Promise<void>
  deleteActivity: (id: string) => Promise<void>
}

const ActivitiesContext = createContext<ActivitiesContextData>(
  {} as ActivitiesContextData
)

export function ActivitiesProvider({ children }: { children: ReactNode }) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.get('/activities')
      .then((data: Activity[]) => setActivities(data))
      .catch(() => setError('Não foi possível carregar as atividades.'))
      .finally(() => setLoading(false))
  }, [])

  async function addActivity(data: Omit<Activity, 'id' | 'companyId' | 'companyName'>): Promise<Activity> {
    const created: Activity = await api.post('/activities', data)
    setActivities((prev) => [created, ...prev])
    return created
  }

  async function editActivity(id: string, data: Omit<Activity, 'id' | 'companyId' | 'companyName'>) {
    const updated: Activity = await api.put(`/activities/${id}`, data)
    setActivities((prev) => prev.map((a) => (a.id === id ? updated : a)))
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
