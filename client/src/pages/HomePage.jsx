import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import MovieRow from '../components/movies/MovieRow'

export default function HomePage() {
  const { user } = useAuth()
  const [trending, setTrending] = useState([])
  const [nowPlaying, setNowPlaying] = useState([])
  const [upcoming, setUpcoming] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // allSettled, so one failing list does not hide the others.
    Promise.allSettled([
      api.get('/movies/trending'),
      api.get('/movies/now-playing'),
      api.get('/movies/upcoming'),
    ])
      .then(([t, n, u]) => {
        if (t.status === 'fulfilled') setTrending(t.value.data.results)
        else setError(t.reason.message)

        if (n.status === 'fulfilled') setNowPlaying(n.value.data.results.filter((m) => m.posterUrl))
        if (u.status === 'fulfilled') setUpcoming(u.value.data.results.filter((m) => m.posterUrl))
      })
      .finally(() => setLoading(false))
  }, [])

  const hero = trending.find((m) => m.backdropUrl) || trending[0]
  const trendingRest = trending.filter((m) => m.id !== hero?.id)

  return (
    <section className="animate-fade-in space-y-14">
      {loading && <div className="skeleton h-[380px] rounded-3xl sm:h-[460px]" />}

      {!loading && hero && (
        <div className="relative isolate overflow-hidden rounded-3xl bg-zinc-900 text-white shadow-xl">
          {hero.backdropUrl && (
            <img src={hero.backdropUrl} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" />
          )}
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black via-black/70 to-black/20 md:bg-gradient-to-r md:from-black md:via-black/70 md:to-transparent" />

          <div className="flex min-h-[380px] flex-col justify-end gap-4 p-6 sm:min-h-[460px] sm:p-10 md:max-w-2xl md:p-12">
            <span className="badge w-fit bg-accent text-white">Trending this week</span>
            <h1 className="text-3xl font-black leading-tight sm:text-4xl md:text-5xl">{hero.title}</h1>
            <div className="flex items-center gap-3 text-sm text-zinc-300">
              {hero.rating > 0 && (
                <span className="flex items-center gap-1">
                  <Star size={14} className="fill-yellow-400 text-yellow-400" />
                  {hero.rating}
                </span>
              )}
              {hero.releaseDate && <span>{hero.releaseDate.slice(0, 4)}</span>}
            </div>
            <p className="line-clamp-3 text-sm leading-relaxed text-zinc-200 md:text-base">{hero.overview}</p>
            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Link to={`/movies/${hero.id}`} className="btn bg-white text-black hover:bg-zinc-200">
                View details
              </Link>
              <Link to="/explore" className="btn border border-white/30 text-white hover:bg-white/10">
                Explore more
              </Link>
            </div>
          </div>
        </div>
      )}

      {error && <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500">{error}</p>}

      {!user && !loading && (
        <div className="card flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
          <div>
            <p className="font-semibold">Track what you watch</p>
            <p className="text-sm text-zinc-500">Create a free account to rate, review and build your watchlist.</p>
          </div>
          <Link to="/register" className="btn btn-primary w-full shrink-0 sm:w-auto">
            Create account
          </Link>
        </div>
      )}

      {loading && (
        <div className="space-y-5">
          <div className="skeleton h-8 w-56" />
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-40 shrink-0 sm:w-48">
                <div className="skeleton aspect-[2/3]" />
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && nowPlaying.length > 0 && <MovieRow title="Now in theaters" movies={nowPlaying} />}

      {!loading && upcoming.length > 0 && <MovieRow title="Coming soon" movies={upcoming} />}

      {!loading && trendingRest.length > 0 && (
        <MovieRow title="Trending this week" movies={trendingRest} seeAllTo="/explore" />
      )}
    </section>
  )
}