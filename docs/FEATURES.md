# Claude.ai Clone - Feature Documentation

## Overview

A full-featured clone of Anthropic's Claude.ai chat interface supporting multiple AI providers (Gemini, OpenAI, Anthropic), built with React/Vite + Tailwind CSS frontend and Node.js/Express + SQLite backend.

---

## Core Chat Features

### Streaming Responses
- Real-time message streaming via Server-Sent Events (SSE)
- Word-by-word response display as the AI generates
- Stop generation button to cancel mid-response
- Typing indicator animation while waiting for first token

### Markdown Rendering
- Full GitHub-flavored Markdown support via react-markdown + remark-gfm
- Headings (H1-H3), bold, italic, strikethrough
- Ordered and unordered lists
- Block quotes with orange accent border
- Tables with styled headers
- Horizontal rules
- Inline code with background highlight
- Links with orange accent color

### Code Blocks
- Syntax highlighting via highlight.js (180+ languages)
- Language label in header bar
- One-click copy button with checkmark feedback
- "Open as artifact" button to view in side panel
- Dark theme code background
- Monospace font (JetBrains Mono)

### Message Actions
- **Copy** -- Copy message content to clipboard
- **Edit** -- Edit user messages (UI button present)
- **Regenerate** -- Regenerate assistant responses (UI button present)

### Chat Input
- Auto-expanding textarea (grows with content, max 200px)
- Enter to send, Shift+Enter for newline
- Character counter (shows when typing)
- Disabled state during streaming
- Placeholder text: "Message Claude..."

---

## Multi-Provider AI Support

### Supported Providers and Models

| Provider | Model | Description |
|----------|-------|-------------|
| **Google Gemini** | gemini-flash-lite-latest | Lightweight, fast (default) |
| | gemini-2.5-flash-preview-05-20 | Fast with thinking |
| | gemini-2.5-pro-preview-05-06 | Enhanced reasoning |
| | gemini-2.0-flash | Balanced speed/quality |
| **Anthropic** | claude-sonnet-4-5-20250929 | Speed + intelligence |
| | claude-haiku-4-5-20251001 | Fastest responses |
| | claude-opus-4-1-20250805 | Complex reasoning |
| **OpenAI** | gpt-4o | Versatile multimodal |
| | gpt-4o-mini | Affordable and fast |
| | o3-mini | Advanced reasoning |

### Model Selector
- Dropdown in header bar grouped by provider
- Only shows models with configured API keys
- Switch models mid-conversation
- Model name displayed in header

