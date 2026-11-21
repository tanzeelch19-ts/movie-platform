import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import MainLayout from './layouts/MainLayout'
import ProtectedRoute from './components/common/ProtectedRoute'
import NotFound from './pages/NotFound'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomePage from './pages/HomePage'
import ExplorePage from './pages/ExplorePage'
import LibraryPage from './pages/LibraryPage'
import MovieDetailsPage from './pages/MovieDetailsPage'
import WatchlistPage from './pages/WatchlistPage'
import WatchedPage from './pages/WatchedPage'
import MyReviewsPage from './pages/MyReviewsPage'
import RecommendationsPage from './pages/RecommendationsPage'
import CollectionsPage from './pages/CollectionsPage'
import CollectionDetailPage from './pages/CollectionDetailPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import AdminPage from './pages/AdminPage'

// Guests see the landing page. Signed-in users go straight to their feed.
function Root() {
  const { user, loading } = useAuth()
  if (loading) return <div className="skeleton h-96" />
  return user ? <Navigate to="/home" replace /> : <LandingPage />
}

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Root />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/movies/:id" element={<MovieDetailsPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/watchlist" element={<WatchlistPage />} />
          <Route path="/watched" element={<WatchedPage />} />
          <Route path="/reviews" element={<MyReviewsPage />} />
          <Route path="/recommendations" element={<RecommendationsPage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/collections/:id" element={<CollectionDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}