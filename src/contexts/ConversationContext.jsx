import { createContext, useContext, useState, useCallback } from 'react'
import { api, streamChat } from '../utils/api.js'

const ConversationContext = createContext()

export function ConversationProvider({ children }) {
  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamController, setStreamController] = useState(null)
  const [model, setModel] = useState('gemini-flash-lite-latest')

  const loadConversations = useCallback(async () => {
    try {
      const data = await api.get('/conversations')
      setConversations(data.data || [])
    } catch (err) {
      console.error('Failed to load conversations:', err)
    }
  }, [])

  const loadMessages = useCallback(async (conversationId) => {
    try {
      const data = await api.get(`/conversations/${conversationId}/messages`)
      setMessages(data.data || [])
    } catch (err) {
      console.error('Failed to load messages:', err)
    }
  }, [])

  const selectConversation = useCallback(async (conversation) => {
    setActiveConversation(conversation)
    if (conversation) {
      await loadMessages(conversation.id)
    } else {
      setMessages([])
    }
  }, [loadMessages])

  const createConversation = useCallback(async (title = 'New Chat') => {
    try {
      const data = await api.post('/conversations', { title, model })
      const conv = data.data
      setConversations(prev => [conv, ...prev])
      setActiveConversation(conv)
      setMessages([])
      return conv
    } catch (err) {
      console.error('Failed to create conversation:', err)
      return null
    }
  }, [model])

  const sendMessage = useCallback(async (content, images = []) => {
    let conv = activeConversation
    if (!conv) {
      conv = await createConversation(content.slice(0, 50))
      if (!conv) return
    }

    const userMessage = {
      id: 'temp-' + Date.now(),
      conversation_id: conv.id,
      role: 'user',
      content,
      images,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMessage])

    const assistantMessage = {
      id: 'temp-assistant-' + Date.now(),
      conversation_id: conv.id,
      role: 'assistant',
      content: '',
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, assistantMessage])

    setIsStreaming(true)
    const allMessages = [...messages, { role: 'user', content, images }].map(m => {
      let imgs = m.images
      if (typeof imgs === 'string') { try { imgs = JSON.parse(imgs) } catch { imgs = [] } }
      if (!Array.isArray(imgs)) imgs = []
      return {
        role: m.role,
        content: m.content,
        ...(imgs.length > 0 ? { images: imgs } : {}),
      }
    })

    try {
      const stream = streamChat(conv.id, allMessages, model)
      setStreamController(stream)
      let fullContent = ''
      let savedUserMsg = null
      let savedAssistantMsg = null

      for await (const chunk of stream.stream()) {
        if (chunk.type === 'user_message_saved') {
          savedUserMsg = chunk.message
          setMessages(prev => prev.map(m =>
            m.id === userMessage.id ? { ...savedUserMsg } : m
          ))
        } else if (chunk.type === 'content_block_delta') {
          fullContent += chunk.delta || ''
          setMessages(prev => prev.map(m =>
            m.id === assistantMessage.id ? { ...m, content: fullContent } : m
          ))
        } else if (chunk.type === 'message_complete') {
          savedAssistantMsg = chunk.message
          setMessages(prev => prev.map(m =>
            m.id === assistantMessage.id ? { ...savedAssistantMsg, content: fullContent } : m
          ))
        }
      }

      // Update conversation title if it's the first message
      if (messages.length === 0 && conv.title === content.slice(0, 50)) {
        loadConversations()
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Stream error:', err)
        setMessages(prev => prev.map(m =>
          m.id === assistantMessage.id
            ? { ...m, content: `Error: ${err.message}` }
            : m
        ))
      }
    } finally {
      setIsStreaming(false)
      setStreamController(null)
    }
  }, [activeConversation, createConversation, messages, model, loadConversations])

  const stopGeneration = useCallback(() => {
    if (streamController) {
      streamController.abort()
      setIsStreaming(false)
      setStreamController(null)
    }
  }, [streamController])

  const deleteConversation = useCallback(async (id) => {
    try {
      await api.delete(`/conversations/${id}`)
      setConversations(prev => prev.filter(c => c.id !== id))
      if (activeConversation?.id === id) {
        setActiveConversation(null)
        setMessages([])
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err)
    }
  }, [activeConversation])

  const updateConversation = useCallback(async (id, updates) => {
    try {
      const data = await api.put(`/conversations/${id}`, updates)
      const updated = data.data
      setConversations(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c))
      if (activeConversation?.id === id) {
        setActiveConversation(prev => ({ ...prev, ...updated }))
      }
    } catch (err) {
      console.error('Failed to update conversation:', err)
    }
  }, [activeConversation])

  return (
    <ConversationContext.Provider value={{
      conversations, activeConversation, messages, isStreaming, model,
      setModel, loadConversations, selectConversation, createConversation,
      sendMessage, stopGeneration, deleteConversation, updateConversation,
      setMessages, setActiveConversation,
    }}>
      {children}
    </ConversationContext.Provider>
  )
}

export const useConversation = () => useContext(ConversationContext)
