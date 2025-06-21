'use client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
  const router = useRouter()
  
  // Redirect to my-docs by default
  useEffect(() => {
    router.push('/dashboard/my-docs')
  }, [router])

  return null
}