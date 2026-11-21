import { Router } from 'express'
import {
  createReview,
  updateReview,
  deleteReview,
  getMovieReviews,
  getMyReviews,
} from '../controllers/reviewController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/movie/:movieId', getMovieReviews)
router.get('/mine', requireAuth, getMyReviews)
router.post('/', requireAuth, createReview)
router.put('/:id', requireAuth, updateReview)
router.delete('/:id', requireAuth, deleteReview)

export default router