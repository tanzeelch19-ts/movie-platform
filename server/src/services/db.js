import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { MongoClient } from 'mongodb'

const here = path.dirname(fileURLToPath(import.meta.url))
// Old local JSON file from earlier versions. Used once, to move existing data into MongoDB.
const legacyFile = path.resolve(here, '..', '..', 'data', 'db.json')

// All app data lives in one document, so the controllers can keep using db.data and db.write().
const DOC_ID = 'store'
const DEFAULTS = {
  users: [],
  watchlist: [],
  watched: [],
  reviews: [],
  collections: [],
  movies: [],
  meta: {},
}

let collectionPromise = null

function getCollection() {
  if (!collectionPromise) {
    const uri = process.env.MONGO_URI
    if (!uri) throw new Error('MONGO_URI is not set')

    const client = new MongoClient(uri, { maxPoolSize: 5, serverSelectionTimeoutMS: 8000 })
    collectionPromise = client
      .connect()
      .then((c) => c.db(process.env.MONGO_DB || 'reelist').collection('store'))
      .catch((err) => {
        collectionPromise = null
        throw err
      })
  }
  return collectionPromise
}

const withDefaults = (raw = {}) => ({ ...structuredClone(DEFAULTS), ...raw })

export const db = {
  data: null,

  // Loads the latest data from MongoDB. Called before every API request.
  async load() {
    const col = await getCollection()
    const doc = await col.findOne({ _id: DOC_ID })

    if (doc) {
      const { _id, ...rest } = doc
      this.data = withDefaults(rest)
      return this.data
    }

    // First run: copy the old local JSON data into MongoDB, if that file exists.
    const legacy = fs.existsSync(legacyFile) ? JSON.parse(fs.readFileSync(legacyFile, 'utf8')) : null
    this.data = withDefaults(legacy)
    await col.replaceOne({ _id: DOC_ID }, this.data, { upsert: true })
    if (legacy) console.log('Migrated existing data from data/db.json into MongoDB.')
    return this.data
  },

  async write() {
    const col = await getCollection()
    await col.replaceOne({ _id: DOC_ID }, this.data, { upsert: true })
  },
}