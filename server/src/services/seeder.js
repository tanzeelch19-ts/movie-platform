import { tmdb, poster } from './tmdb.js'
import { upsertMovies, getMovieCollection } from './db.js'
import { httpError } from '../middleware/errorHandler.js'

const SOURCES = {
  top_rated: '/movie/top_rated',
  popular: '/movie/popular',
  now_playing: '/movie/now_playing',
  upcoming: '/movie/upcoming',
}

// One call fetches at most this many list pages (20 movies each), so it finishes within the serverless time limit.
const PAGES_PER_CALL = 5
// TMDB lists stop at page 500.
const TMDB_PAGE_LIMIT = 500
const CONCURRENCY = 5

const toRecord = (m) => {
  const trailer = m.videos?.results?.find((v) => v.site === 'YouTube' && v.type === 'Trailer')
  const genres = (m.genres || []).map((g) => ({ id: g.id, name: g.name }))

  return {
    id: Number(m.id),
    title: m.title,
    tagline: m.tagline || '',
    overview: m.overview || '',
    posterUrl: poster(m.poster_path),
    backdropUrl: poster(m.backdrop_path, 'w1280'),
    releaseDate: m.release_date || null,
    year: m.release_date ? Number(m.release_date.slice(0, 4)) : null,
    runtime: m.runtime || 0,
    rating: Number((m.vote_average || 0).toFixed(1)),
    voteCount: m.vote_count || 0,
    genres,
    genreIds: genres.map((g) => g.id),
    director: m.credits?.crew?.find((c) => c.job === 'Director')?.name || null,
    cast: (m.credits?.cast || []).slice(0, 10).map((c) => ({
      id: c.id,
      name: c.name,
      character: c.character,
      photoUrl: poster(c.profile_path, 'w185'),
    })),
    trailerKey: trailer?.key || null,
    importedAt: new Date().toISOString(),
  }
}

// Imports a few list pages starting at startPage. The client calls this again with nextPage until done.
export async function importMovies({ source = 'top_rated', startPage = 1, pages = PAGES_PER_CALL }) {
  const listPath = SOURCES[source]
  if (!listPath) throw httpError(400, `Unknown source. Use one of: ${Object.keys(SOURCES).join(', ')}`)

  const from = Math.max(Number(startPage) || 1, 1)
  const span = Math.min(Math.max(Number(pages) || 1, 1), PAGES_PER_CALL)

  const ids = new Set()
  let totalPages = TMDB_PAGE_LIMIT
  let lastPage = from - 1

  for (let page = from; page < from + span && page <= totalPages; page++) {
    const data = await tmdb(listPath, { page })
    totalPages = Math.min(data.total_pages, TMDB_PAGE_LIMIT)
    data.results.forEach((m) => ids.add(m.id))
    lastPage = page
  }

  const list = [...ids]
  const records = []
  let failed = 0

  for (let i = 0; i < list.length; i += CONCURRENCY) {
    const settled = await Promise.allSettled(
      list.slice(i, i + CONCURRENCY).map((id) => tmdb(`/movie/${id}`, { append_to_response: 'credits,videos' }))
    )
    for (const result of settled) {
      if (result.status === 'fulfilled') records.push(toRecord(result.value))
      else failed++
    }
  }

  const { added, updated } = await upsertMovies(records)
  const col = await getMovieCollection()
  const totalMovies = await col.countDocuments()

  return {
    source,
    fromPage: from,
    toPage: lastPage,
    nextPage: lastPage + 1,
    done: lastPage < from || lastPage >= totalPages,
    found: list.length,
    added,
    updated,
    failed,
    totalMovies,
  }
}