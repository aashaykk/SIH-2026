/**
 * App — root router
 *
 * Routes:
 *   /           → redirect to /dashboard
 *   /login      → Login page
 *   /dashboard  → Main Civic Command Center (protected)
 *   /analytics  → Predictive hotspots (protected)
 *   *           → 404
 */
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Dashboard } from './pages/Dashboard'
import { Analytics } from './pages/Analytics'
import { Login } from './pages/Login'

/** Simple auth guard — checks for JWT in localStorage */
function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('nagarx_token')
  const location = useLocation()
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={
        <RequireAuth><Dashboard /></RequireAuth>
      } />
      <Route path="/analytics" element={
        <RequireAuth><Analytics /></RequireAuth>
      } />
      <Route path="*" element={
        <div className="min-h-screen flex items-center justify-center text-slate-400">
          <div className="text-center">
            <p className="text-6xl mb-4">404</p>
            <p>Page not found</p>
            <a href="/dashboard" className="text-primary text-sm mt-2 block">← Back to dashboard</a>
          </div>
        </div>
      } />
    </Routes>
  )
}
