import { useEffect, useState } from 'react'
import { Database, RefreshCw } from 'lucide-react'
import api from '../../services/api'
import { useToast } from '../../context/ToastContext'

const sources = [
  { value: 'top_rated', label: 'Top rated' },
  { value: 'popular', label: 'Popular' },
  { value: 'now_playing', label: 'Now in theaters' },
  { value: 'upcoming', label: 'Coming soon' },
]

const pageOptions = [5, 10, 25, 50, 100]

export default function MovieImportPanel() {
  const toast = useToast()
  const [status, setStatus] = useState(null)
  const [source, setSource] = useState('top_rated')
  const [pages, setPages] = useState(50)
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState('')
  const [lastResult, setLastResult] = useState(null)

  const loadStatus = () => api.get('/admin/movies/status').then((res) => setStatus(res.data))

  useEffect(() => {
    loadStatus().catch((err) => toast(err.message, 'error'))
  }, [toast])

  // Each call imports 5 TMDB pages (100 movies). The loop keeps calling until the target is reached.
  const runImport = async () => {
    const target = Number(pages)
    const totals = { found: 0, added: 0, updated: 0, failed: 0 }
    let startPage = 1

    setRunning(true)
    setLastResult(null)
    setProgress('Starting...')

    try {
      while (true) {
        const { data } = await api.post(
          '/admin/movies/import',
          { source, startPage, pages: 5 },
          { timeout: 120000 }
        )

        totals.found += data.found
        totals.added += data.added
        totals.updated += data.updated
        totals.failed += data.failed
        setProgress(`Page ${data.toPage} of ${target} · ${totals.added + totals.updated} movies saved`)

        if (data.done || data.toPage >= target) {
          setLastResult({ ...totals, total: data.totalMovies })
          break
        }
        startPage = data.nextPage
      }

      toast(`Import complete: ${totals.added} added, ${totals.updated} updated.`)
      await loadStatus()
    } catch (err) {
      toast(`${err.message}. Movies saved so far are kept, you can run the import again.`, 'error')
      await loadStatus().catch(() => {})
    } finally {
      setRunning(false)
      setProgress('')
    }
  }

  const lastImported = status?.lastImportedAt
    ? new Date(status.lastImportedAt).toLocaleString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Never'

  return (
    <div className="card space-y-5 p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
            <Database size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Movie library</h2>
            <p className="text-sm text-zinc-500">
              Import movies from TMDB into your own database. Library movies load without a live TMDB call.
            </p>
          </div>
        </div>

        <div className="flex gap-6">
          <div>
            <p className="text-2xl font-bold">{status?.count ?? '-'}</p>
            <p className="text-xs text-zinc-500">Movies</p>
          </div>
          <div>
            <p className="text-sm font-semibold">{lastImported}</p>
            <p className="text-xs text-zinc-500">Last import</p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div className="space-y-1.5">
          <label htmlFor="import-source" className="text-sm font-medium">Source</label>
          <select
            id="import-source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            disabled={running}
            className="input"
          >
            {sources.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="import-pages" className="text-sm font-medium">How many movies</label>
          <select
            id="import-pages"
            value={pages}
            onChange={(e) => setPages(e.target.value)}
            disabled={running}
            className="input"
          >
            {pageOptions.map((p) => (
              <option key={p} value={p}>
                {p * 20} movies
              </option>
            ))}
          </select>
        </div>

        <button onClick={runImport} disabled={running} className="btn btn-primary w-full sm:w-auto">
          <RefreshCw size={16} className={running ? 'animate-spin' : ''} />
          {running ? 'Importing...' : 'Import movies'}
        </button>
      </div>

      {running && (
        <p className="rounded-xl border border-accent/20 bg-accent/5 p-3 text-sm text-zinc-600 dark:text-zinc-300">
          {progress}. Ye page band na karein, import chal raha hai.
        </p>
      )}

      {lastResult && !running && (
        <p className="rounded-xl border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-600">
          Found {lastResult.found}: {lastResult.added} added, {lastResult.updated} updated, {lastResult.failed} failed.
          Library total: {lastResult.total}.
        </p>
      )}
    </div>
  )
}