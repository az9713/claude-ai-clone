import { useState, useRef, useEffect } from 'react'

export default function HtmlPreview({ content }) {
  const [mode, setMode] = useState('preview') // 'preview' | 'code'
  const iframeRef = useRef(null)

  useEffect(() => {
    if (mode === 'preview' && iframeRef.current) {
      const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document
      doc.open()
      doc.write(content)
      doc.close()
    }
  }, [content, mode])

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Toggle bar */}
      <div className="flex items-center gap-1 px-3 py-2 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border-color)' }}>
        <button
          onClick={() => setMode('preview')}
          className="px-3 py-1 text-xs rounded-md font-medium transition-colors"
          style={{
            backgroundColor: mode === 'preview' ? 'var(--claude-orange)' : 'transparent',
            color: mode === 'preview' ? 'white' : 'var(--text-secondary)',
          }}>
          Preview
        </button>
        <button
          onClick={() => setMode('code')}
          className="px-3 py-1 text-xs rounded-md font-medium transition-colors"
          style={{
            backgroundColor: mode === 'code' ? 'var(--claude-orange)' : 'transparent',
            color: mode === 'code' ? 'white' : 'var(--text-secondary)',
          }}>
          Code
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {mode === 'preview' ? (
          <iframe
            ref={iframeRef}
            title="HTML Preview"
            sandbox="allow-scripts allow-same-origin"
            className="w-full h-full border-0"
            style={{ backgroundColor: 'white', minHeight: '300px' }}
          />
        ) : (
          <pre className="p-4 text-sm overflow-auto h-full" style={{ backgroundColor: 'var(--code-bg)', color: '#E5E5E5' }}>
            <code className="font-mono whitespace-pre-wrap">{content}</code>
          </pre>
        )}
      </div>
    </div>
  )
}
