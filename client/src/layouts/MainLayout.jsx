import { Outlet } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'

export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="container-page flex-1 py-10">
        <Outlet />
      </main>
      <footer className="border-t border-zinc-200/70 dark:border-white/5">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-8 text-xs text-zinc-500 sm:flex-row">
          <p className="font-semibold text-zinc-700 dark:text-zinc-300">Reelist</p>
          <p>This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
        </div>
      </footer>
    </div>
  )
}