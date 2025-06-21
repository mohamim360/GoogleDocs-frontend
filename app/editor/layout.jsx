'use client'
import { useAuth } from '../_context/AuthContext'
import { useProtectedRoute } from '../_hooks/useAuth'
import Sidebar from '../_components/Sidebar'

export default function EditorLayout({ children }) {
  const { user, logout } = useAuth()
  useProtectedRoute()

  if (!user) return null

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar user={user} logout={logout} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  )
}