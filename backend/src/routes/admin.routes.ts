import { Router } from 'express'
import {
  listCompanies,
  approveCompany,
  rejectCompany,
  updateCompany,
  disableCompany,
  enableCompany,
  deleteCompany,
  listAllActivities,
  deleteAnyActivity,
} from '../controllers/admin.controller'
import {
  listAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcements.controller'
import { adminMiddleware } from '../middleware/auth.middleware'

const router = Router()

router.use(adminMiddleware)

router.get('/companies', listCompanies)
router.put('/companies/:id', updateCompany)
router.put('/companies/:id/approve', approveCompany)
router.put('/companies/:id/reject', rejectCompany)
router.put('/companies/:id/disable', disableCompany)
router.put('/companies/:id/enable', enableCompany)
router.delete('/companies/:id', deleteCompany)

router.get('/activities', listAllActivities)
router.delete('/activities/:id', deleteAnyActivity)

router.get('/announcements', listAllAnnouncements)
router.post('/announcements', createAnnouncement)
router.put('/announcements/:id', updateAnnouncement)
router.delete('/announcements/:id', deleteAnnouncement)

export default router
