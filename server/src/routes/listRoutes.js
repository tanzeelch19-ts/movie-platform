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

const router = Router()

router.use(requireAuth)

router.get('/watchlist', getWatchlist)
router.post('/watchlist/:movieId', addToWatchlist)
router.delete('/watchlist/:movieId', removeFromWatchlist)

router.get('/watched', getWatched)
router.post('/watched/:movieId', markWatched)
router.delete('/watched/:movieId', unmarkWatched)

router.get('/status/:movieId', getStatus)

export default router