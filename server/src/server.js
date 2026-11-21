import 'dotenv/config'
import app from './app.js'
import { db } from './services/db.js'
import { startDigestScheduler } from './services/digest.js'

const PORT = process.env.PORT || 5000
const isProd = process.env.NODE_ENV === 'production'
const HOST = process.env.HOST || (isProd ? '0.0.0.0' : '127.0.0.1')

const secret = process.env.JWT_SECRET || ''
if (secret.length < 32) {
  const message = 'JWT_SECRET is missing or shorter than 32 characters. Set a long random value in server/.env.'
  if (isProd) {
    console.error(message)
    process.exit(1)
  }
  console.warn(`Warning: ${message}`)
}

async function start() {
  // Local server: connect once at startup, so the digest scheduler has data ready.
  await db.load()
  console.log('Connected to MongoDB')

  const server = app.listen(PORT, HOST, () => {
    console.log(`API running on http://${HOST}:${PORT}`)
    if (process.env.DISABLE_SCHEDULER !== 'true') startDigestScheduler()
  })

  const shutdown = () => server.close(() => process.exit(0))
  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

start().catch((err) => {
  console.error('Failed to start server:', err.message)
  process.exit(1)
})