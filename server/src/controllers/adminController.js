import { db } from '../services/db.js'
import { httpError } from '../middleware/errorHandler.js'
import { sendWeeklyDigest } from '../services/digest.js'

export const stats = (req, res) => {
  const visible = db.data.reviews.filter((r) => !r.hidden)
  const averageRating = visible.length
    ? Number((visible.reduce((sum, r) => sum + r.rating, 0) / visible.length).toFixed(1))
    : 0

  res.json({
    users: db.data.users.length,
    reviews: db.data.reviews.length,
    hiddenReviews: db.data.reviews.filter((r) => r.hidden).length,
    watchlistItems: db.data.watchlist.length,
    watchedItems: db.data.watched.length,
    averageRating,
  })
}

export const listUsers = (req, res) => {
  res.json({
    results: db.data.users.map(({ id, name, email, role, createdAt }) => ({ id, name, email, role, createdAt })),
  })
}

export const deleteUser = async (req, res) => {
  const id = req.params.id
  if (id === req.user.id) throw httpError(400, 'You cannot delete your own account from here')
  if (!db.data.users.some((u) => u.id === id)) throw httpError(404, 'User not found')

  db.data.users = db.data.users.filter((u) => u.id !== id)
  for (const list of ['watchlist', 'watched', 'reviews']) {
    db.data[list] = db.data[list].filter((x) => x.userId !== id)
  }
  await db.write()
  res.json({ message: 'User deleted' })
}

export const listReviews = (req, res) => {
  const names = Object.fromEntries(db.data.users.map((u) => [u.id, u.name]))
  const results = [...db.data.reviews]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((r) => ({
      id: r.id,
      movieTitle: r.title,
      userName: names[r.userId] || 'Deleted user',
      rating: r.rating,
      body: r.body,
      hidden: Boolean(r.hidden),
      createdAt: r.createdAt,
    }))
  res.json({ results })
}

export const toggleHideReview = async (req, res) => {
  const review = db.data.reviews.find((r) => r.id === req.params.id)
  if (!review) throw httpError(404, 'Review not found')

  review.hidden = !review.hidden
  await db.write()
  res.json({ hidden: review.hidden })
}

export const sendDigest = async (req, res) => {
  const result = await sendWeeklyDigest()
  res.json(result)
}