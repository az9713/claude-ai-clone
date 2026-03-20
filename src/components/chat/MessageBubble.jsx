import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import CodeBlock from './CodeBlock.jsx'

export default function MessageBubble({ message, onArtifactOpen }) {
  const isUser = message.role === 'user'
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content || '')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <div className={`message-enter flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] ${isUser ? 'order-1' : ''}`}>
        {/* Role label */}
        <div className={`text-xs font-medium mb-1 ${isUser ? 'text-right' : ''}`}
          style={{ color: isUser ? 'var(--text-secondary)' : 'var(--claude-orange)' }}>
          {isUser ? 'You' : 'Claude'}
        </div>

        {/* Message content */}
        <div className={`rounded-2xl px-4 py-3 ${isUser ? 'rounded-br-md' : 'rounded-bl-md'}`}
          style={{
            backgroundColor: isUser ? 'var(--message-user-bg)' : 'var(--message-assistant-bg)',
            border: isUser ? 'none' : 'none',
          }}>
          {/* Image attachments */}
          {(() => {
            const images = Array.isArray(message.images) ? message.images : (() => { try { return JSON.parse(message.images || '[]') } catch { return [] } })()
            if (!images.length) return null
            return (
              <div className="flex gap-2 mb-2 flex-wrap">
                {images.map((img, i) => (
                  <img key={i} src={img} alt="Attachment" className="max-h-48 rounded-lg" />
                ))}
              </div>
            )
          })()}

          {/* Markdown content */}
          <div className="markdown-content text-base leading-relaxed">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '')
                  const language = match ? match[1] : ''
                  const codeString = String(children).replace(/\n$/, '')

                  if (!inline && (language || codeString.includes('\n'))) {
                    return (
                      <CodeBlock
                        code={codeString}
                        language={language}
                        onArtifactOpen={onArtifactOpen}
                      />
                    )
                  }
                  return <code className={className} {...props}>{children}</code>
                },
              }}>
              {message.content || ''}
            </ReactMarkdown>
          </div>

          {/* Message action buttons */}
          <div id={`message-actions-${message.id}`} className="mt-2 flex gap-1 empty:hidden">
            {/* Copy button */}
            <button
              onClick={handleCopy}
              className="p-1 rounded transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
              title={copied ? 'Copied!' : 'Copy message'}
              style={{ color: 'var(--text-secondary)' }}
            >
              {copied ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                </svg>
              )}
            </button>
            {/* Edit button (user messages) */}
            {isUser && (
              <button
                className="p-1 rounded transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
                title="Edit message"
                style={{ color: 'var(--text-secondary)' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
            )}
            {/* Regenerate button (assistant messages) */}
            {!isUser && (
              <button
                className="p-1 rounded transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
                title="Regenerate response"
                style={{ color: 'var(--text-secondary)' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
