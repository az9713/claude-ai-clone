import { useState, useCallback } from 'react'

const API = 'http://localhost:3001/api/artifacts'

export function useArtifacts() {
  const [artifacts, setArtifacts] = useState([])
  const [selectedArtifact, setSelectedArtifact] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [versions, setVersions] = useState([])
  const [loading, setLoading] = useState(false)

  const loadArtifacts = useCallback(async (conversationId) => {
    if (!conversationId) return
    setLoading(true)
    try {
      const res = await fetch(`${API}?conversation_id=${conversationId}`)
      const json = await res.json()
      if (json.success) {
        setArtifacts(json.data)
      }
    } catch (err) {
      console.error('Failed to load artifacts:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const saveArtifact = useCallback(async (artifact) => {
    try {
      if (artifact.id) {
        // Update existing
        const res = await fetch(`${API}/${artifact.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(artifact),
        })
        const json = await res.json()
        if (json.success) {
          setArtifacts(prev => prev.map(a => a.id === json.data.id ? json.data : a))
          if (selectedArtifact?.id === json.data.id) {
            setSelectedArtifact(json.data)
          }
          return json.data
        }
      }
    } catch (err) {
      console.error('Failed to save artifact:', err)
    }
    return null
  }, [selectedArtifact])

  const forkArtifact = useCallback(async (id, newContent) => {
    try {
      const res = await fetch(`${API}/${id}/fork`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent }),
      })
      const json = await res.json()
      if (json.success) {
        setArtifacts(prev => [...prev, json.data])
        setSelectedArtifact(json.data)
        return json.data
      }
    } catch (err) {
      console.error('Failed to fork artifact:', err)
    }
    return null
  }, [])

  const loadVersions = useCallback(async (id) => {
    try {
      const res = await fetch(`${API}/${id}/versions`)
      const json = await res.json()
      if (json.success) {
        setVersions(json.data)
        return json.data
      }
    } catch (err) {
      console.error('Failed to load versions:', err)
    }
    return []
  }, [])

  const deleteArtifact = useCallback(async (id) => {
    try {
      const res = await fetch(`${API}/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) {
        setArtifacts(prev => prev.filter(a => a.id !== id))
        if (selectedArtifact?.id === id) {
          setSelectedArtifact(null)
        }
      }
    } catch (err) {
      console.error('Failed to delete artifact:', err)
    }
  }, [selectedArtifact])

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev)
  }, [])

  return {
    artifacts,
    selectedArtifact,
    setSelectedArtifact,
    isFullscreen,
    toggleFullscreen,
    versions,
    loading,
    loadArtifacts,
    saveArtifact,
    forkArtifact,
    loadVersions,
    deleteArtifact,
  }
}
