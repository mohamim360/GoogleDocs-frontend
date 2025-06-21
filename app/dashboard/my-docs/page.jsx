'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '../../_context/AuthContext'
import  api  from '../../_lib/api'
import DocumentList from '../../_components/DocumentList'
import Link from 'next/link'

export default function MyDocumentsPage() {
  const { user } = useAuth()
  const [documents, setDocuments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await api.get('/documents')
      setDocuments(response.data.data.ownedDocuments)

      } catch (err) {
        setError('Failed to fetch documents')
      } finally {
        setIsLoading(false)
      }
    }

    if (user) fetchDocuments()
  }, [user])

  const handleDelete = async (id) => {
    try {
      await api.delete(`/documents/${id}`)
      setDocuments(documents.filter(doc => doc._id !== id))
    } catch (err) {
      setError('Failed to delete document')
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Documents</h2>
        <Link
          href="/editor/new"
          className="px-4 py-2 bg-primary-500 
					 rounded-md hover:bg-primary-600"
        >
          New Document
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="text-red-700 text-sm">{error}</div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <DocumentList 
          documents={documents} 
          onDelete={handleDelete} 
          showOwner={false}
        />
      )}
    </div>
  )
}