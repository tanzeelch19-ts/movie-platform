import { useEffect, useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Avatar from '../components/common/Avatar'
import MovieImportPanel from '../components/admin/MovieImportPanel'

const th = 'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500'
const td = 'px-4 py-3 align-middle text-sm'

export default function AdminPage() {
  const { user } = useAuth()
  const toast = useToast()
  const isAdmin = user?.role === 'admin'

  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () =>
    Promise.all([api.get('/admin/stats'), api.get('/admin/users'), api.get('/admin/reviews')]).then(
      ([s, u, r]) => {
        setStats(s.data)
        setUsers(u.data.results)
        setReviews(r.data.results)
      }
    )

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false)
      return
    }
    load()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [isAdmin])

  const run = async (action, successText) => {
    try {
      await action()
      await load()
      toast(successText)
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  const deleteUser = (u) => {
    if (window.confirm(`Delete ${u.name} and all their data?`)) {
      run(() => api.delete(`/admin/users/${u.id}`), 'User deleted.')
    }
  }

  const toggleHide = (r) =>
    run(() => api.patch(`/admin/reviews/${r.id}/hide`), r.hidden ? 'Review restored.' : 'Review hidden.')

  const deleteReview = (r) => {
    if (window.confirm('Delete this review?')) {
      run(() => api.delete(`/admin/reviews/${r.id}`), 'Review deleted.')
    }
  }

  const sendDigest = async () => {
    try {
      const { data } = await api.post('/admin/digest/send')
      toast(
        `Digest sent to ${data.sent} of ${data.recipients} subscribers` +
          (data.smtpConfigured ? '.' : ' (SMTP not set, logged on server console).')
      )
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  if (!isAdmin) return <div className="card py-20 text-center text-zinc-500">Admins only.</div>
  if (loading) return <div className="skeleton h-64" />

  return (
    <section className="animate-fade-in space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <ShieldCheck size={22} className="text-accent" />
            Admin dashboard
          </h1>
          <p className="mt-1 text-sm text-zinc-500">Manage users, moderate reviews and send the digest.</p>
        </div>
        <button onClick={sendDigest} className="btn btn-primary w-full sm:w-auto">
          Send weekly digest now
        </button>
      </div>

      {error && (
        <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500">{error}</p>
      )}

      <MovieImportPanel />

      {stats && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {[
            ['Users', stats.users],
            ['Reviews', stats.reviews],
            ['Hidden reviews', stats.hiddenReviews],
            ['Watchlist items', stats.watchlistItems],
            ['Average rating', stats.averageRating],
          ].map(([label, value]) => (
            <div key={label} className="card p-5">
              <p className="text-2xl font-bold">{value}</p>
              <p className="mt-1 text-xs text-zinc-500">{label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Users</h2>
        <div className="card overflow-x-auto p-0">
          <table className="w-full min-w-[640px]">
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-white/5">
              <tr>
                <th className={th}>Name</th>
                <th className={th}>Email</th>
                <th className={th}>Role</th>
                <th className={th}>Joined</th>
                <th className={th}>Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-white/10">
              {users.map((u) => (
                <tr key={u.id} className="transition hover:bg-zinc-50 dark:hover:bg-white/5">
                  <td className={td}>
                    <div className="flex items-center gap-3">
                      <Avatar name={u.name} size="sm" />
                      <span className="font-medium">{u.name}</span>
                    </div>
                  </td>
                  <td className={`${td} text-zinc-500`}>{u.email}</td>
                  <td className={td}>
                    <span
                      className={`badge ${
                        u.role === 'admin' ? 'bg-accent/10 text-accent' : 'bg-zinc-900/5 text-zinc-600 dark:bg-white/10 dark:text-zinc-300'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className={`${td} text-zinc-500`}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className={td}>
                    {u.id !== user.id && (
                      <button onClick={() => deleteUser(u)} className="btn btn-danger px-3 py-1.5 text-xs">
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Reviews (moderation)</h2>
        <div className="card overflow-x-auto p-0">
          <table className="w-full min-w-[800px]">
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-white/5">
              <tr>
                <th className={th}>Movie</th>
                <th className={th}>User</th>
                <th className={th}>Rating</th>
                <th className={th}>Review</th>
                <th className={th}>Status</th>
                <th className={th}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-white/10">
              {reviews.map((r) => (
                <tr key={r.id} className="transition hover:bg-zinc-50 dark:hover:bg-white/5">
                  <td className={`${td} font-medium`}>{r.movieTitle}</td>
                  <td className={td}>{r.userName}</td>
                  <td className={td}>{r.rating}/5</td>
                  <td className={`${td} max-w-xs text-zinc-500`}>
                    {r.body ? `${r.body.slice(0, 80)}${r.body.length > 80 ? '...' : ''}` : '-'}
                  </td>
                  <td className={td}>
                    <span className={`badge ${r.hidden ? 'bg-yellow-500/15 text-yellow-600' : 'bg-green-500/15 text-green-600'}`}>
                      {r.hidden ? 'Hidden' : 'Visible'}
                    </span>
                  </td>
                  <td className={td}>
                    <div className="flex gap-2">
                      <button onClick={() => toggleHide(r)} className="btn btn-secondary px-3 py-1.5 text-xs">
                        {r.hidden ? 'Restore' : 'Hide'}
                      </button>
                      <button onClick={() => deleteReview(r)} className="btn btn-danger px-3 py-1.5 text-xs">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}