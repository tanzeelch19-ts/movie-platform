import { useEffect, useState } from 'react'
import { Check, Plus } from 'lucide-react'
import api from '../../services/api'
import { useToast } from '../../context/ToastContext'
import Modal from '../common/Modal'
import CollectionForm from './CollectionForm'

export default function AddToCollectionModal({ movieId, movieTitle, onClose }) {
  const toast = useToast()
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    api
      .get('/collections', { params: { movieId } })
      .then((res) => setCollections(res.data.results))
      .catch((err) => toast(err.message, 'error'))
      .finally(() => setLoading(false))
  }, [movieId, toast])

  const toggle = async (c) => {
    setBusyId(c.id)
    try {
      if (c.containsMovie) await api.delete(`/collections/${c.id}/movies/${movieId}`)
      else await api.post(`/collections/${c.id}/movies/${movieId}`)

      setCollections((list) =>
        list.map((x) =>
          x.id === c.id
            ? { ...x, containsMovie: !c.containsMovie, itemCount: x.itemCount + (c.containsMovie ? -1 : 1) }
            : x
        )
      )
      toast(c.containsMovie ? `Removed from ${c.name}` : `Added to ${c.name}`)
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setBusyId(null)
    }
  }

  const createAndAdd = async (values) => {
    try {
      const { data } = await api.post('/collections', values)
      await api.post(`/collections/${data.collection.id}/movies/${movieId}`)
      setCollections((list) => [{ ...data.collection, containsMovie: true, itemCount: 1 }, ...list])
      setCreating(false)
      toast(`Created ${values.name} and added the movie.`)
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  return (
    <Modal title="Add to collection" onClose={onClose}>
      <p className="-mt-2 mb-5 truncate text-sm text-zinc-500">{movieTitle}</p>

      {loading && (
        <div className="space-y-2">
          <div className="skeleton h-14" />
          <div className="skeleton h-14" />
        </div>
      )}

      {!loading && collections.length === 0 && !creating && (
        <p className="mb-4 text-sm text-zinc-500">You do not have any collections yet.</p>
      )}

      {!loading && collections.length > 0 && (
        <ul className="max-h-72 space-y-2 overflow-y-auto pr-1">
          {collections.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => toggle(c)}
                disabled={busyId === c.id}
                aria-pressed={c.containsMovie}
                className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition disabled:opacity-60 ${
                  c.containsMovie
                    ? 'border-accent bg-accent/10'
                    : 'border-zinc-200 hover:bg-zinc-50 dark:border-white/10 dark:hover:bg-white/5'
                }`}
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{c.name}</span>
                  <span className="text-xs text-zinc-500">
                    {c.itemCount} {c.itemCount === 1 ? 'movie' : 'movies'}
                  </span>
                </span>
                <span
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border ${
                    c.containsMovie ? 'border-accent bg-accent text-white' : 'border-zinc-300 dark:border-white/20'
                  }`}
                >
                  {c.containsMovie && <Check size={14} />}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5 border-t border-zinc-200 pt-5 dark:border-white/10">
        {creating ? (
          <CollectionForm
            submitLabel="Create and add"
            onSubmit={createAndAdd}
            onCancel={() => setCreating(false)}
          />
        ) : (
          <button onClick={() => setCreating(true)} className="btn btn-secondary w-full">
            <Plus size={16} />
            New collection
          </button>
        )}
      </div>
    </Modal>
  )
}