# Claude.ai Clone - Development Journey

## Origin

This project began from Anthropic's official app specification at:
https://github.com/anthropics/claude-quickstarts/blob/main/autonomous-coding/prompts/app_spec.txt

The spec defines a full-featured Claude.ai clone with React/Vite frontend, Node.js/Express backend, SQLite database, and Claude API integration with SSE streaming. It covers 9 sequential implementation steps, 40+ API endpoints, 10+ database tables, and a three-column UI layout.

The approach was inspired by Leon van Zyl's YouTube video on leveraging Claude Code's 1M token context window (Opus 4.6) to build large applications using parallel agent teams.

---

## The Wave Approach

### What is a Wave?

A wave is a group of features that can be built independently by a separate agent, without conflicting with other waves running at the same time. Each wave owns a distinct area of the application -- its own set of files, components, and API routes -- so multiple agents can write code simultaneously without merge conflicts.

### Why Waves Instead of Sequential Steps?

The app spec defines 9 steps meant to be done in order. But many of those steps don't actually depend on each other:

- The sidebar (conversation list, folders, search) doesn't need the artifacts panel
- The artifacts panel doesn't need projects or settings
- Settings, model selection, and advanced features don't need the sidebar or artifacts

They all just need the foundation -- the database, the server, the core chat loop. So instead of 9 sequential steps (slow), we built 1 foundation + 3 parallel waves + 1 integration wave (fast).

### Three Principles Behind Wave Construction

1. **File ownership** -- Features that touch the same files must be in the same wave. Features that touch different files can be in different waves. This prevents merge conflicts.
2. **Maximize parallelism** -- After the foundation, we want as many waves running simultaneously as possible.
3. **Dependency ordering** -- Some features need others to exist first.

### The Five Waves

```
WAVE 0 (Foundation + Core Chat)
  |
  +---> WAVE 1 (Sidebar + Conversations)     --+
  |                                             |
  +---> WAVE 2 (Artifacts System)             --+--> WAVE 4 (Sharing + Polish)
  |                                             |
  +---> WAVE 3 (Projects + Settings + Advanced)-+

Waves 1, 2, 3 run IN PARALLEL after Wave 0 completes.
Wave 4 runs AFTER Waves 1, 2, 3 all complete.
```

#### Wave 0 -- Foundation + Core Chat (Built directly by main agent)
- Express server on port 3001 with CORS, error handling
- SQLite database with ALL 11 tables created upfront
- Auth, conversation, message routes
- Claude API streaming proxy
- React/Vite frontend with Tailwind CDN
- Three-column layout shell
- Chat components: ChatInput, MessageList, MessageBubble, CodeBlock, TypingIndicator, WelcomeScreen
- Auth, Theme, Conversation contexts
- SSE streaming hook
- ~25 files created

#### Wave 1 -- Sidebar + Conversation Management (Parallel agent)
- Sidebar with conversation list grouped by date
- Real-time search with debounced deep API search
- Folder tree with drag-and-drop
- Conversation context menu (rename, pin, archive, delete, duplicate)
- React Router navigation
- Backend: folder CRUD, search routes
- ~12 files, completed in ~14 minutes

#### Wave 2 -- Artifacts System (Parallel agent)
- Slide-in right panel for code/HTML/SVG/mermaid previews
- Artifact type detection and routing
- Code preview with syntax highlighting
- HTML preview in sandboxed iframe
- SVG preview with zoom controls
- Mermaid diagram rendering via CDN
- Version history and forking
- Backend: artifact CRUD, version management
- ~12 files, completed in ~8 minutes

#### Wave 3 -- Projects + Settings + Advanced Features (Parallel agent)
- Project CRUD with color picker and custom instructions
- Settings modal with 5 tabs (General, Custom Instructions, Keyboard Shortcuts, API Keys, Usage)
- Prompt library with categories and examples
- Model selector dropdown
- Advanced parameters (temperature, max tokens, top-p)
- Image upload with preview
- Message edit/regenerate buttons
- Usage tracking dashboard
- Backend: projects, settings, prompts, usage routes
- ~20 files, completed in ~26 minutes

