import { createContext, useContext, useState, type ReactNode } from 'react'

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
  addActivity: (data: Omit<Activity, 'id'>) => void
  editActivity: (id: string, data: Omit<Activity, 'id'>) => void
  deleteActivity: (id: string) => void
}

const ActivitiesContext = createContext<ActivitiesContextData>(
  {} as ActivitiesContextData
)

const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: '101',
    name: 'Yoga Matinal',
    description:
      'Prática de Yoga com foco em respiração, alongamento e equilíbrio. Indicado para todos os níveis, da iniciante ao avançado.',
    schedule: 'Seg / Qua / Sex • 07h – 08h',
    location: 'Salão Principal',
    companyId: '1',
    companyName: 'Academia Saúde Total',
  },
  {
    id: '102',
    name: 'Natação para Adultos',
    description:
      'Aulas de natação para adultos de todos os níveis. Trabalha condicionamento cardiovascular, resistência muscular e técnica.',
    schedule: 'Ter / Qui • 19h – 20h',
    location: 'Piscina Olímpica',
    companyId: '1',
    companyName: 'Academia Saúde Total',
  },
  {
    id: '103',
    name: 'Escolinha de Futsal',
    description:
      'Programa esportivo para crianças e adolescentes de 7 a 16 anos. Desenvolve habilidades técnicas, trabalho em equipe e disciplina.',
    schedule: 'Sáb • 09h – 11h',
    location: 'Quadra Poliesportiva',
    companyId: '1',
    companyName: 'Academia Saúde Total',
  },
  {
    id: '104',
    name: 'Musculação',
    description:
      'Acesso livre à área de musculação com equipamentos modernos. Acompanhamento de personal trainer disponível mediante agendamento.',
    schedule: 'Seg – Sex • 06h – 22h',
    location: 'Sala de Musculação',
    companyId: '1',
    companyName: 'Academia Saúde Total',
  },
]

export function ActivitiesProvider({ children }: { children: ReactNode }) {
  const [activities, setActivities] = useState<Activity[]>(INITIAL_ACTIVITIES)

  function addActivity(data: Omit<Activity, 'id'>) {
    const newActivity: Activity = {
      ...data,
      id: String(Date.now()),
    }
    setActivities((prev) => [...prev, newActivity])
  }

  function editActivity(id: string, data: Omit<Activity, 'id'>) {
    setActivities((prev) =>
      prev.map((act) => (act.id === id ? { ...data, id } : act))
    )
  }

  function deleteActivity(id: string) {
    setActivities((prev) => prev.filter((act) => act.id !== id))
  }

  return (
    <ActivitiesContext.Provider
      value={{ activities, addActivity, editActivity, deleteActivity }}
    >
      {children}
    </ActivitiesContext.Provider>
  )
}

export function useActivities() {
  return useContext(ActivitiesContext)
}
