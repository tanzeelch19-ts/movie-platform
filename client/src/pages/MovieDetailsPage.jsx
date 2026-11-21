import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Bookmark, BookmarkCheck, Clock, Eye, Library, Play, Star } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import StarRating from '../components/common/StarRating'
import TrailerModal from '../components/common/TrailerModal'
import Avatar from '../components/common/Avatar'
import AddToCollectionModal from '../components/collections/AddToCollectionModal'

const heroBtn = (active) =>
  `btn ${
    active
      ? 'bg-accent text-white shadow-glow hover:bg-accent-hover'
      : 'border border-white/25 bg-white/10 text-white backdrop-blur hover:bg-white/20'
  }`

export default function MovieDetailsPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const toast = useToast()

  const [movie, setMovie] = useState(null)
  const [reviews, setReviews] = useState({ average: 0, count: 0, results: [] })
  const [status, setStatus] = useState({ inWatchlist: false, watched: false, review: null })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showTrailer, setShowTrailer] = useState(false)
  const [showCollections, setShowCollections] = useState(false)
  const closeTrailer = useCallback(() => setShowTrailer(false), [])

  const [editing, setEditing] = useState(false)
  const [rating, setRating] = useState(0)
  const [body, setBody] = useState('')
  const [saving, setSaving] = useState(false)

  const loadReviews = useCallback(
    () => api.get(`/reviews/movie/${id}`).then((res) => setReviews(res.data)),
    [id]
  )

  const loadStatus = useCallback(() => {
    if (!user) return Promise.resolve()
    return api.get(`/lists/status/${id}`).then((res) => setStatus(res.data))
  }, [id, user])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    Promise.all([api.get(`/movies/${id}`), api.get(`/reviews/movie/${id}`)])
      .then(([m, r]) => {
        if (cancelled) return
        setMovie(m.data)
        setReviews(r.data)
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
  }, [id])

  useEffect(() => {
    loadStatus().catch(() => {})
  }, [loadStatus])

  useEffect(() => {
    setRating(status.review?.rating || 0)
    setBody(status.review?.body || '')
    setEditing(false)
  }, [status.review])

  const toggleList = async (list) => {
    const active = list === 'watchlist' ? status.inWatchlist : status.watched
    try {
      if (active) await api.delete(`/lists/${list}/${id}`)
      else await api.post(`/lists/${list}/${id}`)
      await loadStatus()
      if (list === 'watchlist') toast(active ? 'Removed from watchlist' : 'Added to watchlist')
      else toast(active ? 'Removed from watched' : 'Marked as watched')
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  const submitReview = async (e) => {
    e.preventDefault()
    if (!rating) {
      toast('Please select a star rating.', 'error')
      return
    }
    setSaving(true)
    try {
      if (status.review) await api.put(`/reviews/${status.review.id}`, { rating, body })
      else await api.post('/reviews', { movieId: id, rating, body })
      await Promise.all([loadStatus(), loadReviews()])
      toast('Review saved.')
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const deleteReview = async () => {
    if (!status.review || !window.confirm('Delete your review?')) return
    try {
      await api.delete(`/reviews/${status.review.id}`)
      await Promise.all([loadStatus(), loadReviews()])
      toast('Review deleted.')
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  if (loading) return <div className="skeleton h-[480px] rounded-3xl" />

  if (error) {
    return (
      <div className="card space-y-4 p-6">
        <p className="text-sm text-red-500">{error}</p>
        <Link to="/explore" className="text-sm font-semibold text-accent hover:underline">
          Back to explore
        </Link>
      </div>
    )
  }

  if (!movie) return null

  return (
    <article className="animate-fade-in space-y-12">
      <div className="relative isolate overflow-hidden rounded-3xl bg-zinc-900 text-white shadow-xl">
        {movie.backdropUrl && (
          <img src={movie.backdropUrl} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-40" />
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-zinc-900 via-zinc-900/80 to-zinc-900/30 md:bg-gradient-to-r md:from-zinc-900 md:via-zinc-900/70 md:to-transparent" />

        <div className="flex flex-col gap-8 p-6 sm:p-8 md:flex-row md:gap-10 md:p-12">
          <div className="mx-auto w-44 shrink-0 sm:w-56 md:mx-0 md:w-64">
            {movie.posterUrl ? (
              <img src={movie.posterUrl} alt={movie.title} className="w-full rounded-2xl shadow-2xl ring-1 ring-white/10" />
            ) : (
              <div className="flex aspect-[2/3] items-center justify-center rounded-2xl bg-zinc-800 p-4 text-center text-sm text-zinc-400">
                {movie.title}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-5 text-center md:text-left">
            <div className="space-y-2">
              <h1 className="text-3xl font-black leading-tight sm:text-4xl">{movie.title}</h1>
              {movie.tagline && <p className="italic text-zinc-300">{movie.tagline}</p>}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-zinc-300 md:justify-start">
              <span className="flex items-center gap-1 font-semibold text-white">
                <Star size={16} className="fill-yellow-400 text-yellow-400" />
                {movie.rating > 0 ? movie.rating : 'Not rated yet'}
              </span>
              {reviews.count > 0 && <span>Community {reviews.average}/5 ({reviews.count})</span>}
              {movie.releaseDate && <span>{movie.releaseDate.slice(0, 4)}</span>}
              {movie.runtime > 0 && (
                <span className="flex items-center gap-1">
                  <Clock size={16} />
                  {movie.runtime} min
                </span>
              )}
            </div>

            <div className="flex flex-wrap justify-center gap-2 md:justify-start">
              {movie.genres.map((g) => (
                <span key={g.id} className="badge border border-white/20 px-3 py-1 text-white/90">
                  {g.name}
                </span>
              ))}
            </div>

            <p className="mx-auto max-w-2xl leading-relaxed text-zinc-200 md:mx-0">
              {movie.overview || 'No overview available.'}
            </p>

            {movie.director && (
              <p className="text-sm">
                <span className="text-zinc-400">Director: </span>
                {movie.director}
              </p>
            )}

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap sm:justify-center md:justify-start">
              {movie.trailerKey && (
                <button onClick={() => setShowTrailer(true)} className="btn btn-primary">
                  <Play size={16} />
                  Watch trailer
                </button>
              )}
              {user && (
                <>
                  <button onClick={() => toggleList('watchlist')} className={heroBtn(status.inWatchlist)}>
                    {status.inWatchlist ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                    {status.inWatchlist ? 'In watchlist' : 'Add to watchlist'}
                  </button>
                  <button onClick={() => toggleList('watched')} className={heroBtn(status.watched)}>
                    <Eye size={16} />
                    {status.watched ? 'Watched' : 'Mark as watched'}
                  </button>
                  <button onClick={() => setShowCollections(true)} className={heroBtn(false)}>
                    <Library size={16} />
                    Add to collection
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <section className="space-y-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="section-title">Reviews</h2>
          <p className="text-sm text-zinc-500">
            {reviews.count > 0
              ? `Average ${reviews.average}/5 from ${reviews.count} review${reviews.count > 1 ? 's' : ''}`
              : 'No reviews yet'}
          </p>
        </div>

        {!user && (
          <div className="card p-5 text-sm text-zinc-500">
            <Link to="/login" className="font-semibold text-accent hover:underline">
              Log in
            </Link>{' '}
            to rate and review this movie.
          </div>
        )}

        {user && status.review && !editing && (
          <div className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Your review</p>
              <StarRating value={status.review.rating} readOnly size={16} />
              {status.review.body && <p className="text-sm leading-relaxed">{status.review.body}</p>}
            </div>
            <div className="flex shrink-0 gap-2">
              <button onClick={() => setEditing(true)} className="btn btn-secondary px-4 py-2 text-xs">
                Edit
              </button>
              <button onClick={deleteReview} className="btn btn-danger px-4 py-2 text-xs">
                Delete
              </button>
            </div>
          </div>
        )}

        {user && (!status.review || editing) && (
          <form onSubmit={submitReview} className="card space-y-4 p-5">
            <p className="font-semibold">{status.review ? 'Edit your review' : 'Rate this movie'}</p>
            <StarRating value={rating} onChange={setRating} />
            <textarea
              rows={4}
              maxLength={2000}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your review (optional)"
              className="input resize-none"
            />
            <div className="flex flex-col gap-2 sm:flex-row">
              <button type="submit" disabled={saving} className="btn btn-primary">
                {saving ? 'Saving...' : 'Save review'}
              </button>
              {editing && (
                <button type="button" onClick={() => setEditing(false)} className="btn btn-secondary">
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}

        <ul className="grid gap-4 md:grid-cols-2">
          {reviews.results.map((r) => (
            <li key={r.id} className="card space-y-3 p-5">
              <div className="flex items-center gap-3">
                <Avatar name={r.userName} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{r.userName}</p>
                  <p className="text-xs text-zinc-500">
                    {new Date(r.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <StarRating value={r.rating} readOnly size={14} />
              </div>
              {r.body && <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{r.body}</p>}
            </li>
          ))}
        </ul>
      </section>

      {movie.cast.length > 0 && (
        <section className="space-y-6">
          <h2 className="section-title">Top cast</h2>
          <div className="grid grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-5 lg:grid-cols-6">
            {movie.cast.map((person) => (
              <div key={person.id} className="text-center">
                {person.photoUrl ? (
                  <img
                    src={person.photoUrl}
                    alt={person.name}
                    loading="lazy"
                    className="mx-auto aspect-square w-20 rounded-full object-cover shadow-md ring-1 ring-black/5 sm:w-24 dark:ring-white/10"
                  />
                ) : (
                  <div className="mx-auto flex aspect-square w-20 items-center justify-center rounded-full bg-zinc-200 text-xs text-zinc-500 sm:w-24 dark:bg-cinema-800">
                    No photo
                  </div>
                )}
                <p className="mt-3 line-clamp-1 text-sm font-semibold">{person.name}</p>
                <p className="line-clamp-1 text-xs text-zinc-500">{person.character}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {showTrailer && movie.trailerKey && (
        <TrailerModal trailerKey={movie.trailerKey} title={movie.title} onClose={closeTrailer} />
      )}

      {showCollections && (
        <AddToCollectionModal
          movieId={id}
          movieTitle={movie.title}
          onClose={() => setShowCollections(false)}
        />
      )}
    </article>
  )
}