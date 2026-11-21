import { Router } from 'express'
import { listActivity, listLogins, listSearches, clearSearches } from '../controllers/activityController.js'
import { requireAuth } from '../middleware/auth.js'
import { activityLogger } from '../middleware/activity.js'

const router = Router()

router.use(requireAuth)

router.get('/', listActivity)
router.get('/logins', listLogins)
router.get('/searches', listSearches)
router.delete('/searches', clearSearches)
router.post('/logout', activityLogger(() => ({ type: 'logout' })), (req, res) => res.json({ message: 'Logged out' }))

export default router