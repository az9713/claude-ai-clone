import { useState, useEffect, useCallback } from 'react'
import { useArtifacts } from '../../hooks/useArtifacts.js'
import ArtifactViewer from './ArtifactViewer.jsx'
import VersionSelector from './VersionSelector.jsx'

const TYPE_BADGES = {
  code: { label: 'Code', color: '#3B82F6' },
  html: { label: 'HTML', color: '#F59E0B' },
  svg: { label: 'SVG', color: '#8B5CF6' },
  mermaid: { label: 'Diagram', color: '#10B981' },
  react: { label: 'React', color: '#06B6D4' },
  text: { label: 'Text', color: '#6B7280' },
}

export default function ArtifactsPanel({ conversationId, initialArtifact, onClose }) {
  const {
    artifacts, selectedArtifact, setSelectedArtifact,
    isFullscreen, toggleFullscreen, versions,
    loadArtifacts, loadVersions, forkArtifact,
  } = useArtifacts()

  const [activeTab, setActiveTab] = useState(0)

  // Load artifacts for conversation
  useEffect(() => {
    if (conversationId) {
      loadArtifacts(conversationId)
    }
  }, [conversationId, loadArtifacts])

  // When initialArtifact is set (from clicking in chat), select it
  useEffect(() => {
    if (initialArtifact) {
      // Try to find matching persisted artifact
      const match = artifacts.find(a =>
        a.content === initialArtifact.content && a.type === initialArtifact.type
      )
      if (match) {
        setSelectedArtifact(match)
        const idx = artifacts.indexOf(match)
        if (idx >= 0) setActiveTab(idx)
      } else {
        // Use the transient artifact from the chat click
        setSelectedArtifact(initialArtifact)
      }
    }
  }, [initialArtifact, artifacts, setSelectedArtifact])

  // Load versions when selected artifact changes
  useEffect(() => {
    if (selectedArtifact?.id) {
      loadVersions(selectedArtifact.id)
    }
  }, [selectedArtifact?.id, loadVersions])

  const current = selectedArtifact || initialArtifact
  const badge = TYPE_BADGES[current?.type] || TYPE_BADGES.text

  const handleTabClick = useCallback((artifact, index) => {
    setActiveTab(index)
    setSelectedArtifact(artifact)
  }, [setSelectedArtifact])

  const handleDownload = useCallback(() => {
    if (!current) return
    const ext = current.type === 'html' ? 'html' : current.type === 'svg' ? 'svg' : current.language || 'txt'
    const mimeType = current.type === 'html' ? 'text/html' : current.type === 'svg' ? 'image/svg+xml' : 'text/plain'
    const blob = new Blob([current.content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(current.title || 'artifact').replace(/[^a-zA-Z0-9_-]/g, '_')}.${ext}`
    a.click()
    URL.revokeObjectURL(url)
  }, [current])

  const handleVersionSelect = useCallback((version) => {
    setSelectedArtifact(version)
  }, [setSelectedArtifact])

  // Fullscreen mode
  const panelClass = isFullscreen
    ? 'fixed inset-0 z-50 flex flex-col'
    : 'w-96 flex-shrink-0 slide-in-right overflow-hidden flex flex-col h-full'

  return (
    <div className={panelClass}
      style={{
        borderLeft: isFullscreen ? 'none' : '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-secondary)',
      }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border-color)' }}>
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide"
            style={{ backgroundColor: badge.color + '20', color: badge.color }}>
            {badge.label}
          </span>
          <span className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
            {current?.title || 'Artifact'}
          </span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={toggleFullscreen}
            className="p-1.5 rounded transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
            {isFullscreen ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/>
              </svg>
            )}
          </button>
          <button onClick={onClose}
            className="p-1.5 rounded transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            title="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Tabs for multiple artifacts */}
      {artifacts.length > 1 && (
        <div className="flex overflow-x-auto flex-shrink-0 px-2 pt-2 gap-1"
          style={{ borderBottom: '1px solid var(--border-color)' }}>
          {artifacts.map((art, i) => (
            <button key={art.id || i}
              onClick={() => handleTabClick(art, i)}
              className="px-3 py-1.5 text-xs rounded-t whitespace-nowrap transition-colors"
              style={{
                backgroundColor: activeTab === i ? 'var(--bg-primary)' : 'transparent',
                color: activeTab === i ? 'var(--text-primary)' : 'var(--text-secondary)',
                borderBottom: activeTab === i ? '2px solid var(--claude-orange)' : '2px solid transparent',
              }}>
              {art.title || `Artifact ${i + 1}`}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <ArtifactViewer artifact={current} />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-3 py-2 flex-shrink-0"
        style={{ borderTop: '1px solid var(--border-color)' }}>
        <div className="flex items-center gap-2">
          <VersionSelector
            versions={versions}
            currentVersion={selectedArtifact}
            onSelectVersion={handleVersionSelect}
          />
        </div>
        <div className="flex items-center gap-1">
          <button onClick={handleDownload}
            className="px-2 py-1 text-xs rounded transition-colors flex items-center gap-1"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            title="Download">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
            </svg>
            <span>Download</span>
          </button>
          {selectedArtifact?.id && (
            <button onClick={() => forkArtifact(selectedArtifact.id)}
              className="px-2 py-1 text-xs rounded transition-colors flex items-center gap-1"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              title="Fork / New version">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/>
                <path d="M18 9v1a2 2 0 01-2 2H8a2 2 0 01-2-2V9M12 12v3"/>
              </svg>
              <span>Fork</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
