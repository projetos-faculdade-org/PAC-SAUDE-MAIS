import { Router } from 'express'
import { login, me, register, resubmit } from '../controllers/auth.controller'
import { authMiddleware } from '../middleware/auth.middleware'

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.get('/me', authMiddleware, me)
router.put('/resubmit', authMiddleware, resubmit)

export default router
