import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="flex animate-fade-in flex-col items-center justify-center py-24 text-center">
      <p className="text-7xl font-black text-accent">404</p>
      <h1 className="mt-4 text-2xl font-bold">Page not found</h1>
      <p className="mt-2 max-w-sm text-zinc-500">The page you're looking for doesn't exist or has moved.</p>
      <Link to="/home" className="btn btn-primary mt-8">
        Back to home
      </Link>
    </section>
  )
}