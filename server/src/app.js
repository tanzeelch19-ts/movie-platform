import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
import routes from './routes/index.js'
import { loadStore } from './middleware/loadStore.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'

const app = express()
const isProd = process.env.NODE_ENV === 'production'

// Vercel and other proxies sit in front of the app, so trust the first hop for correct client IPs.
if (isProd) app.set('trust proxy', 1)
app.disable('x-powered-by')

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean)

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))

app.use(
  cors({
    origin(origin, callback) {
      // Requests without an Origin header (curl, PowerShell) pass. Browsers must match the allowlist.
      if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ''))) return callback(null, true)
      callback(null, false)
    },
    credentials: true,
  })
)

app.use(express.json({ limit: '100kb' }))

const limiterOptions = { standardHeaders: 'draft-7', legacyHeaders: false }

const apiLimiter = rateLimit({
  ...limiterOptions,
  windowMs: 15 * 60 * 1000,
  limit: 300,
  message: { message: 'Too many requests. Please slow down and try again shortly.' },
})

const authLimiter = rateLimit({
  ...limiterOptions,
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: { message: 'Too many login attempts. Please try again in 15 minutes.' },
})

app.use('/api', apiLimiter)
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)

app.use('/api', loadStore, routes)

app.use(notFound)
app.use(errorHandler)

export default app