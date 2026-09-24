import { Router } from 'express'
import {
  createActivity,
  deleteActivity,
  listActivities,
  listMyActivities,
  updateActivity,
} from '../controllers/activities.controller'
import { authMiddleware } from '../middleware/auth.middleware'

const router = Router()

router.get('/', listActivities)
router.get('/mine', authMiddleware, listMyActivities)
router.post('/', authMiddleware, createActivity)
router.put('/:id', authMiddleware, updateActivity)
router.delete('/:id', authMiddleware, deleteActivity)

export default router
