import { useState } from 'react'

export default function CollectionForm({ initial, submitLabel = 'Save', onSubmit, onCancel }) {
  const [values, setValues] = useState(initial || { name: '', description: '' })
  const [saving, setSaving] = useState(false)

  const update = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    await onSubmit({ name: values.name.trim(), description: values.description.trim() })
    setSaving(false)
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="collection-name" className="text-sm font-medium">Name</label>
        <input
          id="collection-name"
          required
          maxLength={60}
          autoFocus
          value={values.name}
          onChange={update('name')}
          placeholder="e.g. Weekend movies"
          className="input"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="collection-description" className="text-sm font-medium">
          Description <span className="font-normal text-zinc-400">(optional)</span>
        </label>
        <textarea
          id="collection-description"
          rows={3}
          maxLength={300}
          value={values.description}
          onChange={update('description')}
          className="input resize-none"
        />
        <p className="text-right text-xs text-zinc-500">{values.description.length}/300</p>
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Cancel
          </button>
        )}
        <button type="submit" disabled={saving} className="btn btn-primary">
          {saving ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  )
}