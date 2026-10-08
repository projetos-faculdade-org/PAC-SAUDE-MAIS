import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { publicActivityWhere, toActivityDTO } from './activities.controller'

// Perfil público da empresa: só aprovadas e ativas, com as atividades que estão no ar.
export async function getCompanyProfile(req: Request, res: Response): Promise<void> {
  const company = await prisma.company.findFirst({
    where: { id: req.params.id as string, status: 'APPROVED', active: true },
    select: {
      id: true,
      name: true,
      createdAt: true,
      activities: {
        where: publicActivityWhere(),
        include: { company: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!company) {
    res.status(404).json({ error: 'Empresa não encontrada' })
    return
  }

  res.json({
    id: company.id,
    name: company.name,
    memberSince: company.createdAt.toISOString().slice(0, 10),
    activities: company.activities.map(toActivityDTO),
  })
}