#### Wave 4 -- Sharing + Polish + Integration (Sequential agent, after Waves 1-3)
- Conversation sharing with expiry and public/private toggle
- Export modal (JSON, Markdown)
- Command palette (Ctrl/Cmd+K)
- Onboarding tour for first-time users
- Mobile responsive layout with sidebar overlay
- Accessibility (ARIA labels, reduced motion, high contrast)
- Backend: sharing routes
- ~12 files, completed in ~7 minutes

### Why 3 Parallel Waves (Not More, Not Fewer)?

- **More** would cause file conflicts (e.g., splitting "projects" from "settings" would conflict on Header.jsx and ChatInput.jsx)
- **Fewer** would waste parallelism (sidebar, artifacts, and settings are genuinely independent UI columns)
- The three-column UI layout (sidebar | chat | artifacts) naturally maps to three independent work streams

### Agent Team Results

| Agent | Wave | Duration | Files | Tokens Used |
|-------|------|----------|-------|-------------|
| Foundation (main) | Wave 0 | Direct build | ~25 | -- |
| Sidebar Agent | Wave 1 | ~14 min | ~12 | 44K |
| Artifacts Agent | Wave 2 | ~8 min | ~12 | 37K |
| Features Agent | Wave 3 | ~26 min | ~20 | 63K |
| Polish Agent | Wave 4 | ~7 min | ~12 | 64K |

---

## Multi-Provider API Support

After the initial build targeted Claude API, the application was extended to support three AI providers:

- **Anthropic**: Claude Sonnet 4.5, Haiku 4.5, Opus 4.1
- **OpenAI**: GPT-4o, GPT-4o Mini, o3-mini
- **Google Gemini**: Flash Lite (default), 2.5 Flash, 2.5 Pro, 2.0 Flash

The backend auto-detects which provider to use based on the selected model and routes the request accordingly. Each provider has its own streaming implementation handling SSE parsing differences. Multi-modal (image) support is implemented for all three providers.

---

## Bugs Encountered and Fixed

### Bug 1: SQLite `datetime("now")` Syntax Error

**Symptom:** Server error `no such column: "now"` when saving messages.

**Root Cause:** SQLite requires single quotes for string literals: `datetime('now')`. The code used double quotes: `datetime("now")`, which SQLite interprets as a column reference.

**Fix:** Global find-and-replace across all 4 route files (auth.js, conversations.js, messages.js, claude.js) changing `datetime("now")` to `datetime('now')`.

### Bug 2: JavaScript String Quoting Conflict

**Symptom:** `SyntaxError: missing ) after argument list` in auth.js preventing server startup.

**Root Cause:** After fixing Bug 1, single-quoted SQL strings like `'UPDATE users SET last_login = datetime('now') WHERE id = ?'` had single quotes inside single quotes, breaking the JavaScript string.

**Fix:** Changed all SQL strings containing `datetime('now')` to use backtick template literals instead of single quotes:
```javascript
// Before (broken)
db.prepare('UPDATE users SET last_login = datetime('now') WHERE id = ?')
// After (fixed)
db.prepare(`UPDATE users SET last_login = datetime('now') WHERE id = ?`)
```

This affected 8+ SQL statements across 4 files.

### Bug 3: `message.images.map is not a function` -- React Crash

**Symptom:** Clicking a conversation in the sidebar caused a blank white page. No visible error in the UI.

**Root Cause:** The `images` field in the database is stored as a JSON string (e.g., `"[]"`). When messages were loaded from the API, `MessageBubble.jsx` tried to call `message.images.map()` on the string `"[]"`, which is not an array. JavaScript's `.length` on the string returned 2 (not 0), so the code entered the image rendering block and crashed on `.map()`.

**Fix:** Added JSON parsing with fallback in MessageBubble.jsx:
```javascript
const images = Array.isArray(message.images)
  ? message.images
  : (() => { try { return JSON.parse(message.images || '[]') } catch { return [] } })()
```

### Bug 4: Nested React Router Blank Page

**Symptom:** Navigating to `/c/:conversationId` rendered a completely blank page -- no header, no sidebar, nothing.

**Root Cause:** The original `App.jsx` used nested `<Routes>` inside a `<Route path="*">`. When navigating to `/c/xxx`, the inner routes with absolute paths (`path="/c/:conversationId"`) didn't match because nested Routes use relative paths. A second attempt used a nested function component `AppLayout()` which React treated as a new component type on every render, unmounting and remounting the entire tree.

