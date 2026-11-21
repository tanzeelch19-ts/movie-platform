import { getMovieCollection } from '../services/db.js'
import { httpError } from '../middleware/errorHandler.js'

const PAGE_SIZE = 20

const SORTS = {
  rating: { rating: -1, voteCount: -1 },
  newest: { releaseDate: -1 },
  title: { title: 1 },
}

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const CARD_FIELDS = { _id: 0, id: 1, title: 1, posterUrl: 1, releaseDate: 1, rating: 1, voteCount: 1, genreIds: 1 }

export const getLibrary = async (req, res) => {
  const q = String(req.query.q || '').trim().slice(0, 100)
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

  const filter = {}
  if (q) filter.title = { $regex: escapeRegex(q), $options: 'i' }
  if (genre !== null) filter.genreIds = genre
  if (year !== null) filter.year = year
  if (minRating !== null) filter.rating = { $gte: minRating }

  const col = await getMovieCollection()
  const total = await col.countDocuments(filter)
  const results = await col
    .find(filter, { projection: CARD_FIELDS })
    .sort(SORTS[sort])
    .skip((page - 1) * PAGE_SIZE)
    .limit(PAGE_SIZE)
    .toArray()

  res.json({
    page,
    totalPages: Math.max(Math.ceil(total / PAGE_SIZE), 1),
    total,
    results,
  })
}