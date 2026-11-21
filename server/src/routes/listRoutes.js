import { Router } from 'express'
import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  getWatched,
  markWatched,
  unmarkWatched,
  getStatus,
} from '../controllers/listController.js'
import { requireAuth } from '../middleware/auth.js'
import { activityLogger, titleFor } from '../middleware/activity.js'

const router = Router()

router.use(requireAuth)

const logMovie = (type) =>
  activityLogger((req) => {
    const movieId = String(req.params.movieId)
    return { type, details: { movieId, title: titleFor(movieId) } }
  })

router.get('/watchlist', getWatchlist)
router.post('/watchlist/:movieId', logMovie('watchlist_add'), addToWatchlist)
router.delete('/watchlist/:movieId', logMovie('watchlist_remove'), removeFromWatchlist)

router.get('/watched', getWatched)
router.post('/watched/:movieId', logMovie('watched_add'), markWatched)
router.delete('/watched/:movieId', logMovie('watched_remove'), unmarkWatched)

router.get('/status/:movieId', getStatus)

export default router