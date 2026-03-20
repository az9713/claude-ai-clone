import { useState, useEffect, useRef } from 'react'

export default function SearchBar({ searchQuery, onSearchChange, onSearchDeep }) {
  const [localQuery, setLocalQuery] = useState(searchQuery)
  const debounceRef = useRef(null)

  useEffect(() => {
    setLocalQuery(searchQuery)
  }, [searchQuery])

  const handleChange = (e) => {
    const value = e.target.value
    setLocalQuery(value)
    onSearchChange(value)

    // Debounced deep search
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      onSearchDeep(value)
    }, 300)
  }

  const handleClear = () => {
    setLocalQuery('')
    onSearchChange('')
    onSearchDeep('')
    if (debounceRef.current) clearTimeout(debounceRef.current)
  }

  return (
    <div className="relative">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
        width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
      <input
        type="text"
        value={localQuery}
        onChange={handleChange}
        placeholder="Search conversations..."
        className="w-full pl-9 pr-8 py-2 rounded-lg text-sm outline-none transition-colors duration-150"
        style={{
          backgroundColor: 'var(--sidebar-hover)',
          color: 'var(--text-primary)',
          border: '1px solid transparent',
        }}
        onFocus={e => { e.target.style.borderColor = 'var(--claude-orange)' }}
        onBlur={e => { e.target.style.borderColor = 'transparent' }}
      />
      {localQuery && (
        <button
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded transition-colors duration-150"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
