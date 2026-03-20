import { useState, useRef, useEffect } from 'react'

export default function FolderTree({
  folders,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onDropConversation,
}) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [expandedFolders, setExpandedFolders] = useState({})
  const [isCreating, setIsCreating] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [renamingId, setRenamingId] = useState(null)
  const [renameValue, setRenameValue] = useState('')
  const [dragOverId, setDragOverId] = useState(null)
  const createRef = useRef(null)
  const renameRef = useRef(null)

  useEffect(() => {
    if (isCreating && createRef.current) {
      createRef.current.focus()
    }
  }, [isCreating])

  useEffect(() => {
    if (renamingId && renameRef.current) {
      renameRef.current.focus()
      renameRef.current.select()
    }
  }, [renamingId])

  const toggleFolder = (id) => {
    setExpandedFolders(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const handleCreateSubmit = () => {
    const name = newFolderName.trim()
    if (name) {
      onCreateFolder(name)
    }
    setIsCreating(false)
    setNewFolderName('')
  }

  const handleRenameSubmit = (id) => {
    const name = renameValue.trim()
    if (name) {
      onRenameFolder(id, name)
    }
    setRenamingId(null)
    setRenameValue('')
  }

  const handleDragOver = (e, folderId) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverId(folderId)
  }

  const handleDragLeave = () => {
    setDragOverId(null)
  }

  const handleDrop = (e, folderId) => {
    e.preventDefault()
    setDragOverId(null)
    const conversationId = e.dataTransfer.getData('conversationId')
    if (conversationId) {
      onDropConversation(folderId, conversationId)
    }
  }

  return (
    <div style={{ borderTop: '1px solid var(--border-color)' }}>
      {/* Section header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 flex items-center justify-between text-xs font-medium uppercase tracking-wider transition-colors duration-150"
        style={{ color: 'var(--text-secondary)' }}
        onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--sidebar-hover)' }}
        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
      >
        <span>Folders</span>
        <div className="flex items-center gap-1">
          <span
            onClick={(e) => {
              e.stopPropagation()
              setIsCreating(true)
              setIsExpanded(true)
            }}
            className="p-0.5 rounded transition-colors duration-150"
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className="transition-transform duration-200"
            style={{ transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {/* Folder list */}
      {isExpanded && (
        <div className="pb-2 space-y-0.5">
          {folders.map(folder => (
            <div
              key={folder.id}
              onDragOver={(e) => handleDragOver(e, folder.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, folder.id)}
              className="px-3 py-1.5 flex items-center gap-2 text-sm rounded-md mx-1 transition-colors duration-150 group cursor-pointer"
              style={{
                backgroundColor: dragOverId === folder.id ? 'var(--sidebar-active)' : 'transparent',
                border: dragOverId === folder.id ? '1px dashed var(--claude-orange)' : '1px solid transparent',
              }}
              onMouseEnter={e => { if (dragOverId !== folder.id) e.currentTarget.style.backgroundColor = 'var(--sidebar-hover)' }}
              onMouseLeave={e => { if (dragOverId !== folder.id) e.currentTarget.style.backgroundColor = 'transparent' }}
              onClick={() => toggleFolder(folder.id)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2">
                <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
              </svg>

              {renamingId === folder.id ? (
                <input
                  ref={renameRef}
                  type="text"
                  value={renameValue}
                  onChange={e => setRenameValue(e.target.value)}
                  onBlur={() => handleRenameSubmit(folder.id)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleRenameSubmit(folder.id)
                    if (e.key === 'Escape') setRenamingId(null)
                  }}
                  className="flex-1 bg-transparent outline-none text-sm"
                  style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--claude-orange)' }}
                  onClick={e => e.stopPropagation()}
                />
              ) : (
                <span className="flex-1 truncate" style={{ color: 'var(--text-primary)' }}>
                  {folder.name}
                </span>
              )}

              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {folder.conversation_count || 0}
              </span>

              {/* Folder actions */}
              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity duration-150">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setRenamingId(folder.id)
                    setRenameValue(folder.name)
                  }}
                  className="p-0.5 rounded"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)' }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteFolder(folder.id)
                  }}
                  className="p-0.5 rounded"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#ef4444' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)' }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M8 6V4h8v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
                  </svg>
                </button>
              </div>
            </div>
          ))}

          {/* New folder input */}
          {isCreating && (
            <div className="px-3 py-1.5 flex items-center gap-2 mx-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--claude-orange)" strokeWidth="2">
                <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
              </svg>
              <input
                ref={createRef}
                type="text"
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                onBlur={handleCreateSubmit}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleCreateSubmit()
                  if (e.key === 'Escape') { setIsCreating(false); setNewFolderName('') }
                }}
                placeholder="Folder name..."
                className="flex-1 bg-transparent outline-none text-sm"
                style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--claude-orange)' }}
              />
            </div>
          )}

          {folders.length === 0 && !isCreating && (
            <div className="px-3 py-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
              No folders yet. Drag conversations here.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
