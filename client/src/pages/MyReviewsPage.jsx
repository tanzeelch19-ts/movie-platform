import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { useToast } from '../context/ToastContext'
import StarRating from '../components/common/StarRating'
import EmptyState from '../components/common/EmptyState'

export default function MyReviewsPage() {
  const toast = useToast()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [draft, setDraft] = useState({ rating: 0, body: '' })

  const load = () => api.get('/reviews/mine').then((res) => setReviews(res.data.results))

  useEffect(() => {
    load()
      .catch((err) => toast(err.message, 'error'))
      .finally(() => setLoading(false))
  }, [toast])

  const startEdit = (r) => {
    setEditingId(r.id)
    setDraft({ rating: r.rating, body: r.body })
  }

  const saveEdit = async (id) => {
    try {
      await api.put(`/reviews/${id}`, draft)
      setEditingId(null)
      await load()
      toast('Review updated.')
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this review?')) return
    try {
      await api.delete(`/reviews/${id}`)
      await load()
      toast('Review deleted.')
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  return (
    <section className="animate-fade-in space-y-8">
      <div>
        <h1 className="section-title">My reviews</h1>
        <p className="mt-1 text-sm text-zinc-500">Your ratings and thoughts on every movie you have reviewed.</p>
      </div>

      {loading && <div className="skeleton h-40" />}

      {!loading && reviews.length === 0 && (
        <EmptyState
          title="No reviews yet"
          description="Rate a movie and write a few words about it. It will show up here."
          linkTo="/explore"
          linkLabel="Find a movie to review"
        />
      )}

      <ul className="space-y-4">
        {reviews.map((r) => (
          <li key={r.id} className="card flex flex-col gap-4 p-4 sm:flex-row sm:gap-5 sm:p-5">
            {r.posterUrl && (
              <img
                src={r.posterUrl}
                alt=""
                className="h-44 w-28 shrink-0 self-start rounded-xl object-cover shadow-md sm:h-32 sm:w-24"
              />
            )}

            <div className="min-w-0 flex-1 space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <Link to={`/movies/${r.movieId}`} className="font-semibold hover:text-accent">
                  {r.movieTitle}
                </Link>
                {r.hidden && <span className="badge bg-yellow-500/15 text-yellow-600">Hidden by a moderator</span>}
              </div>

              {editingId === r.id ? (
                <div className="space-y-3">
                  <StarRating value={draft.rating} onChange={(n) => setDraft((d) => ({ ...d, rating: n }))} />
                  <textarea
                    rows={3}
                    maxLength={2000}
                    value={draft.body}
                    onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
                    className="input resize-none"
                  />
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button onClick={() => saveEdit(r.id)} disabled={!draft.rating} className="btn btn-primary px-4 py-2 text-xs">
                      Save
                    </button>
                    <button onClick={() => setEditingId(null)} className="btn btn-secondary px-4 py-2 text-xs">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <StarRating value={r.rating} readOnly size={16} />
                  {r.body ? (
                    <p className="break-words text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{r.body}</p>
                  ) : (
                    <p className="text-sm text-zinc-500">No written review.</p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="mr-auto text-xs text-zinc-500">
                      {new Date(r.updatedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <button onClick={() => startEdit(r)} className="btn btn-secondary px-3 py-1.5 text-xs">
                      Edit
                    </button>
                    <button onClick={() => remove(r.id)} className="btn btn-danger px-3 py-1.5 text-xs">
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}