**Fix:** Restructured `App.jsx` to avoid nested Routes entirely. The shared view (`/share/:token`) is handled via `location.pathname` check, and the main layout renders directly without route wrapping. `MainChat.jsx` uses `useParams()` to get the conversation ID and loads it via the context.

### Bug 5: Image Upload Not Sent to API

**Symptom:** User uploads an image and asks a question, but the AI responds "I don't see any image."

**Root Cause:** Two issues:
1. The `ConversationContext.sendMessage` built the messages array but didn't include `images` from the current message properly
2. The `formatMessagesForOpenAI` function didn't parse the `images` field (which could be a JSON string from the DB)

**Fix:**
- Frontend: Added proper image parsing when building allMessages in ConversationContext
- Backend: Added `parseImages()` helper that handles both arrays and JSON strings
- Updated all three provider formatters (Anthropic, OpenAI, Gemini) to use the safe parser

### Bug 6: Port Already In Use (EADDRINUSE)

**Symptom:** `Error: listen EADDRINUSE: address already in use :::3001`

**Root Cause:** Previous server process still running on port 3001.

**Fix:** Kill the existing process before starting: `npx kill-port 3001` or use PowerShell to find and kill the process.

### Bug 7: `.env` File Not Found

**Symptom:** `No API key configured` error even though .env file existed.

**Root Cause:** The `.env` file path resolution used `new URL('../../.env', import.meta.url)` which didn't resolve correctly when the server was started from different working directories.

**Fix:** Added multiple path resolution strategies:
```javascript
const paths = [
  resolve(__dirname, '..', '..', '.env'),  // project-root/.env
  resolve(__dirname, '..', '.env'),          // server/.env
  resolve(process.cwd(), '.env'),            // cwd/.env
]
```

---

## Testing Strategy

### Backend Integration Tests (test-server.mjs)

A comprehensive test script was created that validates 19 backend operations:
1. Health check
2. Auth (user retrieval)
3. API key loading verification
4. Model listing
5. Conversation CRUD (create, list, update, pin, delete)
6. Gemini streaming (send message, verify SSE events)
7. Message retrieval
8. Search
9. Folders
10. Projects
11. Settings
12. Prompt library
13. Usage tracking
14. Sharing (create link, retrieve shared view)
15. Frontend build verification

### Browser Testing (Chrome Automation)

Used Claude-in-Chrome MCP tools to test the running application:
- Page rendering and layout
- Message sending and streaming
- Theme toggling
- Settings modal
- Conversation switching
- Code block rendering
- Image upload and multimodal responses

---

## Final Architecture

```
project-root/
  server/
    index.js              # Express entry, dynamic route loading
    db/schema.js          # SQLite schema (11 tables)
    routes/
      auth.js             # User authentication
      conversations.js    # Conversation CRUD
      messages.js         # Message CRUD
      claude.js           # Multi-provider streaming (Gemini/OpenAI/Anthropic)
      artifacts.js        # Artifact management
      folders.js          # Folder organization
      search.js           # Full-text search
      projects.js         # Project management
      settings.js         # User preferences
      prompts.js          # Prompt library
      usage.js            # Usage analytics
      sharing.js          # Conversation sharing
  src/
    App.jsx               # Main layout + routing
    main.jsx              # React entry point
    index.css             # CSS variables + animations
    contexts/             # 4 React contexts
    components/
      layout/             # Header, MainChat
      chat/               # MessageBubble, ChatInput, CodeBlock, etc.
      sidebar/            # Sidebar, ConversationList, FolderTree, etc.
      artifacts/          # ArtifactsPanel, previews (Code/HTML/SVG/Mermaid)
      projects/           # ProjectSelector, ProjectSettings
      modals/             # Settings, Share, Export, CommandPalette, PromptLibrary
      common/             # OnboardingTour
    hooks/                # 4 custom hooks
    pages/                # SharedView
    utils/                # api.js (fetch wrapper + streaming)
  package.json            # Frontend deps
  vite.config.js          # Vite + proxy config
  index.html              # Tailwind CDN + fonts
  .env                    # API keys
  test-server.mjs         # Backend integration tests
```

## Key Stats

- **42+ source files** across frontend and backend
- **35+ React components**
- **12 backend route modules** with 40+ endpoints
- **11 database tables**
- **9 LLM models** across 3 providers
- **19 automated backend tests**
- **5 waves** with 3 running in parallel
- **All 19 tests passing**
