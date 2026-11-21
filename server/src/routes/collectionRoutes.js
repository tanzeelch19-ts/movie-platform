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
import { activityLogger, titleFor, collectionName } from '../middleware/activity.js'

const router = Router()

router.use(requireAuth)

router.get('/', listCollections)
router.post(
  '/',
  activityLogger((req) => ({
    type: 'collection_create',
    details: { name: String((req.body || {}).name || '').trim() },
  })),
  createCollection
)
router.get('/:id', getCollection)
router.patch(
  '/:id',
  activityLogger((req) => ({
    type: 'collection_update',
    details: { name: String((req.body || {}).name || '').trim() || null },
  })),
  updateCollection
)
router.delete(
  '/:id',
  activityLogger((req) => ({ type: 'collection_delete', details: { collectionId: req.params.id } })),
  deleteCollection
)

const movieAction = (type) =>
  activityLogger((req) => {
    const movieId = String(req.params.movieId)
    return { type, details: { movieId, title: titleFor(movieId), collection: collectionName(req.params.id) } }
  })

router.post('/:id/movies/:movieId', movieAction('collection_add_movie'), addMovie)
router.delete('/:id/movies/:movieId', movieAction('collection_remove_movie'), removeMovie)

export default router