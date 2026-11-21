import { randomUUID } from 'crypto'
import { db } from '../services/db.js'
import { httpError } from '../middleware/errorHandler.js'
import { movieSnapshot } from '../services/tmdb.js'

const MAX_COLLECTIONS = 100
const MAX_MOVIES = 500

const parseName = (value) => {
  const name = String(value ?? '').trim()
  if (name.length < 1 || name.length > 60) throw httpError(400, 'Name must be between 1 and 60 characters')
  return name
}

const parseDescription = (value) => {
  const text = String(value ?? '').trim()
  if (text.length > 300) throw httpError(400, 'Description must be 300 characters or less')
  return text
}

const parseMovieId = (value) => {
  const id = String(value ?? '')
  if (!/^\d+$/.test(id)) throw httpError(400, 'Invalid movie id')
  return id
}

const ownedCollection = (id, userId) => {
  const collection = db.data.collections.find((c) => c.id === id)
  if (!collection) throw httpError(404, 'Collection not found')
  if (collection.userId !== userId) throw httpError(403, 'You can only access your own collections')
  return collection
}

const summary = (c, movieId) => ({
  id: c.id,
  name: c.name,
  description: c.description,
  itemCount: c.items.length,
  coverUrl: c.items[c.items.length - 1]?.posterUrl || null,
  updatedAt: c.updatedAt,
  ...(movieId !== undefined && { containsMovie: c.items.some((i) => i.movieId === movieId) }),
})

export const listCollections = (req, res) => {
  const movieId = req.query.movieId ? parseMovieId(req.query.movieId) : undefined
  const results = db.data.collections
    .filter((c) => c.userId === req.user.id)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map((c) => summary(c, movieId))
  res.json({ results })
}

export const createCollection = async (req, res) => {
  const body = req.body || {}
  const owned = db.data.collections.filter((c) => c.userId === req.user.id).length
  if (owned >= MAX_COLLECTIONS) throw httpError(400, `You can have up to ${MAX_COLLECTIONS} collections`)

  const now = new Date().toISOString()
  const collection = {
    id: randomUUID(),
    userId: req.user.id,
    name: parseName(body.name),
    description: parseDescription(body.description),
    items: [],
    createdAt: now,
    updatedAt: now,
  }

  db.data.collections.push(collection)
  await db.write()
  res.status(201).json({ collection: summary(collection) })
}

export const getCollection = (req, res) => {
  const c = ownedCollection(req.params.id, req.user.id)
  res.json({ ...summary(c), createdAt: c.createdAt, items: [...c.items].reverse() })
}

export const updateCollection = async (req, res) => {
  const body = req.body || {}
  const c = ownedCollection(req.params.id, req.user.id)
  if (body.name !== undefined) c.name = parseName(body.name)
  if (body.description !== undefined) c.description = parseDescription(body.description)
  c.updatedAt = new Date().toISOString()
  await db.write()
  res.json({ collection: summary(c) })
}

export const deleteCollection = async (req, res) => {
  ownedCollection(req.params.id, req.user.id)
  db.data.collections = db.data.collections.filter((c) => c.id !== req.params.id)
  await db.write()
  res.json({ message: 'Collection deleted' })
}

export const addMovie = async (req, res) => {
  const c = ownedCollection(req.params.id, req.user.id)
  const movieId = parseMovieId(req.params.movieId)

  if (!c.items.some((i) => i.movieId === movieId)) {
    if (c.items.length >= MAX_MOVIES) throw httpError(400, `A collection can hold up to ${MAX_MOVIES} movies`)
    const movie = await movieSnapshot(movieId)
    const now = new Date().toISOString()
    c.items.push({ ...movie, addedAt: now })
    c.updatedAt = now
    await db.write()
  }

  res.status(201).json({ message: 'Added to collection' })
}

export const removeMovie = async (req, res) => {
  const c = ownedCollection(req.params.id, req.user.id)
  const movieId = parseMovieId(req.params.movieId)
  c.items = c.items.filter((i) => i.movieId !== movieId)
  c.updatedAt = new Date().toISOString()
  await db.write()
  res.json({ message: 'Removed from collection' })
}