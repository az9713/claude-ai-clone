import { useState, useEffect, useMemo, useCallback } from 'react'
import { useConversation } from '../contexts/ConversationContext.jsx'
import { api } from '../utils/api.js'

function groupByDate(conversations) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const last7 = new Date(today)
  last7.setDate(last7.getDate() - 7)
  const last30 = new Date(today)
  last30.setDate(last30.getDate() - 30)

  const groups = {
    pinned: [],
    today: [],
    yesterday: [],
    last7days: [],
    last30days: [],
    older: [],
  }

  for (const conv of conversations) {
    if (conv.is_pinned) {
      groups.pinned.push(conv)
      continue
    }
    const date = new Date(conv.updated_at || conv.created_at)
    if (date >= today) {
      groups.today.push(conv)
    } else if (date >= yesterday) {
      groups.yesterday.push(conv)
    } else if (date >= last7) {
      groups.last7days.push(conv)
    } else if (date >= last30) {
      groups.last30days.push(conv)
    } else {
      groups.older.push(conv)
    }
  }

  return groups
}

export function useConversations() {
  const context = useConversation()
  const {
    conversations,
    activeConversation,
    selectConversation,
    createConversation,
    deleteConversation,
    updateConversation,
    loadConversations,
  } = context

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [folders, setFolders] = useState([])
  const [foldersLoaded, setFoldersLoaded] = useState(false)

  // Load folders
  const loadFolders = useCallback(async () => {
    try {
      const data = await api.get('/folders')
      setFolders(data.data || [])
      setFoldersLoaded(true)
    } catch (err) {
      console.error('Failed to load folders:', err)
    }
  }, [])

  useEffect(() => {
    if (!foldersLoaded) loadFolders()
  }, [foldersLoaded, loadFolders])

  // Deep search via API (debounced externally)
  const searchDeep = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults(null)
      return
    }
    try {
      const data = await api.get(`/search/conversations?q=${encodeURIComponent(query)}`)
      setSearchResults(data.data || [])
    } catch (err) {
      console.error('Search failed:', err)
      setSearchResults(null)
    }
  }, [])

  // Local filtering for instant results
  const filteredConversations = useMemo(() => {
    const source = searchResults !== null ? searchResults : conversations
    if (!searchQuery.trim()) return conversations
    const q = searchQuery.toLowerCase()
    return source.filter(c =>
      (c.title || '').toLowerCase().includes(q)
    )
  }, [conversations, searchQuery, searchResults])

  // Group by date
  const grouped = useMemo(() => groupByDate(filteredConversations), [filteredConversations])

  // Folder operations
  const createFolder = useCallback(async (name) => {
    try {
      const data = await api.post('/folders', { name })
      setFolders(prev => [...prev, data.data])
      return data.data
    } catch (err) {
      console.error('Failed to create folder:', err)
      return null
    }
  }, [])

  const renameFolder = useCallback(async (id, name) => {
    try {
      const data = await api.put(`/folders/${id}`, { name })
      setFolders(prev => prev.map(f => f.id === id ? data.data : f))
    } catch (err) {
      console.error('Failed to rename folder:', err)
    }
  }, [])

  const deleteFolder = useCallback(async (id) => {
    try {
      await api.delete(`/folders/${id}`)
      setFolders(prev => prev.filter(f => f.id !== id))
    } catch (err) {
      console.error('Failed to delete folder:', err)
    }
  }, [])

  const addToFolder = useCallback(async (folderId, conversationId) => {
    try {
      await api.post(`/folders/${folderId}/items`, { conversationId })
      await loadFolders()
    } catch (err) {
      console.error('Failed to add to folder:', err)
    }
  }, [loadFolders])

  const removeFromFolder = useCallback(async (folderId, conversationId) => {
    try {
      await api.delete(`/folders/${folderId}/items/${conversationId}`)
      await loadFolders()
    } catch (err) {
      console.error('Failed to remove from folder:', err)
    }
  }, [loadFolders])

  return {
    ...context,
    searchQuery,
    setSearchQuery,
    searchDeep,
    searchResults,
    filteredConversations,
    grouped,
    folders,
    createFolder,
    renameFolder,
    deleteFolder,
    addToFolder,
    removeFromFolder,
    loadFolders,
  }
}
