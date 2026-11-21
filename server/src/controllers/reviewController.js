import { randomUUID } from 'crypto'
import { db } from '../services/db.js'
import { httpError } from '../middleware/errorHandler.js'
import { movieSnapshot } from '../services/tmdb.js'

const nameOf = () => Object.fromEntries(db.data.users.map((u) => [u.id, u.name]))

const validate = (rating, body) => {
  const r = Number(rating)
  if (!Number.isInteger(r) || r < 1 || r > 5) throw httpError(400, 'Rating must be a whole number from 1 to 5')
  const text = String(body ?? '').trim()
  if (text.length > 2000) throw httpError(400, 'Review must be 2000 characters or less')
  return { rating: r, body: text }
}

// Reviewing a movie counts as watching it.
const ensureWatched = (userId, movie, now) => {
  const exists = db.data.watched.some((w) => w.userId === userId && w.movieId === movie.movieId)
  if (!exists) db.data.watched.push({ userId, ...movie, watchedAt: now })
  db.data.watchlist = db.data.watchlist.filter(
    (w) => !(w.userId === userId && w.movieId === movie.movieId)
  )
}

const shape = (r, names) => ({
  id: r.id,
  userId: r.userId,
  userName: names[r.userId] || 'Deleted user',
  movieId: r.movieId,
  movieTitle: r.title,
  posterUrl: r.posterUrl,
  rating: r.rating,
  body: r.body,
  createdAt: r.createdAt,
  updatedAt: r.updatedAt,
  hidden: Boolean(r.hidden),
})

export const createReview = async (req, res) => {
  const movieId = String(req.body.movieId || '')
  if (!/^\d+$/.test(movieId)) throw httpError(400, 'A valid movieId is required')
  const { rating, body } = validate(req.body.rating, req.body.body)

  if (db.data.reviews.some((r) => r.userId === req.user.id && r.movieId === movieId)) {
    throw httpError(409, 'You have already reviewed this movie. Edit your existing review instead.')
  }

  const movie = await movieSnapshot(movieId)
  const now = new Date().toISOString()
  const review = {
    id: randomUUID(),
    userId: req.user.id,
    ...movie,
    rating,
    body,
    hidden: false,
    createdAt: now,
    updatedAt: now,
  }

  db.data.reviews.push(review)
  ensureWatched(req.user.id, movie, now)
  await db.write()

  res.status(201).json({ review: shape(review, nameOf()) })
}

export const updateReview = async (req, res) => {
  const review = db.data.reviews.find((r) => r.id === req.params.id)
  if (!review) throw httpError(404, 'Review not found')
  if (review.userId !== req.user.id) throw httpError(403, 'You can only edit your own review')

  const { rating, body } = validate(req.body.rating, req.body.body)
  Object.assign(review, { rating, body, updatedAt: new Date().toISOString() })
  await db.write()
  res.json({ review: shape(review, nameOf()) })
}

// Owners and admins can delete a review.
export const deleteReview = async (req, res) => {
  const review = db.data.reviews.find((r) => r.id === req.params.id)
  if (!review) throw httpError(404, 'Review not found')

  const user = db.data.users.find((u) => u.id === req.user.id)
  if (review.userId !== req.user.id && user?.role !== 'admin') {
    throw httpError(403, 'You can only delete your own review')
  }

  db.data.reviews = db.data.reviews.filter((r) => r.id !== req.params.id)
  await db.write()
  res.json({ message: 'Review deleted' })
}

// Public: anyone can read reviews for a movie. Hidden reviews are excluded.
export const getMovieReviews = (req, res) => {
  const movieId = String(req.params.movieId)
  const names = nameOf()
  const list = db.data.reviews
    .filter((r) => r.movieId === movieId && !r.hidden)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const count = list.length
  const average = count ? Number((list.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1)) : 0
  res.json({ average, count, results: list.map((r) => shape(r, names)) })
}

export const getMyReviews = (req, res) => {
  const names = nameOf()
  const results = db.data.reviews
    .filter((r) => r.userId === req.user.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((r) => shape(r, names))
  res.json({ results })
}