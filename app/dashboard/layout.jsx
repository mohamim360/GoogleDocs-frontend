'use client'
import { useAuth } from '../_context/AuthContext'
import { useProtectedRoute } from '../_hooks/useAuth'
import Sidebar from '../_components/Sidebar'

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth()
  useProtectedRoute()

  if (!user) return null

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar user={user} logout={logout} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm">
          <div className="px-4 py-4 sm:px-6 lg:px-8">
            <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}