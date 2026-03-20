import { useConversation } from '../../contexts/ConversationContext.jsx'

const SUGGESTIONS = [
  { title: 'Explain a concept', prompt: 'Explain quantum computing in simple terms' },
  { title: 'Write code', prompt: 'Write a Python function to sort a list using merge sort' },
  { title: 'Analyze data', prompt: 'What are the key metrics I should track for a SaaS business?' },
  { title: 'Creative writing', prompt: 'Write a short poem about the beauty of mathematics' },
]

export default function WelcomeScreen() {
  const { sendMessage } = useConversation()

  return (
    <div className="flex flex-col items-center justify-center h-full px-4">
      <div className="text-center mb-8">
        {/* Claude logo */}
        <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{ backgroundColor: 'var(--claude-orange)', opacity: 0.9 }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        <h1 className="text-2xl font-semibold mb-2">How can I help you today?</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Start a conversation with Claude or try one of the suggestions below.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full">
        {SUGGESTIONS.map((s, i) => (
          <button key={i}
            onClick={() => sendMessage(s.prompt)}
            className="text-left p-4 rounded-xl border transition-all hover:shadow-md"
            style={{
              borderColor: 'var(--border-color)',
              backgroundColor: 'var(--bg-secondary)',
            }}>
            <div className="font-medium text-sm mb-1">{s.title}</div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {s.prompt}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
