import { db } from './db.js'
import { tmdb, toCard } from './tmdb.js'

// Reviews use the user's 1-5 stars. Movies watched without a review count as a neutral 3.
function buildRatings() {
  const ratings = new Map()
  const put = (userId, movieId, value) => {
    if (!ratings.has(userId)) ratings.set(userId, new Map())
    ratings.get(userId).set(movieId, value)
  }
  for (const w of db.data.watched) put(w.userId, w.movieId, 3)
  for (const r of db.data.reviews) if (!r.hidden) put(r.userId, r.movieId, r.rating)
  return ratings
}

// Cosine similarity between two users' rating maps (0 when they share no movies).
function cosine(a, b) {
  let dot = 0
  for (const [id, value] of a) {
    if (b.has(id)) dot += value * b.get(id)
  }
  if (dot === 0) return 0
  const norm = (m) => Math.sqrt([...m.values()].reduce((sum, v) => sum + v * v, 0))
  return dot / (norm(a) * norm(b))
}

const fromEntry = (entry, reason) => ({
  id: entry.movieId,
  title: entry.title,
  posterUrl: entry.posterUrl,
  releaseDate: entry.releaseDate,
  rating: entry.tmdbRating ?? 0,
  reason,
})

export async function getRecommendations(userId, limit = 12) {
  const ratings = buildRatings()
  const mine = ratings.get(userId) || new Map()

  const movieIndex = new Map()
  for (const entry of [...db.data.watched, ...db.data.reviews]) {
    if (!movieIndex.has(entry.movieId)) movieIndex.set(entry.movieId, entry)
  }

  // Collaborative filtering: movies that similar users rated highly and this user has not rated yet.
  const scores = new Map()
  for (const [otherId, theirs] of ratings) {
    if (otherId === userId) continue
    const similarity = cosine(mine, theirs)
    if (similarity <= 0) continue
    for (const [movieId, value] of theirs) {
      if (mine.has(movieId) || value < 4 || !movieIndex.has(movieId)) continue
      scores.set(movieId, (scores.get(movieId) || 0) + similarity * value)
    }
  }

  const results = [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([movieId]) => fromEntry(movieIndex.get(movieId), 'Liked by people with similar taste'))

  if (results.length >= 6) return results

  // Fallback for new or small communities: popular movies in the user's most-watched genre.
  const genreCounts = new Map()
  for (const entry of [...db.data.watched, ...db.data.reviews]) {
    if (entry.userId !== userId) continue
    for (const g of entry.genreIds || []) genreCounts.set(g, (genreCounts.get(g) || 0) + 1)
  }
  const topGenre = [...genreCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]

  const data = await tmdb('/discover/movie', {
    sort_by: 'vote_average.desc',
    'vote_count.gte': 500,
    with_genres: topGenre,
  })

  const reason = topGenre ? 'Highly rated in a genre you watch' : 'Highly rated on TMDB'
  const seen = new Set([...mine.keys(), ...results.map((r) => r.id)])
  const extra = data.results
    .map(toCard)
    .filter((m) => !seen.has(String(m.id)))
    .slice(0, limit - results.length)
    .map((m) => ({
      id: String(m.id),
      title: m.title,
      posterUrl: m.posterUrl,
      releaseDate: m.releaseDate,
      rating: m.rating,
      reason,
    }))

  return [...results, ...extra]
}