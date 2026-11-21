import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Film, FolderPlus } from 'lucide-react'
import api from '../services/api'
import { useToast } from '../context/ToastContext'
import Modal from '../components/common/Modal'
import EmptyState from '../components/common/EmptyState'
import CollectionForm from '../components/collections/CollectionForm'

function CollectionCard({ collection: c }) {
  return (
    <Link
      to={`/collections/${c.id}`}
      className="card group overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-zinc-200 dark:bg-cinema-900">
        {c.coverUrl ? (
          <img
            src={c.coverUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-accent/20 to-zinc-900/10 text-accent">
            <Film size={32} />
          </div>
        )}
        <span className="badge absolute right-3 top-3 bg-black/60 text-white backdrop-blur">
          {c.itemCount} {c.itemCount === 1 ? 'movie' : 'movies'}
        </span>
      </div>
      <div className="space-y-1 p-5">
        <h3 className="truncate font-semibold">{c.name}</h3>
        <p className="line-clamp-2 min-h-[2.5rem] text-sm text-zinc-500">{c.description || 'No description'}</p>
      </div>
    </Link>
  )
}

export default function CollectionsPage() {
  const toast = useToast()
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    api
      .get('/collections')
      .then((res) => setCollections(res.data.results))
      .catch((err) => toast(err.message, 'error'))
      .finally(() => setLoading(false))
  }, [toast])

  const createCollection = async (values) => {
    try {
      const { data } = await api.post('/collections', values)
      setCollections((list) => [data.collection, ...list])
      setShowCreate(false)
      toast('Collection created.')
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  return (
    <section className="animate-fade-in space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="section-title">Collections</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Group movies into lists of your own, like "Weekend movies" or "Best of 2025".
          </p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn btn-primary w-full sm:w-auto">
          <FolderPlus size={16} />
          New collection
        </button>
      </div>

      {loading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton aspect-[4/3]" />
          ))}
        </div>
      )}

      {!loading && collections.length === 0 && (
        <EmptyState
          title="No collections yet"
          description="Create your first collection, then add movies to it from any movie page."
        />
      )}

      {!loading && collections.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((c) => (
            <CollectionCard key={c.id} collection={c} />
          ))}
        </div>
      )}

      {showCreate && (
        <Modal title="New collection" onClose={() => setShowCreate(false)}>
          <CollectionForm
            submitLabel="Create collection"
            onSubmit={createCollection}
            onCancel={() => setShowCreate(false)}
          />
        </Modal>
      )}
    </section>
  )
}