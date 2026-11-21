import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { MongoClient } from 'mongodb'

const here = path.dirname(fileURLToPath(import.meta.url))
// Old local JSON file from earlier versions. Used once, to move existing data into MongoDB.
const legacyFile = path.resolve(here, '..', '..', 'data', 'db.json')

// User data lives in one document ("store"). Movies live in their own collection, so the store stays small.
const DOC_ID = 'store'
const DEFAULTS = {
  users: [],
  watchlist: [],
  watched: [],
  reviews: [],
  collections: [],
  logins: [],
  searches: [],
  activity: [],
  meta: {},
}

let clientPromise = null
let indexesReady = null

function getDatabase() {
  if (!clientPromise) {
    const uri = process.env.MONGO_URI
    if (!uri) throw new Error('MONGO_URI is not set')

    const client = new MongoClient(uri, { maxPoolSize: 5, serverSelectionTimeoutMS: 8000 })
    clientPromise = client
      .connect()
      .then((c) => c.db(process.env.MONGO_DB || 'reelist'))
      .catch((err) => {
        clientPromise = null
        throw err
      })
  }
  return clientPromise
}

export async function getMovieCollection() {
  const database = await getDatabase()
  const col = database.collection('movies')
  if (!indexesReady) {
    indexesReady = Promise.all([
      col.createIndex({ id: 1 }, { unique: true }),
      col.createIndex({ rating: -1, voteCount: -1 }),
      col.createIndex({ year: 1 }),
      col.createIndex({ genreIds: 1 }),
      col.createIndex({ title: 1 }),
      col.createIndex({ importedAt: -1 }),
    ]).catch((err) => {
      indexesReady = null
      throw err
    })
  }
  await indexesReady
  return col
}

// Inserts new movies and refreshes existing ones. `id` is unique, so no duplicates are created.
export async function upsertMovies(records) {
  if (records.length === 0) return { added: 0, updated: 0 }
  const col = await getMovieCollection()
  const result = await col.bulkWrite(
    records.map((r) => ({ updateOne: { filter: { id: r.id }, update: { $set: r }, upsert: true } })),
    { ordered: false }
  )
  return { added: result.upsertedCount, updated: result.matchedCount }
}

const withDefaults = (raw = {}) => ({ ...structuredClone(DEFAULTS), ...raw })

export const db = {
  data: null,

  // Loads the latest user data from MongoDB. Called before every API request.
  async load() {
    const database = await getDatabase()
    const store = database.collection('store')
    const doc = await store.findOne({ _id: DOC_ID })

    if (doc) {
      const { _id, movies: legacyMovies, ...rest } = doc
      // Movies stored inside the old single document are moved to their own collection, once.
      if (Array.isArray(legacyMovies) && legacyMovies.length > 0) {
        await upsertMovies(legacyMovies)
        await store.updateOne({ _id: DOC_ID }, { $unset: { movies: '' } })
        console.log(`Moved ${legacyMovies.length} movies into the movies collection.`)
      }
      this.data = withDefaults(rest)
      return this.data
    }

    // First run: copy the old local JSON data into MongoDB, if that file exists.
    const legacy = fs.existsSync(legacyFile) ? JSON.parse(fs.readFileSync(legacyFile, 'utf8')) : {}
    const { movies: legacyMovies = [], ...legacyRest } = legacy
    await upsertMovies(legacyMovies)
    this.data = withDefaults(legacyRest)
    await store.replaceOne({ _id: DOC_ID }, this.data, { upsert: true })
    if (legacyMovies.length) console.log(`Migrated ${legacyMovies.length} movies from data/db.json.`)
    return this.data
  },

  async write() {
    const database = await getDatabase()
    await database.collection('store').replaceOne({ _id: DOC_ID }, this.data, { upsert: true })
  },
}