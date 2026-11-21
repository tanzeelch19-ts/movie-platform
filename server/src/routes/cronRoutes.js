import { Router } from 'express'
import { runDigest } from '../controllers/cronController.js'

const router = Router()

// GET is used by Vercel Cron. POST is used for manual calls.
router.get('/digest', runDigest)
router.post('/digest', runDigest)

export default router