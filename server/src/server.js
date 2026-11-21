import 'dotenv/config'
import app from './app.js'
import { startDigestScheduler } from './services/digest.js'

const PORT = process.env.PORT || 5000
const isProd = process.env.NODE_ENV === 'production'
// Hosting platforms need 0.0.0.0. Local development stays on 127.0.0.1.
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

const server = app.listen(PORT, HOST, () => {
  console.log(`API running on http://${HOST}:${PORT}`)
  // Set DISABLE_SCHEDULER=true when an external cron calls /api/cron/digest, so emails are not sent twice.
  if (process.env.DISABLE_SCHEDULER !== 'true') startDigestScheduler()
})

// Close connections cleanly on Ctrl+C or when the host restarts the service.
const shutdown = () => server.close(() => process.exit(0))
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)