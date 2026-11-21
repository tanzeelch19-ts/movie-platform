import { Router } from 'express'
import { runDigest } from '../controllers/cronController.js'

const router = Router()

router.post('/digest', runDigest)

export default router