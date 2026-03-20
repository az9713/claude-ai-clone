import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useConversation } from '../../contexts/ConversationContext.jsx'
import MessageList from '../chat/MessageList.jsx'
import ChatInput from '../chat/ChatInput.jsx'
import WelcomeScreen from '../chat/WelcomeScreen.jsx'

export default function MainChat({ onArtifactOpen, onOpenPromptLibrary }) {
  const { conversationId } = useParams()
  const { activeConversation, selectConversation, messages, conversations, loadConversations } = useConversation()

  // Load conversation from URL param (for direct navigation / page refresh)
  useEffect(() => {
    if (conversationId && activeConversation?.id !== conversationId) {
      const conv = conversations.find(c => c.id === conversationId)
      if (conv) {
        selectConversation(conv)
      } else {
        // Conversations not loaded yet — load them first
        loadConversations()
      }
    }
  }, [conversationId, activeConversation?.id, conversations])

  const hasMessages = messages.length > 0

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {hasMessages ? (
          <MessageList messages={messages} onArtifactOpen={onArtifactOpen} />
        ) : (
          <WelcomeScreen />
        )}
      </div>
      <ChatInput onOpenPromptLibrary={onOpenPromptLibrary} />
    </div>
  )
}
