import { useEffect, useState } from 'react'
import api from '../../services/api'
import { useToast } from '../../context/ToastContext'
import Modal from '../common/Modal'
import { LABELS, fmt, detailText } from '../../utils/activity'

const TABS = [
  { value: 'activity', label: 'Activity' },
  { value: 'logins', label: 'Logins' },
  { value: 'searches', label: 'Searches' },
]

export default function UserActivityModal({ user, onClose }) {
  const toast = useToast()
  const [data, setData] = useState(null)
  const [tab, setTab] = useState('activity')

  useEffect(() => {
    api
      .get(`/admin/users/${user.id}/activity`)
      .then((res) => setData(res.data))
      .catch((err) => toast(err.message, 'error'))
  }, [user.id, toast])

  const rows = !data
    ? []
    : tab === 'activity'
      ? data.activity.map((a) => ({
          id: a.id,
          title: LABELS[a.type] || a.type,
          sub: detailText(a.details),
          at: a.createdAt,
        }))
      : tab === 'logins'
        ? data.logins.map((l) => ({
            id: l.id,
            title: `${l.success ? 'Success' : 'Failed'} · ${l.kind === 'register' ? 'Sign up' : 'Log in'}`,
            sub: `IP ${l.ip || 'unknown'}`,
            at: l.createdAt,
          }))
        : data.searches.map((s) => ({
            id: s.id,
            title: s.query,
            sub: s.source === 'library' ? 'Library' : 'Movies',
            at: s.createdAt,
          }))

  return (
    <Modal title={`${user.name}'s activity`} onClose={onClose}>
      <p className="-mt-2 mb-4 break-all font-mono text-xs text-zinc-500">{user.id}</p>

      <div className="mb-4 flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            aria-pressed={tab === t.value}
            className={`btn px-3 py-1.5 text-xs ${tab === t.value ? 'btn-primary' : 'btn-secondary'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {!data && <div className="skeleton h-40" />}

      {data && rows.length === 0 && (
        <p className="py-8 text-center text-sm text-zinc-500">Nothing recorded yet.</p>
      )}

      {data && rows.length > 0 && (
        <ul className="max-h-80 divide-y divide-zinc-200 overflow-y-auto dark:divide-white/10">
          {rows.map((r) => (
            <li key={r.id} className="py-3">
              <p className="truncate text-sm font-medium">{r.title}</p>
              {r.sub && <p className="truncate text-xs text-zinc-500">{r.sub}</p>}
              <p className="text-xs text-zinc-400">{fmt(r.at)}</p>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  )
}