# Claude.ai Clone

A full-featured clone of Anthropic's [claude.ai](https://claude.ai) chat interface with multi-provider AI support. Built with React/Vite, Node.js/Express, and SQLite.

https://github.com/user-attachments/assets/PLACEHOLDER-VIDEO-ID

## Features

- **Multi-Provider AI** — Supports Google Gemini, OpenAI, and Anthropic models (9 models total)
- **Streaming Responses** — Real-time word-by-word output via Server-Sent Events
- **Image Upload** — Multi-modal support across all providers
- **Code Blocks** — Syntax highlighting for 180+ languages with copy button
- **Artifacts Panel** — Side panel for code, HTML, SVG, and Mermaid diagram previews with versioning
- **Conversation Management** — Create, rename, pin, archive, duplicate, delete, and search conversations
- **Projects** — Organize conversations into color-coded projects with custom instructions
- **Folders** — Drag-and-drop folder organization
- **Sharing** — Generate public/private share links with expiry
- **Settings** — Theme (dark/light), font size, message density, custom instructions, usage dashboard
- **Prompt Library** — Browse, create, and reuse prompt templates
- **Command Palette** — Quick navigation with Ctrl/Cmd+K
- **Export** — Download conversations as JSON or Markdown
- **Mobile Responsive** — Collapsible sidebar overlay on small screens
- **Accessibility** — ARIA labels, keyboard navigation, reduced motion, high contrast

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 5, Tailwind CSS (CDN) |
| Backend | Node.js, Express |
| Database | SQLite (better-sqlite3) |
| AI Providers | Google Gemini, OpenAI, Anthropic |
| Streaming | Server-Sent Events (SSE) |
| Markdown | react-markdown, remark-gfm, highlight.js |

## Prerequisites

- Node.js 18+
- An API key from at least one provider:
  - [Google AI Studio](https://aistudio.google.com/apikey) (Gemini)
  - [OpenAI](https://platform.openai.com/api-keys)
  - [Anthropic](https://console.anthropic.com/)

## Installation

```bash
# Clone the repository
git clone https://github.com/az9713/claude-ai-clone.git
cd claude-ai-clone

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

## Configuration

Create a `.env` file in the project root with your API key(s):

```env
GEMINI_API_KEY=your-gemini-key-here
ANTHROPIC_API_KEY=your-anthropic-key-here
OPENAI_API_KEY=your-openai-key-here
```

You only need one key — the app will show models for whichever providers are configured.

## Running

Open two terminals:

```bash
# Terminal 1 — Backend (port 3001)
node server/index.js

# Terminal 2 — Frontend (port 5173)
npm run dev
```

Open **http://localhost:5173** in your browser.

## Supported Models

| Provider | Models |
|----------|--------|
| **Gemini** | Flash Lite (default), 2.5 Flash, 2.5 Pro, 2.0 Flash |
| **Anthropic** | Sonnet 4.5, Haiku 4.5, Opus 4.1 |
| **OpenAI** | GPT-4o, GPT-4o Mini, o3-mini |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Enter` | Send message |
| `Shift + Enter` | New line |
| `Ctrl/Cmd + K` | Command palette |
| `Ctrl/Cmd + N` | New chat |
| `Ctrl/Cmd + /` | Toggle sidebar |
| `Ctrl/Cmd + Shift + S` | Toggle settings |

## Project Structure

```
├── server/
│   ├── index.js              # Express server entry point
│   ├── db/schema.js          # SQLite schema (11 tables)
│   └── routes/               # 12 route modules (40+ endpoints)
├── src/
│   ├── App.jsx               # Main layout + routing
│   ├── contexts/             # Auth, Theme, Conversation, Project
│   ├── components/
│   │   ├── chat/             # MessageBubble, ChatInput, CodeBlock
│   │   ├── sidebar/          # Sidebar, ConversationList, FolderTree
│   │   ├── artifacts/        # ArtifactsPanel, previews (Code/HTML/SVG/Mermaid)
│   │   ├── modals/           # Settings, Share, Export, CommandPalette
│   │   └── projects/         # ProjectSelector, ProjectSettings
│   ├── hooks/                # useConversations, useArtifacts, useProjects
│   └── pages/                # SharedView
├── docs/
│   ├── DEVELOPMENT_JOURNEY.md  # Wave-based build approach + bug fixes
│   ├── FEATURES.md             # Comprehensive feature documentation
│   └── app_spec.txt            # Original specification
└── .env                        # API keys (not committed)
```

## How It Was Built

This project was built from the [app_spec.txt](https://github.com/anthropics/claude-quickstarts/blob/main/autonomous-coding/prompts/app_spec.txt) specification using Claude Code's 1M token context window (Opus 4.6) with a **wave-based parallel agent approach**:

1. **Wave 0** — Foundation + core chat (built directly)
2. **Waves 1, 2, 3** — Sidebar, artifacts, and settings (3 agents in parallel)
3. **Wave 4** — Sharing, polish, and integration

Three agents ran simultaneously, each owning a distinct area of the codebase (left column, right column, header+modals), completing the entire application in a single session. See [docs/DEVELOPMENT_JOURNEY.md](docs/DEVELOPMENT_JOURNEY.md) for the full story.

## Acknowledgements

**App Specification:** [app_spec.txt](https://github.com/anthropics/claude-quickstarts/blob/main/autonomous-coding/prompts/app_spec.txt) from Anthropic's claude-quickstarts repository.

**Inspiration:** Leon van Zyl's video **"5x More Context in Claude Code - Here's How to Actually Use It"**:

[![YouTube Video](https://img.shields.io/badge/YouTube-Watch%20Video-red?style=for-the-badge&logo=youtube)](https://www.youtube.com/watch?v=lt-wKINAMuw)

The video demonstrates how to leverage Claude Code's extended context window to build large applications using parallel agent teams — the exact approach used to build this clone.

## License

MIT
