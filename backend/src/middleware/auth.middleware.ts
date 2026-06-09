import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

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

export function authMiddleware(
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
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as CompanyJwtPayload
    req.companyId = payload.companyId
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido ou expirado' })
  }
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
