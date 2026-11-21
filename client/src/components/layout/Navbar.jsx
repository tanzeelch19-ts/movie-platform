import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ChevronDown, Film, LogOut, Menu, Moon, Search, Settings, Library, History, Shield, Sun, User, X } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import Avatar from '../common/Avatar'

const navLinks = [
  { to: '/home', label: 'Home' },
  { to: '/explore', label: 'Explore' },
  { to: '/library', label: 'Library' },
  { to: '/watchlist', label: 'Watchlist' },
  { to: '/watched', label: 'Watched' },
  { to: '/reviews', label: 'Reviews' },
  { to: '/recommendations', label: 'For You' },
]

const navClass = ({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`

const mobileNavClass = ({ isActive }) =>
  `menu-item ${isActive ? 'bg-zinc-900/5 text-zinc-900 dark:bg-white/10 dark:text-white' : ''}`

export default function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the account dropdown on outside click or Escape.
  useEffect(() => {
    const onMouseDown = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setDropdownOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const closeAll = () => {
    setMenuOpen(false)
    setDropdownOpen(false)
  }

  const handleLogout = () => {
    logout()
    closeAll()
    toast('You have been logged out.')
    navigate('/login')
  }

  const accountItems = [
    { to: '/profile', label: 'Profile', icon: User },
    { to: '/collections', label: 'Collections', icon: Library },
    { to: '/activity', label: 'Activity', icon: History },
    { to: '/settings', label: 'Settings', icon: Settings },
    ...(user?.role === 'admin' ? [{ to: '/admin', label: 'Admin dashboard', icon: Shield }] : []),
  ]

  return (
    <header
      className={`sticky top-0 z-40 border-b border-zinc-200/70 bg-white/70 backdrop-blur-xl transition-shadow duration-300 dark:border-white/5 dark:bg-cinema-950/70 ${
        scrolled ? 'shadow-lg shadow-black/5 dark:shadow-black/40' : ''
      }`}
    >
      <nav className="container-page flex h-16 items-center gap-6">
        <Link to="/home" className="flex shrink-0 items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-accent to-red-900 text-white shadow-glow">
            <Film size={18} strokeWidth={2.5} />
          </span>
          <span className="text-lg font-black tracking-tight">Reelist</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={navClass}>
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Link to="/explore" aria-label="Search movies" className="icon-btn">
            <Search size={18} />
          </Link>

          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            className="icon-btn"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {user ? (
            <div ref={dropdownRef} className="relative hidden sm:block">
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={dropdownOpen}
                className="flex items-center gap-2 rounded-full p-1 pr-2.5 transition hover:bg-zinc-900/5 dark:hover:bg-white/10"
              >
                <Avatar name={user.name} size="sm" />
                <ChevronDown
                  size={16}
                  className={`text-zinc-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {dropdownOpen && (
                <div role="menu" className="menu-panel">
                  <div className="flex items-center gap-3 border-b border-zinc-200 px-3 py-3 dark:border-white/10">
                    <Avatar name={user.name} size="md" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{user.name}</p>
                      <p className="truncate text-xs text-zinc-500">{user.email}</p>
                    </div>
                  </div>

                  <div className="pt-1.5">
                    {accountItems.map((item) => (
                      <Link key={item.to} to={item.to} role="menuitem" onClick={closeAll} className="menu-item">
                        <item.icon size={16} className="text-zinc-500" />
                        {item.label}
                      </Link>
                    ))}
                    <button
                      onClick={handleLogout}
                      role="menuitem"
                      className="menu-item text-red-500 hover:bg-red-500/10"
                    >
                      <LogOut size={16} />
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link to="/login" className="btn btn-ghost">
                Log in
              </Link>
              <Link to="/register" className="btn btn-primary">
                Sign up
              </Link>
            </div>
          )}

          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            className="icon-btn md:hidden"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="animate-slide-up border-t border-zinc-200/70 bg-white/95 backdrop-blur-xl md:hidden dark:border-white/5 dark:bg-cinema-950/95">
          <div className="container-page space-y-1 py-4">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className={mobileNavClass} onClick={closeAll}>
                {link.label}
              </NavLink>
            ))}

            <div className="my-3 border-t border-zinc-200 dark:border-white/10" />

            {user ? (
              <div className="space-y-1">
                <div className="flex items-center gap-3 px-3 py-2">
                  <Avatar name={user.name} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{user.name}</p>
                    <p className="truncate text-xs text-zinc-500">{user.email}</p>
                  </div>
                </div>
                {accountItems.map((item) => (
                  <Link key={item.to} to={item.to} onClick={closeAll} className="menu-item">
                    <item.icon size={16} className="text-zinc-500" />
                    {item.label}
                  </Link>
                ))}
                <button onClick={handleLogout} className="menu-item text-red-500 hover:bg-red-500/10">
                  <LogOut size={16} />
                  Log out
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" onClick={closeAll} className="btn btn-secondary flex-1">
                  Log in
                </Link>
                <Link to="/register" onClick={closeAll} className="btn btn-primary flex-1">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}