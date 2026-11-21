import MovieCard from './MovieCard'

export default function MovieGridWithAction({ movies, renderActions }) {
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {movies.map((movie) => (
        <div key={movie.id} className="space-y-3">
          <MovieCard movie={movie} />
          {renderActions && renderActions(movie)}
        </div>
      ))}
    </div>
  )
}