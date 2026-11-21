import { JSONFilePreset } from 'lowdb/node'

const defaultData = {
  users: [],
  watchlist: [],
  watched: [],
  reviews: [],
  collections: [],
  meta: {},
}

// Data lives in server/data/db.json. Run the server from the server folder.
export const db = await JSONFilePreset('data/db.json', defaultData)

// Older db.json files may be missing newer collections, so fill them in.
db.data = { ...defaultData, ...db.data }