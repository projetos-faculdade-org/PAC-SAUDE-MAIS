import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'
import { AuthRequest } from '../middleware/auth.middleware'

export async function adminLogin(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body

  if (!email || !password) {
    res.status(400).json({ error: 'E-mail e senha são obrigatórios' })
    return
  }

  const admin = await prisma.admin.findUnique({ where: { email } })

  if (!admin) {
    res.status(401).json({ error: 'Credenciais inválidas' })
    return
  }

  const valid = await bcrypt.compare(password, admin.passwordHash)
  if (!valid) {
    res.status(401).json({ error: 'Credenciais inválidas' })
    return
  }

  const token = jwt.sign(
    { adminId: admin.id, role: 'admin' },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  )

  res.json({ token, admin: { id: admin.id, email: admin.email } })
}

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
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  res.json(companies)
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
    data: { status: 'APPROVED' },
    select: { id: true, name: true, email: true, status: true },
  })

  res.json(updated)
}

export async function rejectCompany(req: AuthRequest, res: Response): Promise<void> {
  const id = req.params.id as string

  const company = await prisma.company.findUnique({ where: { id } })
  if (!company) {
    res.status(404).json({ error: 'Empresa não encontrada' })
    return
  }

  const updated = await prisma.company.update({
    where: { id },
    data: { status: 'REJECTED' },
    select: { id: true, name: true, email: true, status: true },
  })

  res.json(updated)
}
