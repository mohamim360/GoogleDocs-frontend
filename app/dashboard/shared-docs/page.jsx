'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '../../_context/AuthContext'
import api from '../../_lib/api'
import DocumentList from '../../_components/DocumentList'

export default function SharedDocumentsPage() {
  const { user } = useAuth()
  const [sharedDocs, setSharedDocs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchSharedDocuments = async () => {
      try {
        const response = await api.get('/documents')
        console.log('API Response:', response.data) // Debug log
        
        // Handle the shared documents data structure
        const docs = response.data.data?.sharedDocuments || []
        setSharedDocs(docs)
      } catch (err) {
        console.error('Fetch error:', err)
        setError('Failed to fetch shared documents')
      } finally {
        setIsLoading(false)
      }
    }

    if (user) fetchSharedDocuments()
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
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Shared Documents</h2>

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
          documents={sharedDocs.map(sd => sd.document).filter(Boolean)} 
          showOwner={true}
					   onDelete={handleDelete}
          sharedInfo={sharedDocs}
					 isSharedPage={true}  // Pass the full shared info if needed
        />
      )}
    </div>
  )
}