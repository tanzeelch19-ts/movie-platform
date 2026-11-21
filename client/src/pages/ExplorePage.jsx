import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import api from '../services/api'
import MovieGrid, { MovieGridSkeleton } from '../components/movies/MovieGrid'
import EmptyState from '../components/common/EmptyState'
import RecentSearches from '../components/search/RecentSearches'

const sortOptions = [
  { value: 'popularity.desc', label: 'Most popular' },
  { value: 'vote_average.desc', label: 'Top rated' },
  { value: 'primary_release_date.desc', label: 'Newest' },
]

const defaultFilters = { genre: '', year: '', minRating: '', sort: 'popularity.desc' }

export default function ExplorePage() {
  const [genres, setGenres] = useState([])
  const [input, setInput] = useState('')
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState(defaultFilters)

  const [movies, setMovies] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/movies/genres')
      .then((res) => setGenres(res.data.genres))
      .catch(() => {})
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')

    const request = query
      ? api.get('/movies/search', { params: { q: query, page: 1 } })
      : api.get('/movies/discover', { params: { ...filters, page: 1 } })

    request
      .then((res) => {
        if (cancelled) return
        setMovies(res.data.results)
        setPage(res.data.page)
        setTotalPages(res.data.totalPages)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [query, filters])

  const loadMore = async () => {
    const nextPage = page + 1
    const request = query
      ? api.get('/movies/search', { params: { q: query, page: nextPage } })
      : api.get('/movies/discover', { params: { ...filters, page: nextPage } })

    setLoading(true)
    try {
      const res = await request
      setMovies((prev) => [...prev, ...res.data.results])
      setPage(res.data.page)
      setTotalPages(res.data.totalPages)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setQuery(input.trim())
  }

  const clearSearch = () => {
    setInput('')
    setQuery('')
  }

  const updateFilter = (key) => (e) => {
    setFilters((f) => ({ ...f, [key]: e.target.value }))
  }

  return (
    <section className="animate-fade-in space-y-8">
      <div>
        <h1 className="section-title">Explore movies</h1>
        <p className="mt-1 text-sm text-zinc-500">Search by title, or filter by genre, year and rating.</p>
      </div>

      <form onSubmit={handleSearch} className="relative">
        <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search by title..."
          aria-label="Search movies by title"
          className="input h-12 pl-11 pr-24 text-base"
        />
        <button type="submit" className="btn btn-primary absolute right-1.5 top-1.5 h-9 px-4 py-0">
          Search
        </button>
      </form>

      <RecentSearches onPick={(q) => { setInput(q); setQuery(q) }} refreshKey={query} />

      {query ? (
        <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-500">
          <span>Results for</span>
          <span className="badge bg-accent/10 text-accent">"{query}"</span>
          <button onClick={clearSearch} className="font-medium text-accent hover:underline">
            Clear
          </button>
        </div>
      ) : (
        <div className="card grid grid-cols-2 gap-3 p-4 md:grid-cols-4">
          <select
            aria-label="Filter by genre"
            value={filters.genre}
            onChange={updateFilter('genre')}
            className="input"
          >
            <option value="">All genres</option>
            {genres.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            aria-label="Filter by release year"
            placeholder="Year (e.g. 2024)"
            value={filters.year}
            onChange={updateFilter('year')}
            className="input"
          />

          <select
            aria-label="Filter by minimum rating"
            value={filters.minRating}
            onChange={updateFilter('minRating')}
            className="input"
          >
            <option value="">Any rating</option>
            <option value="5">5+</option>
            <option value="6">6+</option>
            <option value="7">7+</option>
            <option value="8">8+</option>
          </select>

          <select
            aria-label="Sort movies"
            value={filters.sort}
            onChange={updateFilter('sort')}
            className="input"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {error && (
        <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500">{error}</p>
      )}

      {loading && movies.length === 0 && <MovieGridSkeleton />}

      {!loading && !error && movies.length === 0 && (
        <EmptyState title="No movies found" description="Try a different title or change the filters." />
      )}

      {movies.length > 0 && <MovieGrid movies={movies} />}

      {page < totalPages && movies.length > 0 && (
        <div className="flex justify-center">
          <button onClick={loadMore} disabled={loading} className="btn btn-secondary">
            {loading ? 'Loading...' : 'Load more'}
          </button>
        </div>
      )}
    </section>
  )
}