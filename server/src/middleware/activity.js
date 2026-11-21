import { db } from '../services/db.js'
import { logActivity, logLogin, logSearch } from '../services/activity.js'

const clientIp = (req) => req.ip || req.socket?.remoteAddress || ''

// Finds a movie title from anything already stored about that movie.
export function titleFor(movieId) {
  const id = String(movieId)
  const hit =
    
    db.data.watchlist.find((m) => m.movieId === id) ||
    db.data.watched.find((m) => m.movieId === id) ||
    db.data.reviews.find((m) => m.movieId === id) ||
    db.data.collections.flatMap((c) => c.items).find((i) => i.movieId === id)
  return hit?.title || null
}

export const collectionName = (id) => db.data.collections.find((c) => c.id === id)?.name || null

// Records a successful action for the signed-in user. describe(req) returns { type, details } or null.
export const activityLogger = (describe) => (req, res, next) => {
  const originalJson = res.json.bind(res)
  res.json = async (body) => {
    try {
      const entry = res.statusCode < 400 && req.user ? describe(req) : null
      if (entry) {
        logActivity(req.user.id, entry.type, entry.details || {})
        await db.write()
      }
    } catch (err) {
      console.error('Activity log failed:', err.message)
    }
    return originalJson(body)
  }
  next()
}

// Records sign-ins and sign-ups, including failed attempts.
export const authEventLogger = (kind) => (req, res, next) => {
  const originalJson = res.json.bind(res)
  res.json = async (body) => {
    try {
      const success = res.statusCode < 400
      const email = String(req.body?.email || '').trim().toLowerCase()
      const userId = success
        ? body?.user?.id || null
        : db.data.users.find((u) => u.email === email)?.id || null

      logLogin({
        userId,
        email,
        kind,
        success,
        ip: clientIp(req),
        userAgent: String(req.headers['user-agent'] || '').slice(0, 200),
      })
      await db.write()
    } catch (err) {
      console.error('Login log failed:', err.message)
    }
    return originalJson(body)
  }
  next()
}

// Records a search for the signed-in user. Only the first page counts as a new search.
export const recordSearch = (source) => async (req, res, next) => {
  try {
    const query = String(req.query.q || '').trim().slice(0, 100)
    const firstPage = String(req.query.page || '1') === '1'
    if (req.user && query && firstPage && logSearch({ userId: req.user.id, query, source })) {
      await db.write()
    }
  } catch (err) {
    console.error('Search log failed:', err.message)
  }
  next()
}