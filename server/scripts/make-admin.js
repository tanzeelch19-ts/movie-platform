import 'dotenv/config'
import { db } from '../src/services/db.js'

const email = String(process.argv[2] || '').trim().toLowerCase()
if (!email) {
  console.error('Usage: node scripts/make-admin.js <email>')
  process.exit(1)
}

await db.load()
const user = db.data.users.find((u) => u.email === email)
if (!user) {
  console.error(`No user with email ${email} in database ${process.env.MONGO_DB || 'reelist'}.`)
  process.exit(1)
}

user.role = 'admin'
await db.write()
console.log(`${email} is now admin in database ${process.env.MONGO_DB || 'reelist'}.`)
process.exit(0)