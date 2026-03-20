import { useState } from 'react'
import hljs from 'highlight.js'

export default function CodeBlock({ code, language, onArtifactOpen }) {
  const [copied, setCopied] = useState(false)

  let highlighted
  try {
    highlighted = language && hljs.getLanguage(language)
      ? hljs.highlight(code, { language }).value
      : hljs.highlightAuto(code).value
  } catch {
    highlighted = code.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="my-3 rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--code-bg)' }}>
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 text-xs"
        style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#9CA3AF' }}>
        <span>{language || 'code'}</span>
        <div className="flex gap-2">
          {onArtifactOpen && (
            <button onClick={() => onArtifactOpen({ type: 'code', language, content: code, title: `${language || 'Code'} snippet` })}
              className="hover:text-white transition-colors" title="Open as artifact">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
              </svg>
            </button>
          )}
          <button onClick={handleCopy}
            className="hover:text-white transition-colors" title="Copy code">
            {copied ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
              </svg>
            )}
          </button>
        </div>
      </div>
      {/* Code content */}
      <pre className="p-4 overflow-x-auto text-sm leading-relaxed">
        <code className="font-mono" style={{ color: '#E5E5E5' }}
          dangerouslySetInnerHTML={{ __html: highlighted }} />
      </pre>
    </div>
  )
}
