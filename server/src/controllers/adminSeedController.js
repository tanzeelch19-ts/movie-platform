import { db } from '../services/db.js'
import { httpError } from '../middleware/errorHandler.js'
import { seedMovies } from '../services/seeder.js'

export const seedFromTmdb = async (req, res) => {
  const { source = 'top_rated', pages = 1 } = req.body || {}
  const result = await seedMovies({ source, pages })
  res.json(result)
}

export const libraryStatus = (req, res) => {
  const movies = db.data.movies
  const lastImportedAt = movies.reduce(
    (latest, m) => (m.importedAt > (latest || '') ? m.importedAt : latest),
    null
  )
  res.json({ count: movies.length, lastImportedAt })
}

// Removes a movie from the local library only. It does not affect TMDB.
export const deleteLibraryMovie = async (req, res) => {
  const id = String(req.params.id)
  const before = db.data.movies.length
  db.data.movies = db.data.movies.filter((m) => String(m.id) !== id)
  if (db.data.movies.length === before) throw httpError(404, 'Movie not found in library')
  await db.write()
  res.json({ message: 'Removed from library' })
}