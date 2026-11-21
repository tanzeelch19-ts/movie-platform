import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import api from '../services/api'
import MovieGridWithAction from '../components/movies/MovieGridWithAction'
import { MovieGridSkeleton } from '../components/movies/MovieGrid'
import EmptyState from '../components/common/EmptyState'

export default function RecommendationsPage() {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/recommendations')
      .then((res) => setMovies(res.data.results))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="animate-fade-in space-y-8">
      <div>
        <h1 className="section-title flex items-center gap-2">
          <Sparkles size={22} className="text-accent" />
          For you
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Picked from the ratings and watch history of people with similar taste.
        </p>
      </div>

      {error && (
        <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500">{error}</p>
      )}
      {loading && <MovieGridSkeleton />}

      {!loading && !error && movies.length === 0 && (
        <EmptyState
          title="No picks yet"
          description="Rate or mark a few movies as watched and we will suggest more."
          linkTo="/explore"
          linkLabel="Explore movies"
        />
      )}

      {!loading && movies.length > 0 && (
        <MovieGridWithAction
          movies={movies}
          renderActions={(m) => <p className="badge bg-accent/10 text-accent">{m.reason}</p>}
        />
      )}
    </section>
  )
}