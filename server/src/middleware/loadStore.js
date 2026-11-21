import { db } from '../services/db.js'
import { httpError } from './errorHandler.js'

// Loads the latest data before each API request, so every serverless instance sees current state.
export const loadStore = async (req, res, next) => {
  try {
    await db.load()
    next()
  } catch (err) {
    console.error('Database error:', err.message)
    next(httpError(503, 'Database is unavailable. Check MONGO_URI and MongoDB Atlas network access.'))
  }
}