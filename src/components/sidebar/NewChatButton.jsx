import { useConversation } from '../../contexts/ConversationContext.jsx'
import { useNavigate } from 'react-router-dom'

export default function NewChatButton() {
  const { createConversation, setActiveConversation, setMessages } = useConversation()
  const navigate = useNavigate()

  const handleNewChat = async () => {
    setActiveConversation(null)
    setMessages([])
    navigate('/')
  }

  return (
    <button
      onClick={handleNewChat}
      className="w-full py-2.5 px-4 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-all duration-200"
      style={{
        backgroundColor: 'var(--claude-orange)',
      }}
      onMouseEnter={e => { e.currentTarget.style.opacity = '0.9' }}
      onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
      New Chat
    </button>
  )
}
