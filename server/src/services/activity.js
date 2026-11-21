import { randomUUID } from 'crypto'
import { db } from './db.js'

// Global caps keep the single store document small. Oldest entries are dropped first.
const LIMITS = { activity: 5000, logins: 2000, searches: 5000 }

const trim = (list, max) => {
  if (list.length > max) list.splice(0, list.length - max)
}

const now = () => new Date().toISOString()

export function logActivity(userId, type, details = {}) {
  db.data.activity.push({ id: randomUUID(), userId, type, details, createdAt: now() })
  trim(db.data.activity, LIMITS.activity)
}

export function logLogin({ userId, email, kind, success, ip, userAgent }) {
  db.data.logins.push({ id: randomUUID(), userId, email, kind, success, ip, userAgent, createdAt: now() })
  trim(db.data.logins, LIMITS.logins)
}

// Returns false when the same query was just searched, so repeated filter changes do not flood history.
export function logSearch({ userId, query, source }) {
  const last = [...db.data.searches].reverse().find((s) => s.userId === userId)
  if (last && last.query.toLowerCase() === query.toLowerCase()) return false

  db.data.searches.push({ id: randomUUID(), userId, query, source, createdAt: now() })
  trim(db.data.searches, LIMITS.searches)
  return true
}