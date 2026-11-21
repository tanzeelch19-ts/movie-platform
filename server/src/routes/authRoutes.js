import { Router } from 'express'
import { register, login, me, updateMe, deleteMe } from '../controllers/authController.js'
import { requireAuth } from '../middleware/auth.js'
import { activityLogger, authEventLogger } from '../middleware/activity.js'

const router = Router()

router.post('/register', authEventLogger('register'), register)
router.post('/login', authEventLogger('login'), login)
router.get('/me', requireAuth, me)

router.patch(
  '/me',
  requireAuth,
  activityLogger((req) => {
    const body = req.body || {}
    if (body.newPassword !== undefined) return { type: 'password_change' }
    if (body.emailDigest !== undefined) {
      return { type: 'settings_update', details: { emailDigest: Boolean(body.emailDigest) } }
    }
    if (body.name !== undefined) return { type: 'profile_update', details: { name: String(body.name).trim() } }
    return null
  }),
  updateMe
)

router.delete('/me', requireAuth, deleteMe)

export default router