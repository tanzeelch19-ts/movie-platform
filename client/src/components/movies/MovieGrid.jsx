import MovieCard from './MovieCard'

const gridClass = 'grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'

export function MovieGridSkeleton({ count = 10 }) {
  return (
    <div className={gridClass}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <div className="skeleton aspect-[2/3]" />
          <div className="skeleton mt-3 h-3 w-3/4" />
        </div>
      ))}
    </div>
  )
}

export default function MovieGrid({ movies }) {
  return (
    <div className={gridClass}>
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  )
}