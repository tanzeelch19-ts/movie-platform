import { Router } from 'express'
import {
  getTrending,
  searchMovies,
  discoverMovies,
  getGenres,
  getMovieDetails,
} from '../controllers/movieController.js'
import { getNowPlaying, getUpcoming } from '../controllers/latestController.js'

const router = Router()

// Fixed paths must come before '/:id', otherwise Express treats them as movie ids.
router.get('/trending', getTrending)
router.get('/now-playing', getNowPlaying)
router.get('/upcoming', getUpcoming)
router.get('/search', searchMovies)
router.get('/discover', discoverMovies)
router.get('/genres', getGenres)
router.get('/:id', getMovieDetails)

export default router