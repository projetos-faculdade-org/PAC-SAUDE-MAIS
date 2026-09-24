import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'

export const ACCOUNT_DISABLED_MESSAGE = 'Conta desativada. Entre em contato com a organização.'

export interface AuthRequest extends Request {
  companyId?: string
  adminId?: string
}

interface CompanyJwtPayload {
  companyId: string
}

interface AdminJwtPayload {
  adminId: string
  role: 'admin'
}

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token não fornecido' })
    return
  }

  const token = authHeader.slice(7)

  let payload: CompanyJwtPayload
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET!) as CompanyJwtPayload
  } catch {
    res.status(401).json({ error: 'Token inválido ou expirado' })
    return
  }

  if (!payload.companyId) {
    res.status(401).json({ error: 'Token inválido ou expirado' })
    return
  }

  // Confere a cada requisição: o admin pode ter desativado ou apagado a empresa depois do login.
  try {
    const company = await prisma.company.findUnique({
      where: { id: payload.companyId },
      select: { active: true },
    })
    if (!company) {
      res.status(401).json({ error: 'Conta não encontrada' })
      return
    }
    if (!company.active) {
      res.status(403).json({ error: ACCOUNT_DISABLED_MESSAGE })
      return
    }
  } catch (err) {
    next(err)
    return
  }

  req.companyId = payload.companyId
  next()
}

export function adminMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token não fornecido' })
    return
  }

  const token = authHeader.slice(7)

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as AdminJwtPayload
    if (payload.role !== 'admin') {
      res.status(403).json({ error: 'Acesso restrito a administradores' })
      return
    }
    req.adminId = payload.adminId
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido ou expirado' })
  }
}
