import { Router } from 'express'
import {
  getTrending,
  searchMovies,
  discoverMovies,
  getGenres,
  getMovieDetails,
} from '../controllers/movieController.js'
import { getNowPlaying, getUpcoming } from '../controllers/latestController.js'
import { getLibrary } from '../controllers/libraryController.js'
import { optionalAuth } from '../middleware/auth.js'
import { recordSearch } from '../middleware/activity.js'

const router = Router()

// Fixed paths must come before '/:id', otherwise Express treats them as movie ids.
router.get('/library', optionalAuth, recordSearch('library'), getLibrary)
router.get('/trending', getTrending)
router.get('/now-playing', getNowPlaying)
router.get('/upcoming', getUpcoming)
router.get('/search', optionalAuth, recordSearch('tmdb'), searchMovies)
router.get('/discover', discoverMovies)
router.get('/genres', getGenres)
router.get('/:id', getMovieDetails)

export default router