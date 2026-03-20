import { Router } from 'express'
import { randomUUID } from 'crypto'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import db from '../db/schema.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const router = Router()

// --- API Key Loading ---
function loadEnvFile() {
  const paths = [
    resolve(__dirname, '..', '..', '.env'),  // project-root/.env
    resolve(__dirname, '..', '.env'),          // server/.env
    resolve(process.cwd(), '.env'),            // cwd/.env
  ]

  for (const p of paths) {
    try {
      const envFile = readFileSync(p, 'utf-8')
      const vars = {}
      for (const line of envFile.split('\n')) {
        const match = line.match(/^([A-Z_]+)=(.+)/)
        if (match) vars[match[1]] = match[2].trim()
      }
      if (Object.keys(vars).length > 0) {
        console.log('  Loaded .env from:', p)
        return vars
      }
    } catch {}
  }
  console.log('  Warning: No .env file found')
  return {}
}

const envVars = loadEnvFile()

function getKey(name) {
  return process.env[name] || envVars[name] || null
}

// Detect which provider is available
function getProvider(modelId) {
  const provider = MODELS.find(m => m.id === modelId)?.provider
  if (!provider) return null

  const keys = {
    anthropic: getKey('ANTHROPIC_API_KEY'),
    openai: getKey('OPENAI_API_KEY'),
    gemini: getKey('GEMINI_API_KEY') || getKey('GOOGLE_API_KEY'),
  }

  if (keys[provider]) return { provider, apiKey: keys[provider] }
  return null
}

// --- Model Definitions ---
const MODELS = [
  // Anthropic
  { id: 'claude-sonnet-4-5-20250929', name: 'Claude Sonnet 4.5', provider: 'anthropic', badge: 'Default',
    description: 'Best balance of speed and intelligence', context_window: 200000, max_output: 8192,
    pricing: { input: 3.0, output: 15.0 } },
  { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5', provider: 'anthropic', badge: 'Fast',
    description: 'Fastest responses, great for simple tasks', context_window: 200000, max_output: 8192,
    pricing: { input: 0.25, output: 1.25 } },
  { id: 'claude-opus-4-1-20250805', name: 'Claude Opus 4.1', provider: 'anthropic', badge: 'Powerful',
    description: 'Most powerful for complex reasoning', context_window: 200000, max_output: 8192,
    pricing: { input: 15.0, output: 75.0 } },
  // OpenAI
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', badge: 'Versatile',
    description: 'Fast and capable multimodal model', context_window: 128000, max_output: 4096,
    pricing: { input: 2.5, output: 10.0 } },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', badge: 'Cheap',
    description: 'Affordable and fast for simple tasks', context_window: 128000, max_output: 4096,
    pricing: { input: 0.15, output: 0.6 } },
  { id: 'o3-mini', name: 'o3-mini', provider: 'openai', badge: 'Reasoning',
    description: 'Advanced reasoning model', context_window: 200000, max_output: 100000,
    pricing: { input: 1.1, output: 4.4 } },
  // Gemini
  { id: 'gemini-flash-lite-latest', name: 'Gemini Flash Lite', provider: 'gemini', badge: 'Default',
    description: 'Lightweight and fast, great for testing', context_window: 1048576, max_output: 8192,
    pricing: { input: 0.0, output: 0.0 } },
  { id: 'gemini-2.5-flash-preview-05-20', name: 'Gemini 2.5 Flash', provider: 'gemini', badge: 'Fast',
    description: 'Fast and efficient with thinking', context_window: 1048576, max_output: 65536,
    pricing: { input: 0.15, output: 0.6 } },
  { id: 'gemini-2.5-pro-preview-05-06', name: 'Gemini 2.5 Pro', provider: 'gemini', badge: 'Smart',
    description: 'Enhanced thinking and reasoning', context_window: 1048576, max_output: 65536,
    pricing: { input: 1.25, output: 10.0 } },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'gemini', badge: 'Balanced',
    description: 'Great balance of speed and quality', context_window: 1048576, max_output: 8192,
    pricing: { input: 0.1, output: 0.4 } },
]

// GET /api/claude/models - only return models whose API key is configured
router.get('/models', (req, res) => {
  const available = MODELS.filter(m => {
    const keys = {
      anthropic: getKey('ANTHROPIC_API_KEY'),
      openai: getKey('OPENAI_API_KEY'),
      gemini: getKey('GEMINI_API_KEY') || getKey('GOOGLE_API_KEY'),
    }
    return !!keys[m.provider]
  })
  res.json({ success: true, data: available.length > 0 ? available : MODELS })
})

// --- Multimodal message formatting ---
// Converts messages with images to the format each API expects
function parseImages(imgs) {
  if (Array.isArray(imgs)) return imgs.filter(Boolean)
  if (typeof imgs === 'string') { try { const p = JSON.parse(imgs); return Array.isArray(p) ? p.filter(Boolean) : [] } catch { return [] } }
  return []
}

