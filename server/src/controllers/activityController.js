import { db } from '../services/db.js'
import { httpError } from '../middleware/errorHandler.js'

const newestFirst = (list) => [...list].reverse()
const mine = (list, userId) => list.filter((x) => x.userId === userId)

export const listLogins = (req, res) => {
  const results = newestFirst(mine(db.data.logins, req.user.id))
    .slice(0, 50)
    .map(({ id, kind, success, ip, userAgent, createdAt }) => ({ id, kind, success, ip, userAgent, createdAt }))
  res.json({ results })
}

// Unique recent queries, newest first.
export const listSearches = (req, res) => {
  const seen = new Set()
  const results = []
  for (const s of newestFirst(mine(db.data.searches, req.user.id))) {
    const key = s.query.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    results.push({ id: s.id, query: s.query, source: s.source, createdAt: s.createdAt })
    if (results.length === 20) break
  }
  res.json({ results })
}

export const clearSearches = async (req, res) => {
  db.data.searches = db.data.searches.filter((s) => s.userId !== req.user.id)
  await db.write()
  res.json({ message: 'Search history cleared' })
}

export const listActivity = (req, res) => {
  const PAGE_SIZE = 20
  const page = Math.max(Number(req.query.page) || 1, 1)
  const list = newestFirst(mine(db.data.activity, req.user.id))
  const totalPages = Math.max(Math.ceil(list.length / PAGE_SIZE), 1)

  res.json({
    page,
    totalPages,
    results: list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
  })
}

// Admin view of one user's full history.
export const userActivity = (req, res) => {
  const id = req.params.id
  const user = db.data.users.find((u) => u.id === id)
  if (!user) throw httpError(404, 'User not found')

  res.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt },
    logins: newestFirst(mine(db.data.logins, id)).slice(0, 100),
    searches: newestFirst(mine(db.data.searches, id)).slice(0, 100),
    activity: newestFirst(mine(db.data.activity, id)).slice(0, 200),
  })
}