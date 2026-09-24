import { Response } from 'express'
import { Activity, ActivityCategory, Prisma, ScheduleType } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { AuthRequest } from '../middleware/auth.middleware'

const includeCompany = {
  company: { select: { id: true, name: true } },
} as const

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export function toActivityDTO(a: Activity & { company: { name: string } }) {
  return {
    id: a.id,
    name: a.name,
    description: a.description,
    category: a.category,
    scheduleType: a.scheduleType,
    date: a.date ? a.date.toISOString().slice(0, 10) : null,
    weekdays: a.weekdays,
    startTime: a.startTime,
    endTime: a.endTime,
    schedule: a.schedule,
    location: a.location,
    neighborhood: a.neighborhood,
    isFree: a.isFree,
    price: a.price,
    whatsapp: a.whatsapp,
    companyId: a.companyId,
    companyName: a.company.name,
  }
}

// Aceita "(47) 99999-9999", "47999999999" ou "+55 47 99999-9999" e devolve só dígitos com DDI.
function normalizeWhatsapp(raw: string): string | null {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 10 || digits.length === 11) return `55${digits}`
  if ((digits.length === 12 || digits.length === 13) && digits.startsWith('55')) return digits
  return null
}

// Data de hoje em Jaraguá — o container roda em UTC, então não dá para usar o fuso do servidor.
function todayISO(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date())
}

type ParseResult = { data: Omit<Prisma.ActivityUncheckedCreateInput, 'companyId'> } | { error: string }

function parseActivityInput(body: Record<string, unknown>): ParseResult {
  const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '')

  const name = str(body.name)
  const description = str(body.description)
  if (!name || !description) return { error: 'Campos obrigatórios: nome e descrição' }

  const category = str(body.category) || 'OUTRO'
  if (!(category in ActivityCategory)) return { error: 'Categoria inválida' }

  const scheduleType = str(body.scheduleType)
  if (!(scheduleType in ScheduleType)) return { error: 'Tipo de horário inválido' }

  const schedule = str(body.schedule) || null
  const startTime = str(body.startTime) || null
  const endTime = str(body.endTime) || null
  let date: Date | null = null
  let weekdays: number[] = []

  if (scheduleType === 'FLEXIBLE') {
    if (!schedule) return { error: 'Descreva o horário da atividade' }
  } else {
    if (!startTime || !TIME_RE.test(startTime)) return { error: 'Horário de início inválido' }
    if (endTime && (!TIME_RE.test(endTime) || endTime <= startTime)) {
      return { error: 'Horário de término deve ser depois do início' }
    }
  }

  if (scheduleType === 'ONCE') {
    const d = str(body.date)
    if (!DATE_RE.test(d)) return { error: 'Informe a data da atividade' }
    date = new Date(`${d}T00:00:00.000Z`)
  }

  if (scheduleType === 'WEEKLY') {
    const raw = Array.isArray(body.weekdays) ? body.weekdays : []
    weekdays = [...new Set(raw.map(Number))].filter((n) => Number.isInteger(n) && n >= 0 && n <= 6).sort()
    if (weekdays.length === 0) return { error: 'Selecione ao menos um dia da semana' }
  }

  const whatsapp = normalizeWhatsapp(str(body.whatsapp))
  if (!whatsapp) return { error: 'Informe um WhatsApp válido com DDD' }

  const isFree = body.isFree !== false
  const price = isFree ? null : str(body.price) || null
  if (!isFree && !price) return { error: 'Informe o valor da atividade' }

  return {
    data: {
      name,
      description,
      category: category as ActivityCategory,
      scheduleType: scheduleType as ScheduleType,
      date,
      weekdays,
      startTime: scheduleType === 'FLEXIBLE' ? null : startTime,
      endTime: scheduleType === 'FLEXIBLE' ? null : endTime,
      schedule,
      location: str(body.location) || null,
      neighborhood: str(body.neighborhood) || null,
      isFree,
      price,
      whatsapp,
    },
  }
}

// Público: só empresas aprovadas e sem atividades de data única que já passaram.
export async function listActivities(_req: AuthRequest, res: Response): Promise<void> {
  const activities = await prisma.activity.findMany({
    where: {
      company: { status: 'APPROVED', active: true },
      OR: [{ scheduleType: { not: 'ONCE' } }, { date: { gte: new Date(`${todayISO()}T00:00:00.000Z`) } }],
    },
    include: includeCompany,
    orderBy: { createdAt: 'desc' },
  })
  res.json(activities.map(toActivityDTO))
}

// Painel da empresa: todas as atividades dela, inclusive as que já passaram.
export async function listMyActivities(req: AuthRequest, res: Response): Promise<void> {
  const activities = await prisma.activity.findMany({
    where: { companyId: req.companyId! },
    include: includeCompany,
    orderBy: { createdAt: 'desc' },
  })
  res.json(activities.map(toActivityDTO))
}

export async function createActivity(req: AuthRequest, res: Response): Promise<void> {
  const parsed = parseActivityInput(req.body ?? {})
  if ('error' in parsed) {
    res.status(400).json({ error: parsed.error })
    return
  }

  const company = await prisma.company.findUnique({ where: { id: req.companyId! } })
  if (!company || company.status !== 'APPROVED') {
    res.status(403).json({ error: 'Empresa precisa ser aprovada para publicar atividades' })
    return
  }

  const activity = await prisma.activity.create({
    data: { ...parsed.data, companyId: req.companyId! },
    include: includeCompany,
  })

  res.status(201).json(toActivityDTO(activity))
}

export async function updateActivity(req: AuthRequest, res: Response): Promise<void> {
  const id = req.params.id as string

  const activity = await prisma.activity.findUnique({ where: { id } })

  if (!activity) {
    res.status(404).json({ error: 'Atividade não encontrada' })
    return
  }

  if (activity.companyId !== req.companyId) {
    res.status(403).json({ error: 'Sem permissão para editar esta atividade' })
    return
  }

  const parsed = parseActivityInput(req.body ?? {})
  if ('error' in parsed) {
    res.status(400).json({ error: parsed.error })
    return
  }

  const updated = await prisma.activity.update({
    where: { id },
    data: parsed.data,
    include: includeCompany,
  })

  res.json(toActivityDTO(updated))
}

export async function deleteActivity(req: AuthRequest, res: Response): Promise<void> {
  const id = req.params.id as string

  const activity = await prisma.activity.findUnique({ where: { id } })

  if (!activity) {
    res.status(404).json({ error: 'Atividade não encontrada' })
    return
  }

  if (activity.companyId !== req.companyId) {
    res.status(403).json({ error: 'Sem permissão para remover esta atividade' })
    return
  }

  await prisma.activity.delete({ where: { id } })
  res.status(204).send()
}
