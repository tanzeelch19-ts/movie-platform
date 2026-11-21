import { Link } from 'react-router-dom'
import MovieCard from './MovieCard'

export default function MovieRow({ title, movies, seeAllTo }) {
  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <h2 className="section-title">{title}</h2>
        {seeAllTo && (
          <Link to={seeAllTo} className="shrink-0 text-sm font-semibold text-accent hover:underline">
            See all
          </Link>
        )}
      </div>

      <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] sm:-mx-6 sm:px-6 [&::-webkit-scrollbar]:hidden">
        {movies.map((movie) => (
          <div key={movie.id} className="w-40 shrink-0 snap-start sm:w-48">
            <MovieCard movie={movie} />
          </div>
        ))}
      </div>
    </div>
  )
}