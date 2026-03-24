import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { AuthPage } from './pages/AuthPage'
import { HomePage } from './pages/HomePage'
import { AddMoviePage } from './pages/AddMoviePage'
import { MovieDetailPage } from './pages/MovieDetailPage'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-gray-500 text-sm">Loading…</div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-gray-500 text-sm">Loading…</div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <AuthPage />}
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add"
          element={
            <ProtectedRoute>
              <AddMoviePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/movie/:id"
          element={
            <ProtectedRoute>
              <MovieDetailPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
