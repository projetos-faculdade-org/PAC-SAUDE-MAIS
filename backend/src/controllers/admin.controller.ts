import { Response } from 'express'
import { prisma } from '../lib/prisma'
import { AuthRequest } from '../middleware/auth.middleware'
import { toActivityDTO } from './activities.controller'

export async function listCompanies(_req: AuthRequest, res: Response): Promise<void> {
  const { status } = _req.query as { status?: string }

  const where = status ? { status: status as 'PENDING' | 'APPROVED' | 'REJECTED' } : {}

  const companies = await prisma.company.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      responsible: true,
      phone: true,
      status: true,
      rejectionReason: true,
      active: true,
      createdAt: true,
      _count: { select: { activities: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  res.json(
    companies.map(({ _count, ...c }) => ({ ...c, activitiesCount: _count.activities }))
  )
}

export async function approveCompany(req: AuthRequest, res: Response): Promise<void> {
  const id = req.params.id as string

  const company = await prisma.company.findUnique({ where: { id } })
  if (!company) {
    res.status(404).json({ error: 'Empresa não encontrada' })
    return
  }

  const updated = await prisma.company.update({
    where: { id },
    data: { status: 'APPROVED', rejectionReason: null },
    select: { id: true, name: true, email: true, status: true, rejectionReason: true },
  })

  res.json(updated)
}

export async function rejectCompany(req: AuthRequest, res: Response): Promise<void> {
  const id = req.params.id as string
  const reason = typeof req.body?.reason === 'string' ? req.body.reason.trim() : ''

  if (!reason) {
    res.status(400).json({ error: 'Informe o motivo da recusa' })
    return
  }

  const company = await prisma.company.findUnique({ where: { id } })
  if (!company) {
    res.status(404).json({ error: 'Empresa não encontrada' })
    return
  }

  const updated = await prisma.company.update({
    where: { id },
    data: { status: 'REJECTED', rejectionReason: reason },
    select: { id: true, name: true, email: true, status: true, rejectionReason: true },
  })

  res.json(updated)
}

const companyAdminFields = {
  id: true,
  name: true,
  email: true,
  responsible: true,
  phone: true,
  status: true,
  rejectionReason: true,
  active: true,
} as const

export async function updateCompany(req: AuthRequest, res: Response): Promise<void> {
  const id = req.params.id as string
  const { name, responsible, email, phone } = req.body as Record<string, string | undefined>

  if (!name?.trim() || !responsible?.trim() || !email?.trim()) {
    res.status(400).json({ error: 'Campos obrigatórios: nome, responsável e e-mail' })
    return
  }

  const company = await prisma.company.findUnique({ where: { id } })
  if (!company) {
    res.status(404).json({ error: 'Empresa não encontrada' })
    return
  }

  const normalizedEmail = email.trim()
  if (normalizedEmail !== company.email) {
    const taken =
      (await prisma.company.findUnique({ where: { email: normalizedEmail } })) ??
      (await prisma.admin.findUnique({ where: { email: normalizedEmail } }))
    if (taken) {
      res.status(409).json({ error: 'E-mail já cadastrado' })
      return
    }
  }

  const updated = await prisma.company.update({
    where: { id },
    data: {
      name: name.trim(),
      responsible: responsible.trim(),
      email: normalizedEmail,
      phone: phone?.trim() || null,
    },
    select: companyAdminFields,
  })

  res.json(updated)
}

async function setCompanyActive(req: AuthRequest, res: Response, active: boolean): Promise<void> {
  const id = req.params.id as string

  const company = await prisma.company.findUnique({ where: { id } })
  if (!company) {
    res.status(404).json({ error: 'Empresa não encontrada' })
    return
  }

  const updated = await prisma.company.update({
    where: { id },
    data: { active },
    select: companyAdminFields,
  })

  res.json(updated)
}

export const disableCompany = (req: AuthRequest, res: Response) => setCompanyActive(req, res, false)
export const enableCompany = (req: AuthRequest, res: Response) => setCompanyActive(req, res, true)

// Apaga a empresa e, em cascata, todas as atividades dela.
export async function deleteCompany(req: AuthRequest, res: Response): Promise<void> {
  const id = req.params.id as string

  const company = await prisma.company.findUnique({ where: { id } })
  if (!company) {
    res.status(404).json({ error: 'Empresa não encontrada' })
    return
  }

  await prisma.company.delete({ where: { id } })
  res.status(204).send()
}

export async function listAllActivities(_req: AuthRequest, res: Response): Promise<void> {
  const activities = await prisma.activity.findMany({
    include: { company: { select: { id: true, name: true, status: true, active: true } } },
    orderBy: { createdAt: 'desc' },
  })

  res.json(
    activities.map((a) => ({
      ...toActivityDTO(a),
      companyStatus: a.company.status,
      companyActive: a.company.active,
    }))
  )
}

export async function deleteAnyActivity(req: AuthRequest, res: Response): Promise<void> {
  const id = req.params.id as string

  const activity = await prisma.activity.findUnique({ where: { id } })
  if (!activity) {
    res.status(404).json({ error: 'Atividade não encontrada' })
    return
  }

  await prisma.activity.delete({ where: { id } })
  res.status(204).send()
}
