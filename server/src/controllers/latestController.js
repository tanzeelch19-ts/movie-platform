import { tmdb, toCard } from '../services/tmdb.js'

const paged = (data) => ({
  page: data.page,
  totalPages: data.total_pages,
  results: data.results.map(toCard),
})

export const getNowPlaying = async (req, res) => {
  const data = await tmdb('/movie/now_playing', { page: req.query.page || 1 })
  res.json(paged(data))
}

export const getUpcoming = async (req, res) => {
  const data = await tmdb('/movie/upcoming', { page: req.query.page || 1 })
  res.json(paged(data))
}