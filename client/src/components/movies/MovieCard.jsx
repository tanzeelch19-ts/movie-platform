import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'

export default function MovieCard({ movie }) {
  const [imgError, setImgError] = useState(false)
  const year = movie.releaseDate ? movie.releaseDate.slice(0, 4) : 'TBA'

  return (
    <Link to={`/movies/${movie.id}`} className="group block focus:outline-none">
      <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-zinc-200 shadow-md ring-1 ring-black/5 transition duration-300 group-hover:-translate-y-1 group-hover:shadow-xl group-focus-visible:ring-2 group-focus-visible:ring-accent dark:bg-cinema-800 dark:ring-white/5">
        {movie.posterUrl && !imgError ? (
          <img
            src={movie.posterUrl}
            alt={movie.title}
            loading="lazy"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center p-4 text-center text-sm font-medium text-zinc-500">
            {movie.title}
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 transition duration-300 group-hover:opacity-100" />

        <span className="badge absolute right-2 top-2 bg-black/60 text-white backdrop-blur-md">
          <Star size={11} className="fill-yellow-400 text-yellow-400" />
          {movie.rating > 0 ? movie.rating : 'New'}
        </span>

        <span className="absolute bottom-3 left-3 right-3 translate-y-2 text-center text-xs font-semibold text-white opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          View details
        </span>
      </div>

      <h3 className="mt-3 line-clamp-1 text-sm font-semibold transition group-hover:text-accent">{movie.title}</h3>
      <p className="text-xs text-zinc-500">{year}</p>
    </Link>
  )
}