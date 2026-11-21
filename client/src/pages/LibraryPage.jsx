import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import api from '../services/api'
import { useToast } from '../context/ToastContext'
import MovieGrid, { MovieGridSkeleton } from '../components/movies/MovieGrid'
import EmptyState from '../components/common/EmptyState'

const sortOptions = [
  { value: 'rating', label: 'Top rated' },
  { value: 'newest', label: 'Newest' },
  { value: 'title', label: 'Title A-Z' },
]

const emptyFilters = { q: '', genre: '', year: '', minRating: '', sort: 'rating' }

export default function LibraryPage() {
  const toast = useToast()
  const [genres, setGenres] = useState([])
  const [filters, setFilters] = useState(emptyFilters)
  const [search, setSearch] = useState('')
  const [movies, setMovies] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/movies/genres')
      .then((res) => setGenres(res.data.genres))
      .catch(() => {})
  }, [])

  const fetchPage = async (nextPage, append) => {
    setLoading(true)
    const params = { page: nextPage }
    for (const [key, value] of Object.entries(filters)) {
      if (value !== '') params[key] = value
    }
    try {
      const { data } = await api.get('/movies/library', { params })
      setMovies((prev) => (append ? [...prev, ...data.results] : data.results))
      setPage(data.page)
      setTotalPages(data.totalPages)
      setTotal(data.total)
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPage(1, false)
    // fetchPage reads the latest filters on every render, so only filters need to trigger this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const updateFilter = (key) => (e) => setFilters((f) => ({ ...f, [key]: e.target.value }))

  const submitSearch = (e) => {
    e.preventDefault()
    setFilters((f) => ({ ...f, q: search.trim() }))
  }

  const hasFilters = Object.entries(filters).some(([key, value]) => value !== emptyFilters[key])

  const clearFilters = () => {
    setSearch('')
    setFilters(emptyFilters)
  }

  return (
    <section className="animate-fade-in space-y-8">
      <div>
        <h1 className="section-title">Movie library</h1>
        <p className="mt-1 text-sm text-zinc-500">Movies imported into Reelist. Filter by title, genre, year and rating.</p>
      </div>

      <form onSubmit={submitSearch} className="relative">
        <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title..."
          aria-label="Search library by title"
          className="input h-12 pl-11 pr-24 text-base"
        />
        <button type="submit" className="btn btn-primary absolute right-1.5 top-1.5 h-9 px-4 py-0">
          Search
        </button>
      </form>

      <div className="card grid grid-cols-2 gap-3 p-4 md:grid-cols-4">
        <select aria-label="Filter by genre" value={filters.genre} onChange={updateFilter('genre')} className="input">
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
          {[5, 6, 7, 8, 9].map((r) => (
            <option key={r} value={r}>
              {r}+
            </option>
          ))}
        </select>

        <select aria-label="Sort movies" value={filters.sort} onChange={updateFilter('sort')} className="input">
          {sortOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between text-sm text-zinc-500">
        <span>{loading ? 'Loading...' : `${total} ${total === 1 ? 'movie' : 'movies'}`}</span>
        {hasFilters && (
          <button onClick={clearFilters} className="font-medium text-accent hover:underline">
            Clear filters
          </button>
        )}
      </div>

      {loading && movies.length === 0 && <MovieGridSkeleton />}

      {!loading && movies.length === 0 && (
        <EmptyState
          title="No movies found"
          description="Try different filters, or import movies from the admin dashboard."
        />
      )}

      {movies.length > 0 && <MovieGrid movies={movies} />}

      {page < totalPages && (
        <div className="flex justify-center">
          <button onClick={() => fetchPage(page + 1, true)} disabled={loading} className="btn btn-secondary">
            {loading ? 'Loading...' : 'Load more'}
          </button>
        </div>
      )}
    </section>
  )
}