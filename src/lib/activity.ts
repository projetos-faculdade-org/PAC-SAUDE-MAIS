export type ScheduleType = 'ONCE' | 'WEEKLY' | 'FLEXIBLE'

export type ActivityCategory =
  | 'CAMINHADA_CORRIDA'
  | 'ESPORTES'
  | 'DANCA'
  | 'YOGA_PILATES'
  | 'LUTAS'
  | 'NATACAO'
  | 'NUTRICAO'
  | 'SAUDE_MENTAL'
  | 'PREVENCAO'
  | 'OUTRO'

export interface Activity {
  id: string
  name: string
  description: string
  category: ActivityCategory
  scheduleType: ScheduleType
  date: string | null // YYYY-MM-DD
  weekdays: number[]
  startTime: string | null
  endTime: string | null
  schedule: string | null
  location: string | null
  neighborhood: string | null
  isFree: boolean
  price: string | null
  whatsapp: string | null
  companyId: string
  companyName: string
}

export type ActivityInput = Omit<Activity, 'id' | 'companyId' | 'companyName'>

export const CATEGORY_LABEL: Record<ActivityCategory, string> = {
  CAMINHADA_CORRIDA: 'Caminhada e corrida',
  ESPORTES: 'Esportes',
  DANCA: 'Dança',
  YOGA_PILATES: 'Yoga e pilates',
  LUTAS: 'Lutas',
  NATACAO: 'Natação',
  NUTRICAO: 'Nutrição',
  SAUDE_MENTAL: 'Saúde mental',
  PREVENCAO: 'Prevenção e palestras',
  OUTRO: 'Outros',
}

export const CATEGORIES = Object.keys(CATEGORY_LABEL) as ActivityCategory[]

export const WEEKDAY_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

// "07:00" → "07h", "07:30" → "07h30"
function formatTime(t: string) {
  return t.endsWith(':00') ? `${t.slice(0, 2)}h` : t.replace(':', 'h')
}

function timeRange(start: string | null, end: string | null) {
  if (!start) return ''
  return end ? `${formatTime(start)} – ${formatTime(end)}` : formatTime(start)
}

function parseDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function formatWeekdays(days: number[]) {
  if (days.length === 7) return 'Todos os dias'
  if (days.length === 5 && [1, 2, 3, 4, 5].every((d) => days.includes(d))) return 'Seg a Sex'
  if (days.length === 2 && days.includes(0) && days.includes(6)) return 'Fins de semana'
  return days.map((d) => WEEKDAY_SHORT[d]).join(' / ')
}

/** Texto curto de quando a atividade acontece, ex.: "Seg / Qua • 07h – 08h". */
export function formatSchedule(a: Pick<Activity, 'scheduleType' | 'date' | 'weekdays' | 'startTime' | 'endTime' | 'schedule'>) {
  if (a.scheduleType === 'FLEXIBLE') return a.schedule ?? ''

  const when =
    a.scheduleType === 'ONCE' && a.date
      ? parseDate(a.date).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })
      : formatWeekdays(a.weekdays)

  return [when, timeRange(a.startTime, a.endTime)].filter(Boolean).join(' • ')
}

/** Próxima vez que a atividade acontece (a partir de hoje), ou null quando não dá para saber. */
export function nextOccurrence(a: Activity, from = new Date()): Date | null {
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate())

  if (a.scheduleType === 'ONCE' && a.date) {
    const d = parseDate(a.date)
    return d >= today ? d : null
  }

  if (a.scheduleType === 'WEEKLY' && a.weekdays.length > 0) {
    for (let i = 0; i < 7; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() + i)
      if (a.weekdays.includes(d.getDay())) return d
    }
  }

  return null
}

/** Mais próximas primeiro; horários em texto livre (sem data calculável) vão para o fim. */
export function sortByNextOccurrence(list: Activity[], from = new Date()) {
  return list
    .map((a) => ({ a, next: nextOccurrence(a, from)?.getTime() ?? Infinity }))
    .sort((x, y) => x.next - y.next)
    .map(({ a }) => a)
}

export function isPast(a: Activity, from = new Date()) {
  return a.scheduleType === 'ONCE' && nextOccurrence(a, from) === null
}

export function whatsappLink(a: Activity) {
  if (!a.whatsapp) return null
  const text = `Olá! Vi a atividade "${a.name}" no Jaraguá Mais Saudável e quero participar.`
  return `https://wa.me/${a.whatsapp}?text=${encodeURIComponent(text)}`
}
