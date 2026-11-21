import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { randomUUID } from 'crypto'
import { db } from '../services/db.js'
import { httpError } from '../middleware/errorHandler.js'

const signToken = (user) => jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' })

const publicUser = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  createdAt: u.createdAt,
  preferences: { emailDigest: u.preferences?.emailDigest ?? true },
})

export const register = async (req, res) => {
  const name = String(req.body.name || '').trim()
  const email = String(req.body.email || '').trim().toLowerCase()
  const password = String(req.body.password || '')

  if (!name || !email || !password) throw httpError(400, 'Name, email and password are required')
  if (!/^\S+@\S+\.\S+$/.test(email)) throw httpError(400, 'Please enter a valid email')
  if (password.length < 6) throw httpError(400, 'Password must be at least 6 characters')
  if (db.data.users.some((u) => u.email === email)) throw httpError(409, 'Email is already registered')

  const user = {
    id: randomUUID(),
    name,
    email,
    passwordHash: await bcrypt.hash(password, 10),
    // The first account created becomes admin.
    role: db.data.users.length === 0 ? 'admin' : 'user',
    preferences: { emailDigest: true },
    createdAt: new Date().toISOString(),
  }

  db.data.users.push(user)
  await db.write()
  res.status(201).json({ token: signToken(user), user: publicUser(user) })
}

export const login = async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase()
  const password = String(req.body.password || '')
  if (!email || !password) throw httpError(400, 'Email and password are required')

  const user = db.data.users.find((u) => u.email === email)
  const valid = user && (await bcrypt.compare(password, user.passwordHash))
  if (!valid) throw httpError(401, 'Invalid email or password')

  res.json({ token: signToken(user), user: publicUser(user) })
}

export const me = (req, res) => {
  const user = db.data.users.find((u) => u.id === req.user.id)
  if (!user) throw httpError(404, 'User not found')

  const count = (list) => db.data[list].filter((x) => x.userId === user.id).length
  res.json({
    user: publicUser(user),
    stats: { watchlist: count('watchlist'), watched: count('watched'), reviews: count('reviews') },
  })
}

// Used by the profile page (name, password) and the settings page (email digest).
export const updateMe = async (req, res) => {
  const user = db.data.users.find((u) => u.id === req.user.id)
  if (!user) throw httpError(404, 'User not found')

  const { name, emailDigest, currentPassword, newPassword } = req.body

  if (name !== undefined) {
    const trimmed = String(name).trim()
    if (!trimmed) throw httpError(400, 'Name cannot be empty')
    user.name = trimmed
  }

  if (emailDigest !== undefined) {
    user.preferences = { ...(user.preferences || {}), emailDigest: Boolean(emailDigest) }
  }

  if (newPassword !== undefined) {
    if (String(newPassword).length < 6) throw httpError(400, 'New password must be at least 6 characters')
    const ok = await bcrypt.compare(String(currentPassword || ''), user.passwordHash)
    if (!ok) throw httpError(400, 'Current password is incorrect')
    user.passwordHash = await bcrypt.hash(String(newPassword), 10)
  }

  await db.write()
  res.json({ user: publicUser(user) })
}
export const deleteMe = async (req, res) => {
  const user = db.data.users.find((u) => u.id === req.user.id)
  if (!user) throw httpError(404, 'User not found')

  const ok = await bcrypt.compare(String(req.body.password || ''), user.passwordHash)
  if (!ok) throw httpError(400, 'Password is incorrect')

  db.data.users = db.data.users.filter((u) => u.id !== user.id)
  for (const list of ['watchlist', 'watched', 'reviews']) {
    db.data[list] = db.data[list].filter((x) => x.userId !== user.id)
  }
  await db.write()
  res.json({ message: 'Account deleted' })
}