'use client'
import { useRouter } from 'next/navigation'
import { useAuth } from '../_context/AuthContext'
import { useEffect } from 'react'

export const useProtectedRoute = () => {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  return { user, isLoading }
}