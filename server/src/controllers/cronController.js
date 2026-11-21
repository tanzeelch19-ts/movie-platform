import crypto from 'crypto'
import { httpError } from '../middleware/errorHandler.js'
import { sendWeeklyDigest } from '../services/digest.js'

// Called by an external scheduler (Render cron, GitHub Actions, cron-job.org).
// Requires CRON_SECRET in the x-cron-secret header.
export const runDigest = async (req, res) => {
  const expected = process.env.CRON_SECRET || ''
  const given = String(req.headers['x-cron-secret'] || '')

  const valid =
    expected.length > 0 &&
    given.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(given), Buffer.from(expected))

  if (!valid) throw httpError(401, 'Unauthorized')

  const result = await sendWeeklyDigest()
  res.json(result)
}