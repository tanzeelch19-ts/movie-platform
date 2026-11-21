import { Router } from 'express'
import {
  stats,
  listUsers,
  deleteUser,
  listReviews,
  toggleHideReview,
  sendDigest,
} from '../controllers/adminController.js'
import { deleteReview } from '../controllers/reviewController.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = Router()

router.use(requireAuth, requireAdmin)

router.get('/stats', stats)
router.get('/users', listUsers)
router.delete('/users/:id', deleteUser)
router.get('/reviews', listReviews)
router.patch('/reviews/:id/hide', toggleHideReview)
router.delete('/reviews/:id', deleteReview)
router.post('/digest/send', sendDigest)

export default router