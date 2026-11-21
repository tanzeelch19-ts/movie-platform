import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const WRONG_CREDENTIALS = 'Invalid email or password'

export default function LoginPage() {
  const { user, login } = useAuth()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/home'

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (user) return <Navigate to={from} replace />

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(form.email, form.password)
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <section className="mx-auto max-w-md animate-fade-in py-6">
      <div className="card overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-accent to-red-900" />
        <div className="p-8">
          <h1 className="text-2xl font-black">Welcome back</h1>
          <p className="mt-1 text-sm text-zinc-500">Log in to manage your watchlist and reviews.</p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                className="input"
              />
            </div>

            {error && (
              <div role="alert" className="space-y-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5">
                <p className="text-sm text-red-500">{error}</p>
                {error === WRONG_CREDENTIALS && (
                  <div className="space-y-2">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Don't have an account yet? Sign up first.
                    </p>
                    <Link
                      to="/register"
                      state={{ email: form.email }}
                      className="btn btn-secondary w-full px-4 py-2 text-xs"
                    >
                      <UserPlus size={14} />
                      Create an account with this email
                    </Link>
                  </div>
                )}
              </div>
            )}

            <button type="submit" disabled={submitting} className="btn btn-primary w-full">
              {submitting ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <div className="mt-6 border-t border-zinc-200 pt-6 text-center dark:border-white/10">
            <p className="text-sm text-zinc-500">New here?</p>
            <Link to="/register" className="mt-2 inline-block text-sm font-semibold text-accent hover:underline">
              Create a new account
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}