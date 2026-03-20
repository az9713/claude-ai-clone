import { useState } from 'react'

export default function SvgPreview({ content }) {
  const [zoom, setZoom] = useState(1)
  const [darkBg, setDarkBg] = useState(false)

  const zoomIn = () => setZoom(z => Math.min(z + 0.25, 3))
  const zoomOut = () => setZoom(z => Math.max(z - 0.25, 0.25))
  const resetZoom = () => setZoom(1)

  const gridBg = darkBg
    ? 'linear-gradient(45deg, #333 25%, transparent 25%), linear-gradient(-45deg, #333 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #333 75%), linear-gradient(-45deg, transparent 75%, #333 75%)'
    : 'linear-gradient(45deg, #e0e0e0 25%, transparent 25%), linear-gradient(-45deg, #e0e0e0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e0e0e0 75%), linear-gradient(-45deg, transparent 75%, #e0e0e0 75%)'

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Controls */}
      <div className="flex items-center gap-2 px-3 py-2 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border-color)' }}>
        <button onClick={zoomOut} className="px-2 py-1 text-xs rounded font-medium transition-colors"
          style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>
          -
        </button>
        <span className="text-xs" style={{ color: 'var(--text-secondary)', minWidth: '3rem', textAlign: 'center' }}>
          {Math.round(zoom * 100)}%
        </span>
        <button onClick={zoomIn} className="px-2 py-1 text-xs rounded font-medium transition-colors"
          style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>
          +
        </button>
        <button onClick={resetZoom} className="px-2 py-1 text-xs rounded font-medium transition-colors"
          style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>
          Reset
        </button>
        <div className="flex-1" />
        <button onClick={() => setDarkBg(d => !d)} className="px-2 py-1 text-xs rounded font-medium transition-colors"
          style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>
          {darkBg ? 'Light BG' : 'Dark BG'}
        </button>
      </div>

      {/* SVG display */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-4"
        style={{
          backgroundColor: darkBg ? '#1a1a1a' : '#f5f5f5',
          backgroundImage: gridBg,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
        }}>
        <div style={{ transform: `scale(${zoom})`, transformOrigin: 'center', transition: 'transform 0.2s' }}
          dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </div>
  )
}
