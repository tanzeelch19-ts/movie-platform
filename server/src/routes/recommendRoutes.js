import { Router } from 'express'
import { recommendations } from '../controllers/recommendController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/', requireAuth, recommendations)

export default router