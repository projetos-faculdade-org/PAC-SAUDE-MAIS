import { Router } from 'express'
import { adminLogin, listCompanies, approveCompany, rejectCompany } from '../controllers/admin.controller'
import { adminMiddleware } from '../middleware/auth.middleware'

const router = Router()

router.post('/login', adminLogin)
router.get('/companies', adminMiddleware, listCompanies)
router.put('/companies/:id/approve', adminMiddleware, approveCompany)
router.put('/companies/:id/reject', adminMiddleware, rejectCompany)

export default router
