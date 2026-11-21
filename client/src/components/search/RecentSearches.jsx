import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function RecentSearches({ onPick, refreshKey }) {
  const { user } = useAuth()
  const [items, setItems] = useState([])

  useEffect(() => {
    if (!user) return
    // Short delay, so the search that was just made is saved on the server before we read history.
    const timer = setTimeout(() => {
      api
        .get('/activity/searches')
        .then((res) => setItems(res.data.results))
        .catch(() => {})
    }, 400)
    return () => clearTimeout(timer)
  }, [user, refreshKey])

  if (!user || items.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Recent</span>
      {items.slice(0, 8).map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onPick(item.query)}
          className="badge bg-zinc-900/5 px-3 py-1.5 text-xs text-zinc-700 transition hover:bg-accent/10 hover:text-accent dark:bg-white/10 dark:text-zinc-200"
        >
          {item.query}
        </button>
      ))}
      <Link to="/activity" className="text-xs font-semibold text-accent hover:underline">
        See all
      </Link>
    </div>
  )
}