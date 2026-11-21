import { db } from '../services/db.js'
import { movieSnapshot } from '../services/tmdb.js'

const findEntry = (list, userId, movieId) =>
  db.data[list].find((x) => x.userId === userId && x.movieId === movieId)

const removeEntry = (list, userId, movieId) => {
  db.data[list] = db.data[list].filter((x) => !(x.userId === userId && x.movieId === movieId))
}

const userItems = (list, userId) => db.data[list].filter((x) => x.userId === userId)

const toCard = (e) => ({
  id: e.movieId,
  title: e.title,
  posterUrl: e.posterUrl,
  releaseDate: e.releaseDate,
  rating: e.tmdbRating ?? 0,
})

export const getWatchlist = (req, res) => {
  const results = userItems('watchlist', req.user.id)
    .sort((a, b) => b.addedAt.localeCompare(a.addedAt))
    .map(toCard)
  res.json({ results })
}

export const addToWatchlist = async (req, res) => {
  const movieId = String(req.params.movieId)
  if (findEntry('watchlist', req.user.id, movieId)) {
    return res.json({ message: 'Already in watchlist' })
  }

  const movie = await movieSnapshot(movieId)
  db.data.watchlist.push({ userId: req.user.id, ...movie, addedAt: new Date().toISOString() })
  await db.write()
  res.status(201).json({ message: 'Added to watchlist' })
}

export const removeFromWatchlist = async (req, res) => {
  removeEntry('watchlist', req.user.id, String(req.params.movieId))
  await db.write()
  res.json({ message: 'Removed from watchlist' })
}

export const getWatched = (req, res) => {
  const results = userItems('watched', req.user.id)
    .sort((a, b) => b.watchedAt.localeCompare(a.watchedAt))
    .map((e) => ({ ...toCard(e), watchedAt: e.watchedAt }))
  res.json({ results })
}

export const markWatched = async (req, res) => {
  const movieId = String(req.params.movieId)
  if (!findEntry('watched', req.user.id, movieId)) {
    const movie = await movieSnapshot(movieId)
    db.data.watched.push({ userId: req.user.id, ...movie, watchedAt: new Date().toISOString() })
  }
  // A watched movie should not stay in the watchlist.
  removeEntry('watchlist', req.user.id, movieId)
  await db.write()
  res.status(201).json({ message: 'Marked as watched' })
}

export const unmarkWatched = async (req, res) => {
  removeEntry('watched', req.user.id, String(req.params.movieId))
  await db.write()
  res.json({ message: 'Removed from watched' })
}

// One call that tells the movie page what to show for this user.
export const getStatus = (req, res) => {
  const movieId = String(req.params.movieId)
  const review = db.data.reviews.find((r) => r.userId === req.user.id && r.movieId === movieId)
  res.json({
    inWatchlist: Boolean(findEntry('watchlist', req.user.id, movieId)),
    watched: Boolean(findEntry('watched', req.user.id, movieId)),
    review: review ? { id: review.id, rating: review.rating, body: review.body } : null,
  })
}