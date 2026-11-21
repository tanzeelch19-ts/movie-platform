import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bookmark, Calendar, Eye, Star } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Avatar from '../components/common/Avatar'
import StarRating from '../components/common/StarRating'

const cardClass = 'rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-cinema-800'
const inputClass =
  'w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-accent dark:border-white/15 dark:bg-cinema-900'
const buttonClass =
  'rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60'

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className={`${cardClass} flex items-center gap-4 p-5`}>
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-zinc-500">{label}</p>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const toast = useToast()

  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ watchlist: 0, watched: 0, reviews: 0 })
  const [watched, setWatched] = useState([])
  const [reviews, setReviews] = useState([])

  const [name, setName] = useState(user.name)
  const [savingName, setSavingName] = useState(false)
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' })
  const [savingPassword, setSavingPassword] = useState(false)

  useEffect(() => {
    Promise.all([api.get('/auth/me'), api.get('/lists/watched'), api.get('/reviews/mine')])
      .then(([me, w, r]) => {
        setStats(me.data.stats)
        setWatched(w.data.results)
        setReviews(r.data.results)
      })
      .catch((err) => toast(err.message, 'error'))
      .finally(() => setLoading(false))
  }, [toast])

  const averageGiven = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '-'

  const saveName = async (e) => {
    e.preventDefault()
    setSavingName(true)
    try {
      const { data } = await api.patch('/auth/me', { name })
      updateUser(data.user)
      toast('Name updated.')
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setSavingName(false)
    }
  }

  const changePassword = async (e) => {
    e.preventDefault()
    setSavingPassword(true)
    try {
      await api.patch('/auth/me', passwords)
      setPasswords({ currentPassword: '', newPassword: '' })
      toast('Password changed.')
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setSavingPassword(false)
    }
  }

  const joined = new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })

  return (
    <section className="mx-auto max-w-5xl animate-fade-in space-y-8">
      <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-cinema-800">
        <div className="h-28 bg-gradient-to-r from-accent via-red-900 to-zinc-900" />
        <div className="flex flex-col items-center gap-4 px-6 pb-6 sm:flex-row sm:items-end sm:gap-6 sm:px-8">
          <div className="-mt-12 rounded-full ring-4 ring-white dark:ring-cinema-800">
            <Avatar name={user.name} size="lg" />
          </div>
          <div className="flex-1 text-center sm:pb-1 sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  user.role === 'admin' ? 'bg-accent text-white' : 'bg-zinc-100 text-zinc-600 dark:bg-white/10 dark:text-zinc-300'
                }`}
              >
                {user.role === 'admin' ? 'Admin' : 'Member'}
              </span>
            </div>
            <p className="text-sm text-zinc-500">{user.email}</p>
            <p className="mt-1 flex items-center justify-center gap-1 text-xs text-zinc-500 sm:justify-start">
              <Calendar size={12} />
              Joined {joined}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Bookmark} label="In watchlist" value={loading ? '-' : stats.watchlist} />
        <StatCard icon={Eye} label="Movies watched" value={loading ? '-' : stats.watched} />
        <StatCard icon={Star} label="Reviews written" value={loading ? '-' : stats.reviews} />
        <StatCard icon={Star} label="Average you gave" value={loading ? '-' : averageGiven} />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className={`${cardClass} lg:col-span-2`}>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recently watched</h2>
            <Link to="/watched" className="text-sm font-medium text-accent hover:underline">
              View all
            </Link>
          </div>

          {!loading && watched.length === 0 && (
            <p className="py-10 text-center text-sm text-zinc-500">
              Nothing here yet.{' '}
              <Link to="/explore" className="text-accent underline">
                Find a movie
              </Link>
            </p>
          )}

          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6 lg:grid-cols-3 xl:grid-cols-6">
            {watched.slice(0, 6).map((m) => (
              <Link key={m.id} to={`/movies/${m.id}`} className="group" title={m.title}>
                {m.posterUrl ? (
                  <img
                    src={m.posterUrl}
                    alt={m.title}
                    loading="lazy"
                    className="aspect-[2/3] w-full rounded-lg object-cover transition group-hover:scale-105"
                  />
                ) : (
                  <div className="flex aspect-[2/3] w-full items-center justify-center rounded-lg bg-zinc-200 p-2 text-center text-xs text-zinc-500 dark:bg-cinema-900">
                    {m.title}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>

        <div className={cardClass}>
          <h2 className="mb-5 text-lg font-semibold">Your latest reviews</h2>

          {!loading && reviews.length === 0 && (
            <p className="py-10 text-center text-sm text-zinc-500">You have not reviewed any movies yet.</p>
          )}

          <ul className="space-y-4">
            {reviews.slice(0, 3).map((r) => (
              <li key={r.id} className="border-b border-zinc-200 pb-4 last:border-0 last:pb-0 dark:border-white/10">
                <Link to={`/movies/${r.movieId}`} className="text-sm font-semibold hover:text-accent">
                  {r.movieTitle}
                </Link>
                <div className="mt-1">
                  <StarRating value={r.rating} readOnly size={14} />
                </div>
                {r.body && <p className="mt-2 line-clamp-2 text-sm text-zinc-500">{r.body}</p>}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <form onSubmit={saveName} className={`${cardClass} space-y-4`}>
          <div>
            <h2 className="text-lg font-semibold">Display name</h2>
            <p className="text-sm text-zinc-500">This is shown on your reviews.</p>
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={60}
            aria-label="Display name"
            className={inputClass}
          />
          <button type="submit" disabled={savingName || name.trim() === user.name} className={buttonClass}>
            {savingName ? 'Saving...' : 'Save name'}
          </button>
        </form>

        <form onSubmit={changePassword} className={`${cardClass} space-y-4`}>
          <div>
            <h2 className="text-lg font-semibold">Change password</h2>
            <p className="text-sm text-zinc-500">Use at least 6 characters.</p>
          </div>
          <input
            type="password"
            placeholder="Current password"
            autoComplete="current-password"
            required
            value={passwords.currentPassword}
            onChange={(e) => setPasswords((p) => ({ ...p, currentPassword: e.target.value }))}
            className={inputClass}
          />
          <input
            type="password"
            placeholder="New password"
            autoComplete="new-password"
            required
            minLength={6}
            value={passwords.newPassword}
            onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
            className={inputClass}
          />
          <button type="submit" disabled={savingPassword} className={buttonClass}>
            {savingPassword ? 'Updating...' : 'Update password'}
          </button>
        </form>
      </div>
    </section>
  )
}