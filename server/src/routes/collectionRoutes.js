import { Router } from 'express'
import {
  listCollections,
  createCollection,
  getCollection,
  updateCollection,
  deleteCollection,
  addMovie,
  removeMovie,
} from '../controllers/collectionController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.use(requireAuth)

router.get('/', listCollections)
router.post('/', createCollection)
router.get('/:id', getCollection)
router.patch('/:id', updateCollection)
router.delete('/:id', deleteCollection)
router.post('/:id/movies/:movieId', addMovie)
router.delete('/:id/movies/:movieId', removeMovie)

export default router