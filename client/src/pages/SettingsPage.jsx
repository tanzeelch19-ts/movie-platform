import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertTriangle, Moon, Sun } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useToast } from '../context/ToastContext'
import Toggle from '../components/common/Toggle'
import Modal from '../components/common/Modal'

function Section({ title, description, danger = false, children }) {
  return (
    <div className={`card p-5 sm:p-6 ${danger ? 'border-red-500/30' : ''}`}>
      <h2 className={`text-lg font-semibold ${danger ? 'text-red-500' : ''}`}>{title}</h2>
      {description && <p className="mt-1 text-sm text-zinc-500">{description}</p>}
      <div className="mt-5">{children}</div>
    </div>
  )
}

function Row({ title, description, children }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="min-w-0">
        <p className="font-medium">{title}</p>
        {description && <p className="break-words text-sm text-zinc-500">{description}</p>}
      </div>
      {children}
    </div>
  )
}

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const toast = useToast()
  const navigate = useNavigate()

  const [digest, setDigest] = useState(user.preferences?.emailDigest ?? true)
  const [showDelete, setShowDelete] = useState(false)
  const [password, setPassword] = useState('')
  const [deleting, setDeleting] = useState(false)

  const saveDigest = async (value) => {
    setDigest(value)
    try {
      const { data } = await api.patch('/auth/me', { emailDigest: value })
      updateUser(data.user)
      toast(value ? 'Weekly digest turned on.' : 'Weekly digest turned off.')
    } catch (err) {
      setDigest(!value)
      toast(err.message, 'error')
    }
  }

  const deleteAccount = async (e) => {
    e.preventDefault()
    setDeleting(true)
    try {
      await api.delete('/auth/me', { data: { password } })
      logout()
      toast('Your account has been deleted.')
      navigate('/home')
    } catch (err) {
      toast(err.message, 'error')
      setDeleting(false)
    }
  }

  const themes = [
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'light', label: 'Light', icon: Sun },
  ]

  return (
    <section className="mx-auto max-w-2xl animate-fade-in space-y-6">
      <div>
        <h1 className="section-title">Settings</h1>
        <p className="mt-1 text-sm text-zinc-500">Manage how Reelist looks and what it sends you.</p>
      </div>

      <Section title="Appearance" description="Pick the theme for this device.">
        <div className="grid grid-cols-2 gap-3">
          {themes.map((opt) => {
            const active = theme === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                aria-pressed={active}
                className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                  active
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-zinc-200 hover:bg-zinc-50 dark:border-white/10 dark:hover:bg-white/5'
                }`}
              >
                <opt.icon size={16} />
                {opt.label}
              </button>
            )
          })}
        </div>
      </Section>

      <Section title="Notifications" description="Control the emails you receive.">
        <Row title="Weekly email digest" description="Trending and top-rated picks, once a week, plus picks for you.">
          <Toggle checked={digest} onChange={saveDigest} label="Weekly email digest" />
        </Row>
      </Section>

      <Section title="Account" description="Your profile details and password live on the profile page.">
        <Row title="Signed in as" description={user.email}>
          <Link to="/profile" className="btn btn-secondary w-full sm:w-auto">
            Edit profile
          </Link>
        </Row>
      </Section>

      <Section
        danger
        title="Danger zone"
        description="Deleting your account removes your watchlist, watched history and reviews. This cannot be undone."
      >
        <button onClick={() => setShowDelete(true)} className="btn btn-danger w-full sm:w-auto">
          Delete account
        </button>
      </Section>

      {showDelete && (
        <Modal title="Delete your account?" onClose={() => setShowDelete(false)}>
          <form onSubmit={deleteAccount} className="space-y-4">
            <div className="flex gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-500">
              <AlertTriangle size={18} className="mt-0.5 shrink-0" />
              <p>All your data will be permanently removed. Enter your password to confirm.</p>
            </div>
            <input
              type="password"
              required
              placeholder="Your password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
            />
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setShowDelete(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={deleting} className="btn bg-red-600 text-white hover:bg-red-700">
                {deleting ? 'Deleting...' : 'Delete account'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  )
}