### API Key Configuration
- Set via `.env` file in project root
- Supports: `GEMINI_API_KEY`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`
- Auto-detection of available providers
- Debug endpoint (`/api/claude/debug`) to verify key loading

---

## Image Upload (Multi-Modal)

### Upload Flow
- Click image icon below chat input
- Select one or multiple images
- Preview thumbnails appear above the textarea
- Remove individual images with X button
- Send message with text + images

### Provider Support
- Images sent as base64 data URLs
- Gemini: OpenAI-compatible format with `image_url`
- OpenAI: Native `image_url` content blocks
- Anthropic: `image` content blocks with `base64` source

---

## Advanced Parameters

Toggle via the sliders icon below chat input:

| Parameter | Range | Default | Description |
|-----------|-------|---------|-------------|
| Temperature | 0.0 - 2.0 | 1.0 | Controls randomness |
| Max Tokens | 1 - 200,000 | 4,096 | Maximum response length |
| Top-P | 0.0 - 1.0 | 1.0 | Nucleus sampling threshold |

---

## Conversation Management

### Sidebar
- Conversation list grouped by date: Today, Yesterday, Previous 7 Days, Previous 30 Days, Older
- Pinned conversations always appear at top
- Active conversation highlighted
- Conversation title auto-generated from first message
- Collapsible with toggle button in header

### Conversation Actions (Right-Click Context Menu)
- **Rename** -- Inline editing with Enter to confirm, Escape to cancel
- **Pin/Unpin** -- Pin important conversations to top
- **Archive** -- Hide from main list
- **Duplicate** -- Clone conversation with all messages
- **Share** -- Generate shareable link
- **Export** -- Export as JSON or Markdown
- **Delete** -- Soft delete (recoverable)

### New Chat
- "+ New Chat" button in sidebar
- Welcome screen with suggestion cards:
  - Explain a concept
  - Write code
  - Analyze data
  - Creative writing
- Keyboard shortcut: Ctrl/Cmd+N

### Search
- Search bar in sidebar
- Real-time local filtering by title
- Debounced deep search via API (searches message content)
- Results across conversations and messages

---

## Conversation Sharing

### Create Share Link
- Click share in conversation context menu
- Generate unique shareable URL
- Configure expiry: 1 day, 7 days, 30 days, or never
- Toggle public/private
- Copy link to clipboard
- View count tracking

### Shared View (/share/:token)
- Read-only conversation display
- Claude branding header
- All messages rendered with full formatting
- No input area or sidebar
- Expiration checking
- View counter in footer

---

## Folder Organization

### Folder Management
- Create folders from sidebar
- Rename and delete folders
- Drag conversations into folders
- Conversation count badges per folder
- Collapsible folder section

---

## Projects

### Project Features
- Create projects to group related conversations
- Each project has: name, description, color, custom instructions
- 15 color options for visual organization
- Project selector dropdown in header
- "All Projects" view to see everything
- Filter conversations by project

### Project Settings Modal
- Edit project name and description
- Color picker
- Custom instructions (system prompt for all project conversations)
- Delete project (unlinks conversations)

---

## Settings

### General Tab
- **Theme**: Light, Dark, Auto (system preference)
- **Font Size**: Slider from 12px to 24px (default 16px)
- **Message Density**: Compact, Comfortable (default), Spacious

### Custom Instructions Tab
- Global system prompt textarea
- Applied to all new conversations
- Character count display

### Keyboard Shortcuts Tab
Reference table of all shortcuts:

| Shortcut | Action |
|----------|--------|
| Ctrl/Cmd + N | New chat |
| Ctrl/Cmd + Shift + S | Toggle settings |
| Ctrl/Cmd + / | Toggle sidebar |
| Ctrl/Cmd + K | Command palette |
| Enter | Send message |
| Shift + Enter | New line |
| Escape | Close modal |

### API Keys Tab
- Display and manage API keys (interface present)

### Usage Tab
- Token usage by model (bar chart)
- Daily usage table (date, requests, tokens, cost)
- Monthly summary totals
- Cost estimation per model

---

## Prompt Library

### Browse Prompts
- Searchable prompt collection
- Filter by category: General, Coding, Writing, Creative, Learning
- 6 built-in example prompts:
  - Explain Like I'm 5
  - Code Review
  - Summarize Text
  - Creative Story
  - Debug Helper
  - Email Drafter

### Create Custom Prompts
- Title, description, template text
- Category assignment
- Tags support
- Usage count tracking

### Use Prompts
- Click to insert into chat input
- Template variable placeholders

---

## Artifacts System

### Artifact Detection
- Automatically detects code blocks, HTML, SVG, and mermaid diagrams in responses
- "Open as artifact" button on code blocks

### Artifact Panel (Right Column)
- Slide-in panel from right
- Type badge (Code, HTML, SVG, Mermaid, React, Text)
- Multiple artifact tabs per conversation
- Close button and fullscreen toggle

### Preview Types
| Type | Renderer |
|------|----------|
| Code | Syntax-highlighted with line numbers |
| HTML | Sandboxed iframe with code/preview toggle |
| SVG | Inline render with zoom (+/-/reset) and background toggle |
| Mermaid | Diagram rendering via mermaid.js CDN |
| Text | Formatted text display |

### Artifact Actions
- Download content as file
- Fork (create new version)
- Version selector dropdown with timestamps
- Version history tracking

---

## Command Palette

- Trigger: Ctrl/Cmd + K
- Full-screen overlay with search input (auto-focused)
- Search across conversations and quick actions
- Arrow keys to navigate, Enter to select, Escape to close
- Quick actions: New Chat, Toggle Theme, Open Settings, Toggle Sidebar

---

## Onboarding Tour

- Appears on first visit (stored in localStorage)
- 5-step guided tour:
  1. Welcome to Claude
  2. Start chatting
  3. Explore the sidebar
  4. Discover artifacts
  5. Customize settings
- Skip / Next / Finish buttons
- Step progress indicator
- Element highlighting

---

## Theme System

### Light Mode
- White background (#FFFFFF)
- Light gray surfaces (#F5F5F5)
- Dark text (#1A1A1A)
- Light borders (#E5E5E5)

### Dark Mode
- Dark gray background (#1A1A1A)
- Darker surfaces (#2A2A2A)
- Off-white text (#E5E5E5)
- Dark borders (#404040)

### Accent Color
- Claude Orange: #CC785C
- Used for: branding, links, active states, buttons, blockquote borders

### High Contrast Mode
- Enhanced contrast ratios for accessibility
- Separate light and dark high-contrast palettes

---

## Responsive Design

### Desktop (>768px)
- Three-column layout: Sidebar | Chat | Artifacts
- Collapsible sidebar with smooth transition
- Resizable artifact panel

### Mobile (<768px)
- Single-column layout
- Sidebar as overlay with backdrop blur
- Swipe-to-close gesture on sidebar
- Full-width modals
- Touch-optimized targets

---

## Accessibility

- ARIA labels on all interactive elements
- `role="navigation"` on sidebar
- `role="log"` with `aria-live="polite"` on message list
- `aria-label` on all buttons
- Keyboard navigation support
- `@media (prefers-reduced-motion: reduce)` disables animations
- `@media (forced-colors: active)` for system high contrast
- Focus management in modals

---

## Usage Tracking

### Per-Message Tracking
- Input tokens counted
- Output tokens counted
- Model used
- Cost estimation
- Timestamp

### Analytics Views
- Daily usage (last 30 days)
- Monthly usage (last 12 months)
- Usage grouped by model
- Per-conversation usage breakdown

---

## Export

### JSON Export
- Full conversation data with all messages
- Metadata (title, model, timestamps)

### Markdown Export
- Readable format with role headers
- Message content preserved
- Timestamps included

---

## Database

### 11 Tables
1. **users** -- Account with preferences (JSON), custom instructions
2. **projects** -- Name, description, color, custom instructions
3. **conversations** -- Title, model, settings (JSON), token/message counts, pin/archive flags
4. **messages** -- Role, content, images (JSON), tokens, parent message ID (branching)
5. **artifacts** -- Type, title, language, content, version number
6. **shared_conversations** -- Share token, expiry, view count, public flag
7. **prompt_library** -- Title, template, category, tags (JSON), usage count
8. **conversation_folders** -- Hierarchical folder structure
9. **conversation_folder_items** -- Many-to-many folder membership
10. **usage_tracking** -- Per-message token usage and cost
11. **api_keys** -- User API key storage

### Performance
- WAL mode enabled for concurrency
- Foreign keys enforced
- Indexes on: conversations(user_id), conversations(project_id), messages(conversation_id), artifacts(conversation_id), artifacts(message_id), usage(user_id), usage(conversation_id)

---

## API Endpoints (40+)

### Auth (4 endpoints)
`POST /login`, `POST /logout`, `GET /me`, `PUT /profile`

### Conversations (8 endpoints)
`GET /`, `POST /`, `GET /:id`, `PUT /:id`, `DELETE /:id`, `POST /:id/duplicate`, `PUT /:id/pin`, `PUT /:id/archive`

### Messages (4 endpoints)
`GET /conversations/:id/messages`, `POST /conversations/:id/messages`, `PUT /messages/:id`, `DELETE /messages/:id`

### Claude/AI (3 endpoints)
`GET /models`, `GET /debug`, `POST /chat/stream`

### Artifacts (6 endpoints)
`GET /`, `GET /:id`, `PUT /:id`, `DELETE /:id`, `POST /:id/fork`, `GET /:id/versions`

### Projects (7 endpoints)
`GET /`, `POST /`, `GET /:id`, `PUT /:id`, `DELETE /:id`, `GET /:id/conversations`, `PUT /:id/settings`

### Sharing (4 endpoints)
`POST /`, `GET /:token`, `DELETE /:token`, `PUT /:token/settings`

### Prompts (7 endpoints)
`GET /library`, `POST /library`, `GET /categories`, `GET /examples`, `GET /:id`, `PUT /:id`, `DELETE /:id`

### Folders (6 endpoints)
`GET /`, `POST /`, `PUT /:id`, `DELETE /:id`, `POST /:id/items`, `DELETE /:id/items/:conversationId`

### Search (2 endpoints)
`GET /conversations?q=`, `GET /messages?q=`

### Usage (4 endpoints)
`GET /daily`, `GET /monthly`, `GET /by-model`, `GET /conversations/:id`

### Settings (4 endpoints)
`GET /`, `PUT /`, `GET /custom-instructions`, `PUT /custom-instructions`

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend Framework | React 18 + Vite 5 |
| Styling | Tailwind CSS (CDN) + CSS Variables |
| Routing | React Router v6 |
| Markdown | react-markdown + remark-gfm |
| Code Highlighting | highlight.js |
| Fonts | Inter (sans), JetBrains Mono (code) |
| Backend | Node.js + Express |
| Database | SQLite via better-sqlite3 |
| AI Integration | Direct API calls (Gemini, OpenAI, Anthropic) |
| Streaming | Server-Sent Events (SSE) |
| Port (Frontend) | 5173 (Vite dev server) |
| Port (Backend) | 3001 (Express) |
