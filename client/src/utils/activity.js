export const LABELS = {
  watchlist_add: 'Added to watchlist',
  watchlist_remove: 'Removed from watchlist',
  watched_add: 'Marked as watched',
  watched_remove: 'Removed from watched',
  review_create: 'Reviewed a movie',
  review_update: 'Updated a review',
  review_delete: 'Deleted a review',
  collection_create: 'Created a collection',
  collection_update: 'Updated a collection',
  collection_delete: 'Deleted a collection',
  collection_add_movie: 'Added to a collection',
  collection_remove_movie: 'Removed from a collection',
  profile_update: 'Updated profile',
  password_change: 'Changed password',
  settings_update: 'Changed settings',
  logout: 'Logged out',
}

export const fmt = (iso) =>
  new Date(iso).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

export const detailText = (details = {}) =>
  [details.title, details.name, details.collection, details.rating ? `${details.rating}/5` : null]
    .filter(Boolean)
    .join(' · ')