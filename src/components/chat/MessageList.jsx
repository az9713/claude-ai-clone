import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble.jsx'
import TypingIndicator from './TypingIndicator.jsx'
import { useConversation } from '../../contexts/ConversationContext.jsx'

export default function MessageList({ messages, onArtifactOpen }) {
  const { isStreaming } = useConversation()
  const endRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isStreaming])

  return (
    <div ref={containerRef} className="max-w-3xl mx-auto px-4 py-6 space-y-6" role="log" aria-live="polite" aria-label="Conversation messages">
      {messages.map((message, i) => (
        <MessageBubble
          key={message.id || i}
          message={message}
          onArtifactOpen={onArtifactOpen}
        />
      ))}
      {isStreaming && messages[messages.length - 1]?.role === 'user' && (
        <TypingIndicator />
      )}
      <div ref={endRef} />
    </div>
  )
}
