import { useState, useEffect, useRef, useCallback } from 'react'

let mermaidLoaded = false
let mermaidLoadPromise = null

function loadMermaid() {
  if (mermaidLoaded) return Promise.resolve()
  if (mermaidLoadPromise) return mermaidLoadPromise

  mermaidLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js'
    script.onload = () => {
      window.mermaid.initialize({ startOnLoad: false, theme: 'default' })
      mermaidLoaded = true
      resolve()
    }
    script.onerror = () => reject(new Error('Failed to load mermaid.js'))
    document.head.appendChild(script)
  })
  return mermaidLoadPromise
}

export default function MermaidPreview({ content }) {
  const [svg, setSvg] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const containerRef = useRef(null)
  const idRef = useRef(`mermaid-${Date.now()}-${Math.random().toString(36).slice(2)}`)

  const renderDiagram = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      await loadMermaid()
      const { svg: rendered } = await window.mermaid.render(idRef.current, content)
      setSvg(rendered)
    } catch (err) {
      setError(err.message || 'Failed to render diagram')
    } finally {
      setLoading(false)
    }
  }, [content])

  useEffect(() => {
    renderDiagram()
  }, [renderDiagram])

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center" style={{ color: 'var(--text-secondary)' }}>
        <span className="text-sm">Loading diagram...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex flex-col overflow-hidden">
        <div className="px-3 py-2 text-xs font-medium flex-shrink-0"
          style={{ color: '#EF4444', borderBottom: '1px solid var(--border-color)' }}>
          Diagram render error -- showing source code
        </div>
        <pre className="flex-1 p-4 text-sm overflow-auto" style={{ backgroundColor: 'var(--code-bg)', color: '#E5E5E5' }}>
          <code className="font-mono whitespace-pre-wrap">{content}</code>
        </pre>
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto flex items-center justify-center p-4"
      style={{ backgroundColor: 'white' }}>
      <div ref={containerRef} dangerouslySetInnerHTML={{ __html: svg }} />
    </div>
  )
}