function formatMessagesForOpenAI(messages, systemPrompt) {
  const apiMessages = []
  if (systemPrompt) apiMessages.push({ role: 'system', content: systemPrompt })
  for (const m of messages) {
    const images = parseImages(m.images)
    if (images.length > 0) {
      const content = [
        { type: 'text', text: m.content },
        ...images.map(img => ({
          type: 'image_url',
          image_url: { url: img },
        })),
      ]
      apiMessages.push({ role: m.role, content })
    } else {
      apiMessages.push({ role: m.role, content: m.content })
    }
  }
  return apiMessages
}

function formatMessagesForAnthropic(messages) {
  return messages.map(m => {
    const images = parseImages(m.images)
    if (images.length > 0) {
      const content = [
        ...images.map(img => {
          const match = img.match(/^data:(image\/\w+);base64,(.+)/)
          if (match) {
            return { type: 'image', source: { type: 'base64', media_type: match[1], data: match[2] } }
          }
          return { type: 'image', source: { type: 'url', url: img } }
        }),
        { type: 'text', text: m.content },
      ]
      return { role: m.role, content }
    }
    return { role: m.role, content: m.content }
  })
}

// GET /api/claude/debug - check which keys are loaded
router.get('/debug', (req, res) => {
  const geminiKey = getKey('GEMINI_API_KEY') || getKey('GOOGLE_API_KEY')
  const anthropicKey = getKey('ANTHROPIC_API_KEY')
  const openaiKey = getKey('OPENAI_API_KEY')
  res.json({
    success: true,
    data: {
      envVarsLoaded: Object.keys(envVars),
      gemini: geminiKey ? `${geminiKey.slice(0, 8)}...` : null,
      anthropic: anthropicKey ? `${anthropicKey.slice(0, 8)}...` : null,
      openai: openaiKey ? `${openaiKey.slice(0, 8)}...` : null,
    }
  })
})

// --- Provider-specific streaming ---

async function streamAnthropic(apiKey, messages, model, options, res) {
  const requestBody = {
    model,
    messages: formatMessagesForAnthropic(messages),
    max_tokens: options.max_tokens || 4096,
    stream: true,
  }
  if (options.temperature !== undefined) requestBody.temperature = options.temperature
  if (options.top_p !== undefined) requestBody.top_p = options.top_p
  if (options.system) requestBody.system = options.system

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Anthropic API ${response.status}: ${errorBody}`)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let fullContent = ''
  let buffer = ''
  let inputTokens = 0, outputTokens = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6).trim()
      if (!data || data === '[DONE]') continue
      try {
        const event = JSON.parse(data)
        if (event.type === 'content_block_delta' && event.delta?.text) {
          fullContent += event.delta.text
          res.write(`data: ${JSON.stringify({ type: 'content_block_delta', delta: event.delta.text })}\n\n`)
        } else if (event.type === 'message_start' && event.message?.usage) {
          inputTokens = event.message.usage.input_tokens || 0
        } else if (event.type === 'message_delta' && event.usage) {
          outputTokens = event.usage.output_tokens || 0
        }
      } catch {}
    }
  }
  return { fullContent, inputTokens, outputTokens }
}

async function streamOpenAI(apiKey, messages, model, options, res) {
  const apiMessages = formatMessagesForOpenAI(messages, options.system)

  const requestBody = {
    model,
    messages: apiMessages,
    max_tokens: options.max_tokens || 4096,
    stream: true,
  }
  if (options.temperature !== undefined) requestBody.temperature = options.temperature
  if (options.top_p !== undefined) requestBody.top_p = options.top_p

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`OpenAI API ${response.status}: ${errorBody}`)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let fullContent = ''
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6).trim()
      if (!data || data === '[DONE]') continue
      try {
        const event = JSON.parse(data)
        const delta = event.choices?.[0]?.delta?.content
        if (delta) {
          fullContent += delta
          res.write(`data: ${JSON.stringify({ type: 'content_block_delta', delta })}\n\n`)
        }
      } catch {}
    }
  }
  // OpenAI doesn't give token counts in stream easily; estimate
  const inputTokens = Math.ceil(JSON.stringify(messages).length / 4)
  const outputTokens = Math.ceil(fullContent.length / 4)
  return { fullContent, inputTokens, outputTokens }
}

async function streamGemini(apiKey, messages, model, options, res) {
  // Use Gemini's OpenAI-compatible endpoint (supports multimodal)
  const apiMessages = formatMessagesForOpenAI(messages, options.system)

  const requestBody = {
    model,
    messages: apiMessages,
    max_tokens: options.max_tokens || 4096,
    stream: true,
  }
  if (options.temperature !== undefined) requestBody.temperature = options.temperature
  if (options.top_p !== undefined) requestBody.top_p = options.top_p

  // Debug: log if images are present
  const hasImages = apiMessages.some(m => Array.isArray(m.content))
  if (hasImages) console.log(`  [Gemini] Sending multimodal request with images to ${model}`)

  const url = `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    console.error(`  [Gemini] API error ${response.status}:`, errorBody.slice(0, 500))
    throw new Error(`Gemini API ${response.status}: ${errorBody}`)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let fullContent = ''
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6).trim()
      if (!data || data === '[DONE]') continue
      try {
        const event = JSON.parse(data)
        const delta = event.choices?.[0]?.delta?.content
        if (delta) {
          fullContent += delta
          res.write(`data: ${JSON.stringify({ type: 'content_block_delta', delta })}\n\n`)
        }
      } catch {}
    }
  }
  const inputTokens = Math.ceil(JSON.stringify(messages).length / 4)
  const outputTokens = Math.ceil(fullContent.length / 4)
  return { fullContent, inputTokens, outputTokens }
}

