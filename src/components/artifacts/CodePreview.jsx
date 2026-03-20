import { useState, useMemo } from 'react'
import hljs from 'highlight.js'

export default function CodePreview({ content, language }) {
  const [copied, setCopied] = useState(false)

  const highlighted = useMemo(() => {
    try {
      if (language && hljs.getLanguage(language)) {
        return hljs.highlight(content, { language }).value
      }
      return hljs.highlightAuto(content).value
    } catch {
      return content.replace(/</g, '&lt;').replace(/>/g, '&gt;')
    }
  }, [content, language])

  const lines = content.split('\n')

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="h-full flex flex-col overflow-hidden rounded-lg" style={{ backgroundColor: 'var(--code-bg)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 text-xs flex-shrink-0"
        style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#9CA3AF' }}>
        <span>{language || 'code'}</span>
        <button onClick={handleCopy}
          className="hover:text-white transition-colors flex items-center gap-1" title="Copy code">
          {copied ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
              <span style={{ color: '#22C55E' }}>Copied</span>
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      {/* Code with line numbers */}
      <div className="flex-1 overflow-auto">
        <pre className="p-4 text-sm leading-relaxed">
          <code className="font-mono" style={{ color: '#E5E5E5' }}>
            <table className="border-collapse w-full">
              <tbody>
                {lines.map((line, i) => (
                  <tr key={i}>
                    <td className="text-right pr-4 select-none align-top" style={{ color: '#6B7280', minWidth: '2.5rem' }}>
                      {i + 1}
                    </td>
                    <td className="whitespace-pre-wrap break-all">
                      <span dangerouslySetInnerHTML={{ __html: (() => {
                        try {
                          if (language && hljs.getLanguage(language)) {
                            return hljs.highlight(line, { language, ignoreIllegals: true }).value
                          }
                          return line.replace(/</g, '&lt;').replace(/>/g, '&gt;')
                        } catch {
                          return line.replace(/</g, '&lt;').replace(/>/g, '&gt;')
                        }
                      })() }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </code>
        </pre>
      </div>
    </div>
  )
}
