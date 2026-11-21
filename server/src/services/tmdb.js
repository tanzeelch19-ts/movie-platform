import { httpError } from '../middleware/errorHandler.js'

const TMDB_BASE = 'https://api.themoviedb.org/3'
const IMG_BASE = 'https://image.tmdb.org/t/p'

export async function tmdb(path, params = {}) {
  const key = process.env.TMDB_API_KEY
  if (!key) throw httpError(500, 'TMDB_API_KEY is not set in server/.env')

  const url = new URL(`${TMDB_BASE}${path}`)
  url.searchParams.set('api_key', key)
  url.searchParams.set('language', 'en-US')
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') url.searchParams.set(k, v)
  }

  let res
  try {
    res = await fetch(url)
  } catch {
    throw httpError(502, 'Could not reach TMDB')
  }
  if (!res.ok) {
    throw httpError(res.status === 404 ? 404 : 502, `TMDB request failed (${res.status}). Check TMDB_API_KEY.`)
  }
  return res.json()
}

export const poster = (path, size = 'w500') => (path ? `${IMG_BASE}/${size}${path}` : null)

export const toCard = (m) => ({
  id: m.id,
  title: m.title,
  overview: m.overview,
  posterUrl: poster(m.poster_path),
  backdropUrl: poster(m.backdrop_path, 'w1280'),
  releaseDate: m.release_date || null,
  rating: Number((m.vote_average || 0).toFixed(1)),
  voteCount: m.vote_count || 0,
  genreIds: m.genre_ids ?? (m.genres || []).map((g) => g.id),
})

// Small copy of a movie stored next to user data, so lists work without calling TMDB every time.
export async function movieSnapshot(id) {
  const m = await tmdb(`/movie/${id}`)
  return {
    movieId: String(m.id),
    title: m.title,
    posterUrl: poster(m.poster_path),
    releaseDate: m.release_date || null,
    tmdbRating: Number((m.vote_average || 0).toFixed(1)),
    genreIds: (m.genres || []).map((g) => g.id),
  }
}