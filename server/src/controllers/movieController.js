import { httpError } from '../middleware/errorHandler.js'
import { getMovieCollection } from '../services/db.js'
import { tmdb, toCard, poster } from '../services/tmdb.js'

const paged = (data) => ({
  page: data.page,
  totalPages: data.total_pages,
  results: data.results.map(toCard),
})

export const getTrending = async (req, res) => {
  const data = await tmdb('/trending/movie/week', { page: req.query.page || 1 })
  res.json(paged(data))
}

export const searchMovies = async (req, res) => {
  const q = String(req.query.q || '').trim()
  if (!q) throw httpError(400, 'Search query is required')

  const data = await tmdb('/search/movie', {
    query: q,
    page: req.query.page || 1,
    include_adult: false,
  })
  res.json(paged(data))
}

export const discoverMovies = async (req, res) => {
  const { page = 1, genre, year, minRating, sort = 'popularity.desc' } = req.query

  const allowedSort = ['popularity.desc', 'vote_average.desc', 'primary_release_date.desc']
  if (!allowedSort.includes(sort)) throw httpError(400, 'Invalid sort option')
  if (year && !/^\d{4}$/.test(year)) throw httpError(400, 'Year must be 4 digits')
  if (minRating && (Number(minRating) < 0 || Number(minRating) > 10)) {
    throw httpError(400, 'Minimum rating must be between 0 and 10')
  }

  const data = await tmdb('/discover/movie', {
    page,
    sort_by: sort,
    with_genres: genre,
    primary_release_year: year,
    'vote_average.gte': minRating,
    'vote_count.gte': minRating ? 100 : undefined,
    include_adult: false,
  })
  res.json(paged(data))
}

export const getGenres = async (req, res) => {
  const data = await tmdb('/genre/movie/list')
  res.json({ genres: data.genres })
}

export const getMovieDetails = async (req, res) => {
  const id = req.params.id
  if (!/^\d+$/.test(id)) throw httpError(400, 'Invalid movie id')

  // Movies imported into the library are served from the local collection, without a TMDB call.
  const col = await getMovieCollection()
  const local = await col.findOne({ id: Number(id) }, { projection: { _id: 0 } })
  if (local) return res.json(local)

  const data = await tmdb(`/movie/${id}`, { append_to_response: 'credits,videos' })

  const trailer = data.videos?.results?.find((v) => v.site === 'YouTube' && v.type === 'Trailer')

  res.json({
    ...toCard(data),
    tagline: data.tagline,
    runtime: data.runtime,
    genres: data.genres,
    director: data.credits?.crew?.find((c) => c.job === 'Director')?.name || null,
    cast: (data.credits?.cast || []).slice(0, 10).map((c) => ({
      id: c.id,
      name: c.name,
      character: c.character,
      photoUrl: poster(c.profile_path, 'w185'),
    })),
    trailerKey: trailer?.key || null,
  })
}