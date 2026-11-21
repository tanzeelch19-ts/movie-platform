import crypto from 'crypto'
import { httpError } from '../middleware/errorHandler.js'
import { db } from '../services/db.js'
import { sendWeeklyDigest } from '../services/digest.js'

const safeEqual = (a, b) =>
  a.length > 0 && a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))

// Works for manual calls (x-cron-secret header) and for Vercel Cron (Authorization: Bearer <secret>).
export const runDigest = async (req, res) => {
  const expected = process.env.CRON_SECRET || ''
  const bearer = (req.headers.authorization || '').replace(/^Bearer /, '')
  const given = String(req.headers['x-cron-secret'] || bearer)

  if (!safeEqual(given, expected)) throw httpError(401, 'Unauthorized')

  // Vercel Cron runs once a day. The weekly digest goes out on Mondays only, and once per day.
  const force = req.query.force === 'true'
  const today = new Date().toLocaleDateString('en-CA')

  if (!force && new Date().getUTCDay() !== 1) {
    return res.json({ skipped: true, reason: 'The weekly digest runs on Mondays (UTC).' })
  }
  if (!force && db.data.meta.lastDigestDate === today) {
    return res.json({ skipped: true, reason: 'Digest already sent today.' })
  }

  const result = await sendWeeklyDigest()
  res.json(result)
}