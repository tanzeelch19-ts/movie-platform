const gradients = [
  'from-red-600 to-orange-500',
  'from-indigo-600 to-cyan-500',
  'from-emerald-600 to-teal-500',
  'from-fuchsia-600 to-purple-500',
]

const sizes = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-20 w-20 text-2xl',
}

export default function Avatar({ name = '?', size = 'md' }) {
  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || '?'
  const gradient = gradients[name.length % gradients.length]

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${gradient} ${sizes[size]} font-bold text-white shadow`}
      aria-hidden="true"
    >
      {initials}
    </div>
  )
}