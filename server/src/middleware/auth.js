import jwt from 'jsonwebtoken'
import { db } from '../services/db.js'
import { httpError } from './errorHandler.js'

export const requireAuth = (req, res, next) => {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) throw httpError(401, 'Not authorized, no token')

  let payload
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    throw httpError(401, 'Not authorized, token is invalid')
  }

  req.user = payload
  next()
}

// Role is checked against the database, so demoting a user takes effect immediately.
export const requireAdmin = (req, res, next) => {
  const user = db.data.users.find((u) => u.id === req.user.id)
  if (!user || user.role !== 'admin') throw httpError(403, 'Admins only')
  next()
}