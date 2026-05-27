import { Response } from 'express'
import { prisma } from '../lib/prisma'
import { AuthRequest } from '../middleware/auth.middleware'

const includeCompany = {
  company: { select: { id: true, name: true } },
} as const

function toDTO(a: {
  id: string
  name: string
  description: string
  schedule: string
  location: string | null
  companyId: string
  company: { name: string }
}) {
  return {
    id: a.id,
    name: a.name,
    description: a.description,
    schedule: a.schedule,
    location: a.location,
    companyId: a.companyId,
    companyName: a.company.name,
  }
}

export async function listActivities(_req: AuthRequest, res: Response): Promise<void> {
  const activities = await prisma.activity.findMany({
    include: includeCompany,
    orderBy: { createdAt: 'desc' },
  })
  res.json(activities.map(toDTO))
}

export async function createActivity(req: AuthRequest, res: Response): Promise<void> {
  const { name, description, schedule, location } = req.body as Record<string, string>

  if (!name || !description || !schedule) {
    res.status(400).json({ error: 'Campos obrigatórios: name, description, schedule' })
    return
  }

  const activity = await prisma.activity.create({
    data: {
      name,
      description,
      schedule,
      location: location || null,
      companyId: req.companyId!,
    },
    include: includeCompany,
  })

  res.status(201).json(toDTO(activity))
}

export async function updateActivity(req: AuthRequest, res: Response): Promise<void> {
  const id = req.params.id as string
  const { name, description, schedule, location } = req.body as Record<string, string | undefined>

  const activity = await prisma.activity.findUnique({ where: { id } })

  if (!activity) {
    res.status(404).json({ error: 'Atividade não encontrada' })
    return
  }

  if (activity.companyId !== req.companyId) {
    res.status(403).json({ error: 'Sem permissão para editar esta atividade' })
    return
  }

  const updated = await prisma.activity.update({
    where: { id },
    data: {
      name: name ?? activity.name,
      description: description ?? activity.description,
      schedule: schedule ?? activity.schedule,
      location: location !== undefined ? location || null : activity.location,
    },
    include: includeCompany,
  })

  res.json(toDTO(updated))
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
