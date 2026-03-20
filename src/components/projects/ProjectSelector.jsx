import { useState, useEffect, useRef } from 'react'
import { useProjects } from '../../contexts/ProjectContext.jsx'

export default function ProjectSelector({ onNewProject }) {
  const { projects, activeProject, selectProject, loadProjects } = useProjects()
  const [open, setOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (!loaded) {
      loadProjects().then(() => setLoaded(true))
    }
  }, [loaded, loadProjects])

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2.5 py-1 rounded-lg text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
        style={{ color: 'var(--text-primary)' }}
      >
        {activeProject ? (
          <>
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: activeProject.color || '#CC785C' }}
            />
            <span className="truncate max-w-[120px]">{activeProject.name}</span>
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
            </svg>
            <span>All Projects</span>
          </>
        )}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-1 w-56 rounded-xl shadow-lg border z-50 py-1 overflow-hidden"
          style={{
            backgroundColor: 'var(--bg-primary)',
            borderColor: 'var(--border-color)',
          }}
        >
          {/* All Projects option */}
          <button
            onClick={() => { selectProject(null); setOpen(false) }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            style={{
              color: 'var(--text-primary)',
              backgroundColor: !activeProject ? 'var(--bg-secondary)' : 'transparent',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
            </svg>
            All Projects
          </button>

          {projects.length > 0 && (
            <div className="border-t my-1" style={{ borderColor: 'var(--border-color)' }} />
          )}

          {/* Project list */}
          <div className="max-h-60 overflow-y-auto">
            {projects.map(project => (
              <button
                key={project.id}
                onClick={() => { selectProject(project); setOpen(false) }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                style={{
                  color: 'var(--text-primary)',
                  backgroundColor: activeProject?.id === project.id ? 'var(--bg-secondary)' : 'transparent',
                }}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: project.color || '#CC785C' }}
                />
                <span className="truncate">{project.name}</span>
              </button>
            ))}
          </div>

          <div className="border-t my-1" style={{ borderColor: 'var(--border-color)' }} />

          {/* New Project */}
          <button
            onClick={() => { onNewProject?.(); setOpen(false) }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            style={{ color: 'var(--claude-orange)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Project
          </button>
        </div>
      )}
    </div>
  )
}
