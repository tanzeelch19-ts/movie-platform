import { Router } from 'express'
import {
  createReview,
  updateReview,
  deleteReview,
  getMovieReviews,
  getMyReviews,
} from '../controllers/reviewController.js'
import { requireAuth } from '../middleware/auth.js'
import { activityLogger, titleFor } from '../middleware/activity.js'
import { db } from '../services/db.js'

const router = Router()

router.get('/movie/:movieId', getMovieReviews)
router.get('/mine', requireAuth, getMyReviews)

router.post(
  '/',
  requireAuth,
  activityLogger((req) => {
    const body = req.body || {}
    const movieId = String(body.movieId || '')
    return { type: 'review_create', details: { movieId, title: titleFor(movieId), rating: body.rating } }
  }),
  createReview
)

router.put(
  '/:id',
  requireAuth,
  activityLogger((req) => {
    const review = db.data.reviews.find((r) => r.id === req.params.id)
    return {
      type: 'review_update',
      details: { title: review ? titleFor(review.movieId) : null, rating: (req.body || {}).rating },
    }
  }),
  updateReview
)

router.delete(
  '/:id',
  requireAuth,
  activityLogger((req) => ({ type: 'review_delete', details: { reviewId: req.params.id } })),
  deleteReview
)

export default router