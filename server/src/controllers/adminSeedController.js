import { getMovieCollection } from '../services/db.js'
import { httpError } from '../middleware/errorHandler.js'
import { importMovies } from '../services/seeder.js'

export const importFromTmdb = async (req, res) => {
  const { source = 'top_rated', startPage = 1, pages = 5 } = req.body || {}
  res.json(await importMovies({ source, startPage, pages }))
}

export const libraryStatus = async (req, res) => {
  const col = await getMovieCollection()
  const [count, latest] = await Promise.all([
    col.countDocuments(),
    col.find({}, { projection: { _id: 0, importedAt: 1 } }).sort({ importedAt: -1 }).limit(1).toArray(),
  ])
  res.json({ count, lastImportedAt: latest[0]?.importedAt || null })
}

// Removes a movie from the local library only. It does not affect TMDB.
export const deleteLibraryMovie = async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id)) throw httpError(400, 'Invalid movie id')

  const col = await getMovieCollection()
  const result = await col.deleteOne({ id })
  if (result.deletedCount === 0) throw httpError(404, 'Movie not found in library')
  res.json({ message: 'Removed from library' })
}