import nodemailer from 'nodemailer'
import { db } from './db.js'
import { tmdb, toCard } from './tmdb.js'
import { getRecommendations } from './recommend.js'

const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

function getTransport() {
  if (!process.env.SMTP_HOST) return null
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  })
}

async function getTopPicks() {
  const [trending, topRated] = await Promise.all([
    tmdb('/trending/movie/week'),
    tmdb('/movie/top_rated'),
  ])
  return {
    trending: trending.results.slice(0, 5).map(toCard),
    topRated: topRated.results.slice(0, 5).map(toCard),
  }
}

const li = (m) =>
  `<li style="margin:4px 0">${esc(m.title)} <span style="color:#888">(${m.rating || 'new'})</span></li>`

function buildHtml(user, picks, recs) {
  return `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;background:#0b0b10;color:#eee;padding:24px;border-radius:12px">
    <h1 style="color:#e50914">Reelist weekly picks</h1>
    <p>Hi ${esc(user.name)}, here are this week's top movies.</p>
    <h2>Trending this week</h2>
    <ol>${picks.trending.map(li).join('')}</ol>
    <h2>Top rated of all time</h2>
    <ol>${picks.topRated.map(li).join('')}</ol>
    ${recs.length ? `<h2>Picked for you</h2><ul>${recs.slice(0, 5).map(li).join('')}</ul>` : ''}
    <p style="font-size:12px;color:#888">You get this email because the weekly digest is on. You can turn it off in Settings.</p>
    <p style="font-size:12px;color:#888">This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
  </div>`
}

export async function sendWeeklyDigest() {
  const today = new Date().toLocaleDateString('en-CA')
  const picks = await getTopPicks()
  const transport = getTransport()
  const recipients = db.data.users.filter((u) => u.preferences?.emailDigest ?? true)

  let sent = 0
  for (const user of recipients) {
    try {
      const recs = await getRecommendations(user.id).catch(() => [])
      const html = buildHtml(user, picks, recs)
      if (transport) {
        await transport.sendMail({
          from: process.env.SMTP_FROM || 'Reelist <no-reply@reelist.local>',
          to: user.email,
          subject: 'Your weekly Reelist picks',
          html,
        })
      } else {
        console.log(`[digest preview] SMTP not set. Would email ${user.email}`)
      }
      sent++
    } catch (err) {
      console.error(`Digest failed for ${user.email}:`, err.message)
    }
  }

  db.data.meta.lastDigestDate = today
  await db.write()
  return { recipients: recipients.length, sent, smtpConfigured: Boolean(transport) }
}

// Checks every hour. Sends once per day, on Monday after 9 AM.
export function startDigestScheduler() {
  const check = async () => {
    const now = new Date()
    const today = now.toLocaleDateString('en-CA')
    const isMondayMorning = now.getDay() === 1 && now.getHours() >= 9
    if (isMondayMorning && db.data.meta.lastDigestDate !== today) {
      try {
        await sendWeeklyDigest()
      } catch (err) {
        console.error('Weekly digest failed:', err.message)
      }
    }
  }
  check()
  setInterval(check, 60 * 60 * 1000)
}