'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { useSocket } from '../_context/SocketContext'
import { useAuth } from '../_context/AuthContext'
import { api } from '../_lib/api'
import PresenceIndicator from './PresenceIndicator'

const Editor = ({ documentId }) => {
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('Untitled Document')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeUsers, setActiveUsers] = useState([])
  const quillRef = useRef(null)
  const socket = useSocket()
  const { user } = useAuth()

  // Fetch document data
  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await api.get(`/documents/${documentId}`)
        setContent(response.data.document.content)
        setTitle(response.data.document.title)
      } catch (err) {
        setError('Failed to load document')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDocument()
  }, [documentId])

  // Socket.io setup
  useEffect(() => {
    if (!socket || !user) return

    const handleTextUpdate = ({ userId, content: newContent }) => {
      if (userId !== user.id) {
        setContent(newContent)
      }
    }

    const handleUserJoined = (userId) => {
      setActiveUsers(prev => [...prev, userId])
    }

    const handleUserPresenceUpdate = ({ userId, isActive }) => {
      setActiveUsers(prev => 
        isActive 
          ? [...prev.filter(id => id !== userId), userId]
          : prev.filter(id => id !== userId)
      )
    }

    socket.emit('join-document', { documentId, userId: user.id })
    socket.on('text-update', handleTextUpdate)
    socket.on('user-joined', handleUserJoined)
    socket.on('user-presence-update', handleUserPresenceUpdate)

    // Send presence updates periodically
    const presenceInterval = setInterval(() => {
      socket.emit('user-presence', { documentId, userId: user.id, isActive: true })
    }, 5000)

    return () => {
      socket.off('text-update', handleTextUpdate)
      socket.off('user-joined', handleUserJoined)
      socket.off('user-presence-update', handleUserPresenceUpdate)
      clearInterval(presenceInterval)
      socket.emit('user-presence', { documentId, userId: user.id, isActive: false })
    }
  }, [socket, documentId, user])

  // Handle content changes
  const handleChange = useCallback((newContent, delta, source) => {
    if (source === 'user') {
      setContent(newContent)
      // Send update to server and broadcast to other clients
      api.patch(`/documents/${documentId}`, { content: newContent })
      socket?.emit('text-change', { documentId, userId: user.id, content: newContent })
    }
  }, [documentId, socket, user?.id])

  // Handle title changes
  const handleTitleChange = async (e) => {
    const newTitle = e.target.value
    setTitle(newTitle)
    await api.patch(`/documents/${documentId}`, { title: newTitle })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <div className="text-red-700 text-sm">{error}</div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          className="text-2xl font-bold border-none focus:outline-none focus:ring-2 focus:ring-primary-500 rounded px-2 py-1 w-full"
        />
        <PresenceIndicator activeUsers={activeUsers} currentUserId={user.id} />
      </div>

      <ReactQuill
        ref={quillRef}
        value={content}
        onChange={handleChange}
        modules={{
          toolbar: [
            [{ header: [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
            ['link', 'image'],
            ['clean'],
          ],
        }}
        theme="snow"
      />
    </div>
  )
}

export default Editor