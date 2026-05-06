# 🧠 IITU Psychology AI Assistant

AI-powered mental health support platform with personalized psychological assistance, mood tracking, and evidence-based exercises.

## 🌟 Features

### 💬 AI Chat Assistant
- Real-time psychological counseling powered by local LM Studio
- 3 response modes: LISTENING, ANALYSIS, GUIDANCE (auto-selected per user intent)
- Safety pipeline: hard-block filters, crisis trigger detection, and response validation
- RAG (Retrieval-Augmented Generation) with psychology knowledge base and keyword fallback
- Consent-aware personalization based on profile, recent notes, and message history
- Voice input support for accessibility

### 📊 Analytics Dashboard
- Mood tracking with interactive charts
- Test results analysis (Beck Depression, Anxiety scales, etc.)
- Weekly summaries and insights
- Topic-based emotional analysis

### 📝 Daily Notes & Diary
- Quick mood check-ins
- Activity tracking and rating
- Weekly mood calendar visualization
- AI-powered analysis of emotional patterns

### 🧘 Psychological Exercises
- Evidence-based tests: Beck Depression Inventory, Hamilton Anxiety Scale, PSS-10
- Interactive breathing exercises
- Progressive muscle relaxation guides
- Personalized recommendations based on results

### 🤖 Telegram Bot Integration
- Daily mood reminders via Telegram
- Chat directly from Telegram
- Push notifications for journaling
- Seamless authentication sync

### 🌐 Multi-language Support
- Russian, English, Kazakh
- Real-time UI translation
- Localized content and exercises

## 🛠️ Tech Stack

**Frontend:**
- Next.js 16.0.1 (App Router)
- React 19.2.0
- Tailwind CSS
- Lucide Icons

**Backend & AI:**
- LM Studio (local OpenAI-compatible inference)
- Prompt orchestration with dynamic mode classification
- RAG system via Supabase RPC + keyword fallback
- Optional Ollama integration (alternative local provider)

**Database:**
- Supabase (PostgreSQL + Auth)
- Vector storage for embeddings (pgvector)

**Integrations:**
- Telegram Bot API (node-telegram-bot-api)
- Voice Recognition API

**Development:**
- ESLint (custom config)
- Git for version control

## 🚀 Getting Started

### Prerequisites

1. **Node.js** 18+ installed
2. **LM Studio** running on `localhost:1234`
3. **Supabase** project created
4. **Telegram Bot** token (optional)

### Installation

```bash
# Clone repository
git clone <your-repo-url>
cd diplomaproject

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your credentials
```

### Environment Variables

Create `.env.local` with:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# LM Studio
LMSTUDIO_BASE_URL=http://127.0.0.1:1234
LMSTUDIO_MODEL=gpt-oss-20b
LMSTUDIO_TIMEOUT_MS=15000
LMSTUDIO_TEMPERATURE=0.6

# Optional chat mode tuning
LM_MODE_LISTENING_TEMPERATURE=0.78
LM_MODE_LISTENING_MAX_TOKENS=180
LM_MODE_ANALYSIS_TEMPERATURE=0.5
LM_MODE_ANALYSIS_MAX_TOKENS=360
LM_MODE_GUIDANCE_TEMPERATURE=0.3
LM_MODE_GUIDANCE_MAX_TOKENS=520

# RAG controls
ENABLE_PSYCHOLOGY_RAG=true
RAG_LIMIT=3
RAG_MIN_QUERY_LENGTH=8
LMSTUDIO_EMBED_MODEL=text-embedding-nomic-embed-text-v1.5

# Optional Ollama (if used)
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.1

# Telegram Bot (optional)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=YourBotUsername

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Database Setup

```bash
# Database schema is managed directly in Supabase.
# Run required SQL statements in Supabase SQL Editor for your environment.
```

### Load Psychology Knowledge Base

```bash
# Generate embeddings for RAG system
node scripts/load-psychology-embeddings.mjs

# Test search functionality
node scripts/test-knowledge-search.mjs
```

### Run Development Server

```bash
# Start Next.js
npm run dev

# Start Telegram Bot (separate terminal)
npm run telegram:poll
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
diplomaproject/
├── src/
│   ├── app/
│   │   ├── (app)/           # Protected routes
│   │   │   ├── analytics/   # Analytics dashboard
│   │   │   ├── chat/        # AI chat interface
│   │   │   ├── exercises/   # Psychological tests
│   │   │   ├── notes/       # Daily diary
│   │   │   └── profile/     # User settings
│   │   ├── (public)/        # Public pages
│   │   ├── api/             # API routes
│   │   └── layout.js        # Root layout
│   ├── components/          # React components
│   ├── lib/                 # Utilities & configs
│   │   ├── supabase/        # Supabase client
│   │   ├── lmStudioClient.js # AI integration
│   │   └── knowledge-search.js # RAG search
│   └── data/                # Static data & prompts
├── psychology_knowledge/    # Knowledge base (MD files)
├── scripts/                 # Utility scripts
└── telegram-bot-polling.js  # Telegram bot entry
```

## 🔌 API Endpoints

- `POST /api/chat` - AI chat completion
- `POST /api/chat/clear` - Clear user chat history
- `GET /api/chat/notes` - Get anchored notes
- `POST /api/chat/notes` - Save anchored note
- `POST /api/notes/analyze` - Analyze note sentiment
- `POST /api/ai/profile-report` - Generate AI profile/weekly report
- `GET /api/ai/profile-report` - Get saved AI reports
- `GET /api/rag-debug` - Debug psychology knowledge retrieval
- `POST /api/auth/telegram` - Telegram authentication
- `GET /api/profile/stats` - User statistics
- `GET /api/news` - Psychology news feed

## 📊 Database Schema

**Main Tables:**
- `profiles` - User profiles
- `user_settings` - App preferences
- `ai_messages` - AI chat history
- `notes` - Daily diary entries
- `tests_log` - Exercise/test results
- `ai_reports` - Generated profile and weekly reports
- `telegram_users` - Telegram integration
- `psychology_knowledge` - RAG knowledge chunks

## 🧪 Testing

```bash
# Lint code
npm run lint

# Build for production
npm run build

# Test RAG integration
node scripts/verify-rag-integration.mjs
```

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Run production build
- `npm run lint` - Run ESLint
- `npm run telegram:poll` - Start Telegram bot

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open Pull Request

## 📄 License

This project is part of IITU diploma work.

## 👥 Authors

IITU Psychology AI Team

## 🙏 Acknowledgments

- Psychology knowledge base compiled from evidence-based resources
- AI models powered by LM Studio and Ollama
- UI inspired by modern mental health apps
