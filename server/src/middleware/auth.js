import jwt from 'jsonwebtoken'
import { db } from '../services/db.js'
import { httpError } from './errorHandler.js'

const readToken = (req) => {
  const header = req.headers.authorization || ''
  return header.startsWith('Bearer ') ? header.slice(7) : null
}

export const requireAuth = (req, res, next) => {
  const token = readToken(req)
  if (!token) throw httpError(401, 'Not authorized, no token')

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    throw httpError(401, 'Not authorized, token is invalid')
  }
  next()
}

// Attaches req.user when a valid token is present, but never blocks the request.
export const optionalAuth = (req, res, next) => {
  const token = readToken(req)
  if (token) {
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET)
    } catch {
      // Invalid token: treat the request as a guest.
    }
  }
  next()
}

// Role is checked against the database, so demoting a user takes effect immediately.
export const requireAdmin = (req, res, next) => {
  const user = db.data.users.find((u) => u.id === req.user.id)
  if (!user || user.role !== 'admin') throw httpError(403, 'Admins only')
  next()
}