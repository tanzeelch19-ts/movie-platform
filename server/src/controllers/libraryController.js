import { db } from '../services/db.js'
import { httpError } from '../middleware/errorHandler.js'

const PAGE_SIZE = 20

const SORTS = {
  rating: (a, b) => b.rating - a.rating || b.voteCount - a.voteCount,
  newest: (a, b) => (b.releaseDate || '').localeCompare(a.releaseDate || ''),
  title: (a, b) => a.title.localeCompare(b.title),
}

export const getLibrary = (req, res) => {
  const q = String(req.query.q || '').trim().toLowerCase()
  const genre = req.query.genre ? Number(req.query.genre) : null
  const year = req.query.year ? Number(req.query.year) : null
  const minRating = req.query.minRating ? Number(req.query.minRating) : null
  const sort = SORTS[req.query.sort] ? req.query.sort : 'rating'
  const page = Math.max(Number(req.query.page) || 1, 1)

  if (genre !== null && !Number.isInteger(genre)) throw httpError(400, 'Invalid genre')
  if (year !== null && !(year >= 1870 && year <= 2100)) throw httpError(400, 'Year is not valid')
  if (minRating !== null && !(minRating >= 0 && minRating <= 10)) {
    throw httpError(400, 'Minimum rating must be between 0 and 10')
  }

  const matches = db.data.movies.filter(
    (m) =>
      (!q || m.title.toLowerCase().includes(q)) &&
      (genre === null || m.genres.some((g) => g.id === genre)) &&
      (year === null || m.year === year) &&
      (minRating === null || m.rating >= minRating)
  )

  const sorted = [...matches].sort(SORTS[sort])
  const total = sorted.length
  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1)
  const slice = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  res.json({
    page,
    totalPages,
    total,
    results: slice.map((m) => ({
      id: m.id,
      title: m.title,
      posterUrl: m.posterUrl,
      releaseDate: m.releaseDate,
      rating: m.rating,
      voteCount: m.voteCount,
      genreIds: m.genreIds,
    })),
  })
}