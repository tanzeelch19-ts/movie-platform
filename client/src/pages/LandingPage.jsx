import { Link } from 'react-router-dom'
import { Bookmark, Compass, Sparkles, Star } from 'lucide-react'

const features = [
  {
    icon: Compass,
    title: 'Discover what is next',
    text: 'Browse movies in theaters, coming soon, and what is trending this week, with trailers and cast details.',
  },
  {
    icon: Bookmark,
    title: 'Track your watchlist',
    text: 'Save movies for later, mark what you have seen, and keep a complete watch history.',
  },
  {
    icon: Star,
    title: 'Rate and review',
    text: 'Give five-star ratings, write your thoughts, and see what the community thinks.',
  },
  {
    icon: Sparkles,
    title: 'Picks for your taste',
    text: 'Get recommendations from people who rate movies the way you do.',
  },
]

export default function LandingPage() {
  return (
    <div className="animate-fade-in space-y-20">
      <section className="relative isolate overflow-hidden rounded-3xl border border-zinc-200/80 bg-white px-6 py-20 text-center shadow-card dark:border-white/10 dark:bg-cinema-900 sm:px-12 sm:py-28">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10"
          style={{ background: 'radial-gradient(60rem 28rem at 50% -10%, rgba(225,29,72,0.18), transparent 70%)' }}
        />
        <span className="badge mx-auto bg-accent/10 text-accent">Your movie journal</span>
        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-black leading-tight tracking-tight sm:text-6xl">
          Every movie you watch, <span className="text-accent">remembered.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-zinc-500 sm:text-lg">
          Reelist helps you decide what to watch next, keep track of what you have seen, and share what you think.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/register" className="btn btn-primary w-full sm:w-auto">
            Get started free
          </Link>
          <Link to="/explore" className="btn btn-secondary w-full sm:w-auto">
            Browse movies
          </Link>
        </div>
      </section>

      <section className="space-y-10">
        <div className="mx-auto max-w-2xl space-y-3 text-center">
          <h2 className="section-title">Everything you need in one place</h2>
          <p className="text-zinc-500">A focused space for people who love movies.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, text }) => (
            <div key={title} className="card p-6 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl">
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-accent/10 text-accent">
                <Icon size={20} />
              </div>
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card flex flex-col items-center gap-5 px-6 py-12 text-center sm:py-14">
        <h2 className="section-title">Ready to start your watchlist?</h2>
        <p className="max-w-md text-zinc-500">Create a free account in under a minute.</p>
        <Link to="/register" className="btn btn-primary">
          Create your account
        </Link>
      </section>
    </div>
  )
}