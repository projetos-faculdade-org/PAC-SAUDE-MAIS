export interface Announcement {
  id: string
  title: string
  content: string
  linkUrl: string | null
  published: boolean
  createdAt: string
  updatedAt: string
}

export function formatAnnouncementDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}
