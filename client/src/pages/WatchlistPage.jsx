import { useEffect, useState } from 'react'
import api from '../services/api'
import MovieGridWithAction from '../components/movies/MovieGridWithAction'
import { MovieGridSkeleton } from '../components/movies/MovieGrid'
import EmptyState from '../components/common/EmptyState'

export default function WatchlistPage() {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/lists/watchlist')
      .then((res) => setMovies(res.data.results))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const removeFromList = async (movieId) => {
    try {
      await api.delete(`/lists/watchlist/${movieId}`)
      setMovies((list) => list.filter((m) => m.id !== movieId))
    } catch (err) {
      setError(err.message)
    }
  }

  const markWatched = async (movieId) => {
    try {
      await api.post(`/lists/watched/${movieId}`)
      setMovies((list) => list.filter((m) => m.id !== movieId))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section className="animate-fade-in space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="section-title">My watchlist</h1>
          <p className="mt-1 text-sm text-zinc-500">Movies you want to watch next.</p>
        </div>
        {!loading && movies.length > 0 && (
          <span className="badge bg-zinc-900/5 text-zinc-600 dark:bg-white/10 dark:text-zinc-300">
            {movies.length} {movies.length === 1 ? 'movie' : 'movies'}
          </span>
        )}
      </div>

      {error && (
        <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500">{error}</p>
      )}
      {loading && <MovieGridSkeleton />}

      {!loading && !error && movies.length === 0 && (
        <EmptyState
          title="Your watchlist is empty"
          description="Save movies you want to see and they will show up here."
          linkTo="/explore"
          linkLabel="Explore movies"
        />
      )}

      {!loading && movies.length > 0 && (
        <MovieGridWithAction
          movies={movies}
          renderActions={(m) => (
            <div className="flex gap-2">
              <button onClick={() => markWatched(m.id)} className="btn btn-primary flex-1 px-2 py-1.5 text-xs">
                Mark watched
              </button>
              <button onClick={() => removeFromList(m.id)} className="btn btn-secondary flex-1 px-2 py-1.5 text-xs">
                Remove
              </button>
            </div>
          )}
        />
      )}
    </section>
  )
}