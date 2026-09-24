import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { AuthRequest } from '../middleware/auth.middleware'

type ParseResult = { data: { title: string; content: string; linkUrl: string | null; published: boolean } } | { error: string }

function parseAnnouncementInput(body: Record<string, unknown>): ParseResult {
  const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '')

  const title = str(body.title)
  const content = str(body.content)
  if (!title || !content) return { error: 'Campos obrigatórios: título e texto' }

  let linkUrl: string | null = str(body.linkUrl) || null
  if (linkUrl) {
    if (!/^https?:\/\//i.test(linkUrl)) linkUrl = `https://${linkUrl}`
    try {
      new URL(linkUrl)
    } catch {
      return { error: 'Link inválido' }
    }
  }

  return { data: { title, content, linkUrl, published: body.published !== false } }
}

// Público: só publicadas, mais recentes primeiro. ?limit=3 para a landing page.
export async function listPublishedAnnouncements(req: Request, res: Response): Promise<void> {
  const limit = Number(req.query.limit)
  const announcements = await prisma.announcement.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    ...(Number.isInteger(limit) && limit > 0 ? { take: limit } : {}),
  })
  res.json(announcements)
}

export async function listAllAnnouncements(_req: AuthRequest, res: Response): Promise<void> {
  const announcements = await prisma.announcement.findMany({ orderBy: { createdAt: 'desc' } })
  res.json(announcements)
}

export async function createAnnouncement(req: AuthRequest, res: Response): Promise<void> {
  const parsed = parseAnnouncementInput(req.body ?? {})
  if ('error' in parsed) {
    res.status(400).json({ error: parsed.error })
    return
  }

  const announcement = await prisma.announcement.create({ data: parsed.data })
  res.status(201).json(announcement)
}

export async function updateAnnouncement(req: AuthRequest, res: Response): Promise<void> {
  const id = req.params.id as string

  const existing = await prisma.announcement.findUnique({ where: { id } })
  if (!existing) {
    res.status(404).json({ error: 'Notícia não encontrada' })
    return
  }

  const parsed = parseAnnouncementInput(req.body ?? {})
  if ('error' in parsed) {
    res.status(400).json({ error: parsed.error })
    return
  }

  const announcement = await prisma.announcement.update({ where: { id }, data: parsed.data })
  res.json(announcement)
}

export async function deleteAnnouncement(req: AuthRequest, res: Response): Promise<void> {
  const id = req.params.id as string

  const existing = await prisma.announcement.findUnique({ where: { id } })
  if (!existing) {
    res.status(404).json({ error: 'Notícia não encontrada' })
    return
  }

  await prisma.announcement.delete({ where: { id } })
  res.status(204).send()
}
