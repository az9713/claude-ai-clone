const BASE_URL = '/api'

async function request(endpoint, options = {}) {
  const { body, ...rest } = options
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...rest,
  }
  if (body) {
    config.body = JSON.stringify(body)
  }
  const res = await fetch(`${BASE_URL}${endpoint}`, config)
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error || `Request failed: ${res.status}`)
  }
  return data
}

export const api = {
  get: (endpoint) => request(endpoint),
  post: (endpoint, body) => request(endpoint, { method: 'POST', body }),
  put: (endpoint, body) => request(endpoint, { method: 'PUT', body }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
}

export function streamChat(conversationId, messages, model, settings = {}) {
  const controller = new AbortController()
  const eventSource = {
    controller,
    async *stream() {
      const res = await fetch(`${BASE_URL}/claude/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, messages, model, ...settings }),
        signal: controller.signal,
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Stream failed' }))
        throw new Error(err.error || 'Stream failed')
      }
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') return
            try {
              yield JSON.parse(data)
            } catch {}
          }
        }
      }
    },
    abort() {
      controller.abort()
    },
  }
  return eventSource
}
