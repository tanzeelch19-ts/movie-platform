import { useEffect, useState } from 'react'
import { Copy, History, LogIn, Search, Trash2 } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Avatar from '../components/common/Avatar'
import EmptyState from '../components/common/EmptyState'
import { LABELS, fmt, detailText } from '../utils/activity'

const TABS = [
  { value: 'activity', label: 'Activity', icon: History },
  { value: 'logins', label: 'Login history', icon: LogIn },
  { value: 'searches', label: 'Search history', icon: Search },
]

const listClass = 'card divide-y divide-zinc-200 dark:divide-white/10'

export default function ActivityPage() {
  const { user } = useAuth()
  const toast = useToast()
  const [tab, setTab] = useState('activity')

  const [activity, setActivity] = useState({ results: [], page: 1, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [logins, setLogins] = useState(null)
  const [searches, setSearches] = useState(null)

  useEffect(() => {
    api
      .get('/activity')
      .then((res) => setActivity(res.data))
      .catch((err) => toast(err.message, 'error'))
      .finally(() => setLoading(false))
  }, [toast])

  useEffect(() => {
    if (tab === 'logins' && logins === null) {
      api
        .get('/activity/logins')
        .then((res) => setLogins(res.data.results))
        .catch((err) => toast(err.message, 'error'))
    }
    if (tab === 'searches' && searches === null) {
      api
        .get('/activity/searches')
        .then((res) => setSearches(res.data.results))
        .catch((err) => toast(err.message, 'error'))
    }
  }, [tab, logins, searches, toast])

  const loadMore = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/activity', { params: { page: activity.page + 1 } })
      setActivity({ ...data, results: [...activity.results, ...data.results] })
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(user.id)
      toast('Account ID copied.')
    } catch {
      toast('Could not copy. Select the ID and copy it manually.', 'error')
    }
  }

  const clearSearches = async () => {
    if (!window.confirm('Clear your search history?')) return
    try {
      await api.delete('/activity/searches')
      setSearches([])
      toast('Search history cleared.')
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  return (
    <section className="animate-fade-in mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="section-title">Activity</h1>
        <p className="mt-1 text-sm text-zinc-500">Your account, sign-ins, searches and everything you do on Reelist.</p>
      </div>

      <div className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <Avatar name={user.name} size="md" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{user.name}</p>
          <p className="truncate text-sm text-zinc-500">{user.email}</p>
          <p className="mt-1 break-all font-mono text-xs text-zinc-500">ID: {user.id}</p>
        </div>
        <button onClick={copyId} className="btn btn-secondary px-4 py-2 text-xs">
          <Copy size={14} />
          Copy ID
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            aria-pressed={tab === t.value}
            className={`btn px-4 py-2 text-xs ${tab === t.value ? 'btn-primary' : 'btn-secondary'}`}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'activity' && (
        <div className="space-y-4">
          {loading && activity.results.length === 0 && <div className="skeleton h-40" />}

          {!loading && activity.results.length === 0 && (
            <EmptyState
              title="No activity yet"
              description="Things you do on Reelist, like adding to your watchlist or writing a review, appear here."
              linkTo="/explore"
              linkLabel="Explore movies"
            />
          )}

          {activity.results.length > 0 && (
            <ul className={listClass}>
              {activity.results.map((item) => (
                <li key={item.id} className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-medium">{LABELS[item.type] || item.type}</p>
                    {detailText(item.details) && (
                      <p className="truncate text-sm text-zinc-500">{detailText(item.details)}</p>
                    )}
                  </div>
                  <p className="shrink-0 text-xs text-zinc-500">{fmt(item.createdAt)}</p>
                </li>
              ))}
            </ul>
          )}

          {activity.page < activity.totalPages && (
            <div className="flex justify-center">
              <button onClick={loadMore} disabled={loading} className="btn btn-secondary">
                {loading ? 'Loading...' : 'Load more'}
              </button>
            </div>
          )}
        </div>
      )}

      {tab === 'logins' && (
        <div className="space-y-4">
          {logins === null && <div className="skeleton h-40" />}

          {logins?.length === 0 && (
            <EmptyState title="No sign-ins recorded" description="Your log in and sign up attempts appear here." />
          )}

          {logins?.length > 0 && (
            <ul className={listClass}>
              {logins.map((l) => (
                <li key={l.id} className="space-y-1.5 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`badge ${
                        l.success ? 'bg-green-500/15 text-green-600' : 'bg-red-500/15 text-red-500'
                      }`}
                    >
                      {l.success ? 'Success' : 'Failed'}
                    </span>
                    <span className="badge bg-zinc-900/5 text-zinc-600 dark:bg-white/10 dark:text-zinc-300">
                      {l.kind === 'register' ? 'Sign up' : 'Log in'}
                    </span>
                    <span className="text-xs text-zinc-500">{fmt(l.createdAt)}</span>
                  </div>
                  <p className="text-sm text-zinc-500">IP: {l.ip || 'unknown'}</p>
                  <p className="line-clamp-1 text-xs text-zinc-400">{l.userAgent}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === 'searches' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-zinc-500">{searches?.length ?? 0} recent searches</p>
            {searches?.length > 0 && (
              <button onClick={clearSearches} className="btn btn-danger px-3 py-1.5 text-xs">
                <Trash2 size={14} />
                Clear history
              </button>
            )}
          </div>

          {searches === null && <div className="skeleton h-24" />}

          {searches?.length === 0 && (
            <EmptyState
              title="No searches yet"
              description="Search for a movie and it will show up here."
              linkTo="/explore"
              linkLabel="Search movies"
            />
          )}

          {searches?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {searches.map((s) => (
                <span
                  key={s.id}
                  className="badge bg-zinc-900/5 px-3 py-1.5 text-sm text-zinc-700 dark:bg-white/10 dark:text-zinc-200"
                >
                  {s.query}
                  <span className="ml-2 text-xs text-zinc-400">{s.source === 'library' ? 'Library' : 'Movies'}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  )
}