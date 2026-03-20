export default function TypingIndicator() {
  return (
    <div className="flex justify-start message-enter">
      <div>
        <div className="text-xs font-medium mb-1" style={{ color: 'var(--claude-orange)' }}>
          Claude
        </div>
        <div className="flex items-center gap-1 px-4 py-3 rounded-2xl rounded-bl-md"
          style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <div className="typing-dot w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--claude-orange)' }} />
          <div className="typing-dot w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--claude-orange)' }} />
          <div className="typing-dot w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--claude-orange)' }} />
        </div>
      </div>
    </div>
  )
}
