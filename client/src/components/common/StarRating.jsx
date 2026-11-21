import { Star } from 'lucide-react'

export default function StarRating({ value = 0, onChange, size = 20, readOnly = false }) {
  return (
    <div className="flex gap-1" aria-label={`Rating ${value} of 5`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const cls = n <= value ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-400'
        if (readOnly) return <Star key={n} size={size} className={cls} />
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange?.(n)}
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
            className="transition hover:scale-110"
          >
            <Star size={size} className={cls} />
          </button>
        )
      })}
    </div>
  )
}