// --- Main streaming endpoint ---

router.post('/chat/stream', async (req, res) => {
  const { conversationId, messages, model = 'gemini-flash-lite-latest', temperature, max_tokens, top_p, system } = req.body

  const providerInfo = getProvider(model)
  if (!providerInfo) {
    const modelDef = MODELS.find(m => m.id === model)
    const providerName = modelDef?.provider || 'unknown'
    const keyName = { anthropic: 'ANTHROPIC_API_KEY', openai: 'OPENAI_API_KEY', gemini: 'GEMINI_API_KEY' }[providerName]
    return res.status(500).json({ success: false, error: `No API key for ${providerName}. Set ${keyName || 'the appropriate API key'} environment variable.` })
  }

  const { provider, apiKey } = providerInfo

  // Debug: check for images in messages
  const msgsWithImages = messages.filter(m => m.images && (Array.isArray(m.images) ? m.images.length : m.images !== '[]'))
  if (msgsWithImages.length > 0) {
    console.log(`  [Stream] ${msgsWithImages.length} message(s) contain images`)
  }

  // Set up SSE
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  // Save user message to DB
  const userContent = messages[messages.length - 1]?.content || ''
  const userMsgId = randomUUID()
  try {
    db.prepare(
      'INSERT INTO messages (id, conversation_id, role, content) VALUES (?, ?, ?, ?)'
    ).run(userMsgId, conversationId, 'user', userContent)
    db.prepare(
      `UPDATE conversations SET last_message_at = datetime('now'), updated_at = datetime('now'), message_count = message_count + 1 WHERE id = ?`
    ).run(conversationId)
  } catch (dbErr) {
    console.error('DB error saving user message:', dbErr.message)
    // Don't fail the stream — continue anyway
  }

  res.write(`data: ${JSON.stringify({ type: 'user_message_saved', message: { id: userMsgId, conversation_id: conversationId, role: 'user', content: userContent, created_at: new Date().toISOString() } })}\n\n`)

  try {
    const options = { temperature, max_tokens, top_p, system }
    let result

    switch (provider) {
      case 'anthropic':
        result = await streamAnthropic(apiKey, messages, model, options, res)
        break
      case 'openai':
        result = await streamOpenAI(apiKey, messages, model, options, res)
        break
      case 'gemini':
        result = await streamGemini(apiKey, messages, model, options, res)
        break
      default:
        throw new Error(`Unknown provider: ${provider}`)
    }

    const { fullContent, inputTokens, outputTokens } = result

    // Save assistant message
    const assistantMsgId = randomUUID()
    try {
      db.prepare(
        'INSERT INTO messages (id, conversation_id, role, content, tokens) VALUES (?, ?, ?, ?, ?)'
      ).run(assistantMsgId, conversationId, 'assistant', fullContent, outputTokens)
      db.prepare(
        `UPDATE conversations SET last_message_at = datetime('now'), updated_at = datetime('now'), message_count = message_count + 1, token_count = token_count + ? WHERE id = ?`
      ).run(inputTokens + outputTokens, conversationId)

      // Track usage
      db.prepare(
        'INSERT INTO usage_tracking (user_id, conversation_id, message_id, model, input_tokens, output_tokens) VALUES (1, ?, ?, ?, ?, ?)'
      ).run(conversationId, assistantMsgId, model, inputTokens, outputTokens)

      // Auto-generate title if first exchange
      const msgCount = db.prepare('SELECT COUNT(*) as count FROM messages WHERE conversation_id = ?').get(conversationId)
      if (msgCount.count <= 2) {
        const shortTitle = userContent.slice(0, 60) + (userContent.length > 60 ? '...' : '')
        db.prepare('UPDATE conversations SET title = ? WHERE id = ? AND title = ?')
          .run(shortTitle, conversationId, 'New Chat')
      }
    } catch (dbErr) {
      console.error('DB error saving assistant message:', dbErr.message)
    }

    res.write(`data: ${JSON.stringify({
      type: 'message_complete',
      message: { id: assistantMsgId, conversation_id: conversationId, role: 'assistant', content: fullContent, tokens: outputTokens, created_at: new Date().toISOString() }
    })}\n\n`)
    res.write('data: [DONE]\n\n')
  } catch (err) {
    console.error(`${provider} API stream error:`, err)
    res.write(`data: ${JSON.stringify({ type: 'error', error: err.message })}\n\n`)
    res.write('data: [DONE]\n\n')
  }

  res.end()
})

export default router
