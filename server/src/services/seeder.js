import { db } from './db.js'
import { tmdb, poster } from './tmdb.js'
import { httpError } from '../middleware/errorHandler.js'

const SOURCES = {
  top_rated: '/movie/top_rated',
  popular: '/movie/popular',
  now_playing: '/movie/now_playing',
  upcoming: '/movie/upcoming',
}

const MAX_PAGES = 10
const CONCURRENCY = 5

const toRecord = (m) => {
  const trailer = m.videos?.results?.find((v) => v.site === 'YouTube' && v.type === 'Trailer')
  const genres = (m.genres || []).map((g) => ({ id: g.id, name: g.name }))

  return {
    id: m.id,
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

export async function seedMovies({ source = 'top_rated', pages = 1 }) {
  const path = SOURCES[source]
  if (!path) throw httpError(400, `Unknown source. Use one of: ${Object.keys(SOURCES).join(', ')}`)

  const pageCount = Math.min(Math.max(Number(pages) || 1, 1), MAX_PAGES)

  // Collect unique movie ids from the list pages.
  const ids = new Set()
  for (let page = 1; page <= pageCount; page++) {
    const data = await tmdb(path, { page })
    data.results.forEach((m) => ids.add(m.id))
    if (page >= data.total_pages) break
  }

  // Fetch full details in small parallel batches to stay under TMDB rate limits.
  const list = [...ids]
  let added = 0
  let updated = 0
  let failed = 0

  for (let i = 0; i < list.length; i += CONCURRENCY) {
    const batch = list.slice(i, i + CONCURRENCY)
    const settled = await Promise.allSettled(
      batch.map((id) => tmdb(`/movie/${id}`, { append_to_response: 'credits,videos' }))
    )

    for (const result of settled) {
      if (result.status !== 'fulfilled') {
        failed++
        continue
      }
      const record = toRecord(result.value)
      const index = db.data.movies.findIndex((m) => String(m.id) === String(record.id))
      if (index === -1) {
        db.data.movies.push(record)
        added++
      } else {
        // Re-importing refreshes ratings and details, without creating duplicates.
        db.data.movies[index] = record
        updated++
      }
    }
  }

  await db.write()

  return {
    source,
    pages: pageCount,
    found: list.length,
    added,
    updated,
    failed,
    total: db.data.movies.length,
  }
}