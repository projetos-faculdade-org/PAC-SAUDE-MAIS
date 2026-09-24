import { Router } from 'express'
import { listPublishedAnnouncements } from '../controllers/announcements.controller'

const router = Router()

router.get('/', listPublishedAnnouncements)

export default router
