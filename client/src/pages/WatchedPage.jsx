import { useEffect, useState } from 'react'
import api from '../services/api'
import MovieGridWithAction from '../components/movies/MovieGridWithAction'
import { MovieGridSkeleton } from '../components/movies/MovieGrid'
import EmptyState from '../components/common/EmptyState'

export default function WatchedPage() {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/lists/watched')
      .then((res) => setMovies(res.data.results))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const remove = async (movieId) => {
    try {
      await api.delete(`/lists/watched/${movieId}`)
      setMovies((list) => list.filter((m) => m.id !== movieId))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section className="animate-fade-in space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="section-title">Watched history</h1>
          <p className="mt-1 text-sm text-zinc-500">Everything you have seen, newest first.</p>
        </div>
        {!loading && movies.length > 0 && (
          <span className="badge bg-zinc-900/5 text-zinc-600 dark:bg-white/10 dark:text-zinc-300">
            {movies.length} watched
          </span>
        )}
      </div>

      {error && (
        <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500">{error}</p>
      )}
      {loading && <MovieGridSkeleton />}

      {!loading && !error && movies.length === 0 && (
        <EmptyState
          title="No watched movies yet"
          description="Mark a movie as watched, or leave a review, and it will appear here."
          linkTo="/explore"
          linkLabel="Explore movies"
        />
      )}

      {!loading && movies.length > 0 && (
        <MovieGridWithAction
          movies={movies}
          renderActions={(m) => (
            <div className="space-y-2">
              <p className="text-xs text-zinc-500">
                Watched {new Date(m.watchedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
              <button onClick={() => remove(m.id)} className="btn btn-secondary w-full px-2 py-1.5 text-xs">
                Remove
              </button>
            </div>
          )}
        />
      )}
    </section>
  )
}