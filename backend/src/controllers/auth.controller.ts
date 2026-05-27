import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'

export async function register(req: Request, res: Response): Promise<void> {
  const { companyName, responsible, email, phone, password } = req.body

  if (!companyName || !responsible || !email || !password) {
    res.status(400).json({ error: 'Campos obrigatórios: companyName, responsible, email, password' })
    return
  }

  if (password.length < 6) {
    res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres' })
    return
  }

  const existing = await prisma.company.findUnique({ where: { email } })
  if (existing) {
    res.status(409).json({ error: 'E-mail já cadastrado' })
    return
  }

  const passwordHash = await bcrypt.hash(password, 10)

  const company = await prisma.company.create({
    data: { name: companyName, responsible, email, phone, passwordHash },
    select: { id: true, name: true, email: true, responsible: true, phone: true },
  })

  const token = jwt.sign({ companyId: company.id }, process.env.JWT_SECRET!, {
    expiresIn: '7d',
  })

  res.status(201).json({ token, company })
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body

  if (!email || !password) {
    res.status(400).json({ error: 'E-mail e senha são obrigatórios' })
    return
  }

  const company = await prisma.company.findUnique({ where: { email } })

  if (!company) {
    res.status(401).json({ error: 'Credenciais inválidas' })
    return
  }

  const valid = await bcrypt.compare(password, company.passwordHash)
  if (!valid) {
    res.status(401).json({ error: 'Credenciais inválidas' })
    return
  }

  const token = jwt.sign({ companyId: company.id }, process.env.JWT_SECRET!, {
    expiresIn: '7d',
  })

  res.json({
    token,
    company: {
      id: company.id,
      name: company.name,
      email: company.email,
      responsible: company.responsible,
      phone: company.phone,
    },
  })
}

export async function me(req: Request & { companyId?: string }, res: Response): Promise<void> {
  const company = await prisma.company.findUnique({
    where: { id: req.companyId },
    select: { id: true, name: true, email: true, responsible: true, phone: true, createdAt: true },
  })

  if (!company) {
    res.status(404).json({ error: 'Empresa não encontrada' })
    return
  }

  res.json(company)
}
