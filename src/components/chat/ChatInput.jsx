import { useState, useRef, useEffect } from 'react'
import { useConversation } from '../../contexts/ConversationContext.jsx'

export default function ChatInput({ onOpenPromptLibrary }) {
  const [input, setInput] = useState('')
  const { sendMessage, isStreaming, stopGeneration } = useConversation()
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)
  const [images, setImages] = useState([])
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [advancedParams, setAdvancedParams] = useState({
    temperature: 1.0,
    maxTokens: 4096,
    topP: 1.0,
  })

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  const handleSubmit = () => {
    const trimmed = input.trim()
    if (!trimmed || isStreaming) return
    setInput('')
    sendMessage(trimmed, images)
    setImages([])
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || [])
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (ev) => {
          setImages(prev => [...prev, ev.target.result])
        }
        reader.readAsDataURL(file)
      }
    })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleInput = (e) => {
    setInput(e.target.value)
    // Auto-resize
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 200) + 'px'
  }

  return (
    <div className="px-4 pb-4 pt-2">
      <div className="max-w-3xl mx-auto">
        <div className="relative rounded-2xl border transition-colors"
          style={{
            borderColor: 'var(--border-color)',
            backgroundColor: 'var(--bg-secondary)',
          }}>
          {/* Image previews + advanced params */}
          <div id="chat-input-extensions-top" className="empty:hidden">
            {images.length > 0 && (
              <div className="flex gap-2 px-4 pt-3 flex-wrap">
                {images.map((img, i) => (
                  <div key={i} className="relative group">
                    <img src={img} alt="Upload" className="h-16 w-16 object-cover rounded-lg border" style={{ borderColor: 'var(--border-color)' }} />
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            )}
            {showAdvanced && (
              <div className="px-4 pt-3 pb-1 flex gap-4 flex-wrap text-xs" style={{ color: 'var(--text-secondary)' }}>
                <div className="flex items-center gap-2">
                  <label>Temp: {advancedParams.temperature.toFixed(1)}</label>
                  <input type="range" min="0" max="2" step="0.1"
                    value={advancedParams.temperature}
                    onChange={e => setAdvancedParams(p => ({ ...p, temperature: parseFloat(e.target.value) }))}
                    className="w-20 accent-orange-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label>Max tokens:</label>
                  <input type="number" min="1" max="200000" step="256"
                    value={advancedParams.maxTokens}
                    onChange={e => setAdvancedParams(p => ({ ...p, maxTokens: parseInt(e.target.value) || 4096 }))}
                    className="w-20 px-1 py-0.5 rounded border text-xs"
                    style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label>Top-P: {advancedParams.topP.toFixed(1)}</label>
                  <input type="range" min="0" max="1" step="0.05"
                    value={advancedParams.topP}
                    onChange={e => setAdvancedParams(p => ({ ...p, topP: parseFloat(e.target.value) }))}
                    className="w-20 accent-orange-500"
                  />
                </div>
              </div>
            )}
          </div>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Message Claude..."
            rows={1}
            className="w-full resize-none bg-transparent px-4 py-3 pr-12 text-base outline-none placeholder:text-gray-400"
            style={{ color: 'var(--text-primary)', maxHeight: '200px' }}
            disabled={isStreaming}
            aria-label="Message input"
          />

          {/* Send / Stop button */}
          <div className="absolute right-2 bottom-2 flex items-center gap-2">
            {/* Character count */}
            {input.length > 0 && (
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                {input.length}
              </span>
            )}

            {isStreaming ? (
              <button onClick={stopGeneration}
                className="p-2 rounded-lg transition-colors text-white"
                style={{ backgroundColor: '#EF4444' }}
                title="Stop generation">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              </button>
            ) : (
              <button onClick={handleSubmit}
                disabled={!input.trim()}
                className="p-2 rounded-lg transition-all disabled:opacity-30"
                style={{
                  backgroundColor: input.trim() ? 'var(--claude-orange)' : 'transparent',
                  color: input.trim() ? 'white' : 'var(--text-tertiary)',
                }}
                title="Send message (Enter)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </button>
            )}
          </div>

          {/* Attachment buttons */}
          <div id="chat-input-extensions-bottom" className="flex items-center gap-1 px-3 pb-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              title="Upload image"
              style={{ color: 'var(--text-secondary)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
              </svg>
            </button>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="p-1.5 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              title="Advanced parameters"
              style={{ color: showAdvanced ? 'var(--claude-orange)' : 'var(--text-secondary)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>
              </svg>
            </button>
            <button
              onClick={() => onOpenPromptLibrary?.()}
              className="p-1.5 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              title="Prompt Library"
              style={{ color: 'var(--text-secondary)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
              </svg>
            </button>
          </div>
        </div>

        <p className="text-center text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>
          Claude can make mistakes. Please double-check responses.
        </p>
      </div>
    </div>
  )
}
