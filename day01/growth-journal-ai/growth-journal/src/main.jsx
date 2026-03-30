import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Home from './pages/Home'
import Profile from './pages/Profile'
import './index.css'
import Trackers from './pages/Trackers'
import PastEntries from './pages/PastEntries'

// Inside <Routes>:
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm animate-pulse">
      Loading...
    </div>
  )
  return user ? children : <Navigate to="/" replace />
}

function AppRoutes() {
  const { user, loading } = useAuth()
  if (loading) return null
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/profile" replace /> : <Login />} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/journal" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/trackers" element={<ProtectedRoute><Trackers /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><PastEntries /></ProtectedRoute>} />
    </Routes>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)