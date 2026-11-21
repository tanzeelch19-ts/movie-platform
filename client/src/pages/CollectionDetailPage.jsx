import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import api from '../services/api'
import { useToast } from '../context/ToastContext'
import Modal from '../components/common/Modal'
import EmptyState from '../components/common/EmptyState'
import CollectionForm from '../components/collections/CollectionForm'
import MovieGridWithAction from '../components/movies/MovieGridWithAction'
import { MovieGridSkeleton } from '../components/movies/MovieGrid'

export default function CollectionDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const [collection, setCollection] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    api
      .get(`/collections/${id}`)
      .then((res) => {
        if (!cancelled) setCollection(res.data)
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

  const saveDetails = async (values) => {
    try {
      const { data } = await api.patch(`/collections/${id}`, values)
      setCollection((c) => ({ ...c, ...data.collection }))
      setEditing(false)
      toast('Collection updated.')
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  const removeMovie = async (movieId) => {
    try {
      await api.delete(`/collections/${id}/movies/${movieId}`)
      setCollection((c) => ({
        ...c,
        itemCount: c.itemCount - 1,
        items: c.items.filter((i) => i.movieId !== movieId),
      }))
      toast('Removed from collection.')
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  const deleteCollection = async () => {
    setDeleting(true)
    try {
      await api.delete(`/collections/${id}`)
      toast('Collection deleted.')
      navigate('/collections', { replace: true })
    } catch (err) {
      toast(err.message, 'error')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-10 w-64" />
        <MovieGridSkeleton count={5} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="card space-y-4 p-6">
        <p className="text-sm text-red-500">{error}</p>
        <Link to="/collections" className="text-sm font-semibold text-accent hover:underline">
          Back to collections
        </Link>
      </div>
    )
  }

  const movies = collection.items.map((i) => ({
    id: i.movieId,
    title: i.title,
    posterUrl: i.posterUrl,
    releaseDate: i.releaseDate,
    rating: i.tmdbRating,
  }))

  return (
    <section className="animate-fade-in space-y-8">
      <Link to="/collections" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-accent">
        <ArrowLeft size={16} />
        All collections
      </Link>

      <div className="card flex flex-col gap-5 p-6 sm:flex-row sm:items-start sm:justify-between">
        {editing ? (
          <div className="w-full max-w-xl">
            <CollectionForm
              initial={{ name: collection.name, description: collection.description || '' }}
              submitLabel="Save changes"
              onSubmit={saveDetails}
              onCancel={() => setEditing(false)}
            />
          </div>
        ) : (
          <>
            <div className="min-w-0 space-y-2">
              <h1 className="section-title truncate">{collection.name}</h1>
              <p className="text-sm text-zinc-500">{collection.description || 'No description'}</p>
              <span className="badge bg-zinc-900/5 text-zinc-600 dark:bg-white/10 dark:text-zinc-300">
                {collection.itemCount} {collection.itemCount === 1 ? 'movie' : 'movies'}
              </span>
            </div>
            <div className="flex shrink-0 gap-2">
              <button onClick={() => setEditing(true)} className="btn btn-secondary px-4 py-2 text-xs">
                <Pencil size={14} />
                Edit
              </button>
              <button onClick={() => setConfirmDelete(true)} className="btn btn-danger px-4 py-2 text-xs">
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </>
        )}
      </div>

      {movies.length === 0 ? (
        <EmptyState
          title="No movies in this collection yet"
          description="Open any movie and choose Add to collection."
          linkTo="/explore"
          linkLabel="Explore movies"
        />
      ) : (
        <MovieGridWithAction
          movies={movies}
          renderActions={(m) => (
            <button onClick={() => removeMovie(m.id)} className="btn btn-secondary w-full px-2 py-1.5 text-xs">
              Remove
            </button>
          )}
        />
      )}

      {confirmDelete && (
        <Modal title="Delete this collection?" onClose={() => setConfirmDelete(false)}>
          <p className="text-sm text-zinc-500">
            "{collection.name}" will be deleted. The movies themselves stay on Reelist.
          </p>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button onClick={() => setConfirmDelete(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button
              onClick={deleteCollection}
              disabled={deleting}
              className="btn bg-red-600 text-white hover:bg-red-700"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </Modal>
      )}
    </section>
  )
}