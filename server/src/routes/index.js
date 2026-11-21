import { Router } from 'express'
import { healthCheck } from '../controllers/healthController.js'
import authRoutes from './authRoutes.js'
import movieRoutes from './movieRoutes.js'
import listRoutes from './listRoutes.js'
import reviewRoutes from './reviewRoutes.js'
import recommendRoutes from './recommendRoutes.js'
import collectionRoutes from './collectionRoutes.js'
import adminRoutes from './adminRoutes.js'
import cronRoutes from './cronRoutes.js'

const router = Router()

router.get('/health', healthCheck)
router.use('/auth', authRoutes)
router.use('/movies', movieRoutes)
router.use('/lists', listRoutes)
router.use('/reviews', reviewRoutes)
router.use('/recommendations', recommendRoutes)
router.use('/collections', collectionRoutes)
router.use('/admin', adminRoutes)
router.use('/cron', cronRoutes)

export default router