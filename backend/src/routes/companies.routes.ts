import { Router } from 'express'
import { getCompanyProfile } from '../controllers/companies.controller'

const router = Router()

router.get('/:id', getCompanyProfile)

export default router
