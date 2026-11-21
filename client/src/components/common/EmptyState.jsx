import { Link } from 'react-router-dom'
import { Film } from 'lucide-react'

export default function EmptyState({ title, description, linkTo, linkLabel }) {
  return (
    <div className="card flex animate-fade-in flex-col items-center px-6 py-16 text-center">
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-accent/10 text-accent">
        <Film size={26} />
      </div>
      <p className="text-lg font-semibold">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-zinc-500">{description}</p>}
      {linkTo && (
        <Link to={linkTo} className="btn btn-primary mt-6">
          {linkLabel}
        </Link>
      )}
    </div>
  )
}