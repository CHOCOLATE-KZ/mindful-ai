# 🧠 IITU Psychology AI Assistant

AI-powered mental health support platform with personalized psychological assistance, mood tracking, and evidence-based exercises.

## 🌟 Features

### 💬 AI Chat Assistant
- Real-time psychological counseling powered by local LM Studio
- RAG (Retrieval-Augmented Generation) with psychology knowledge base
- Context-aware responses based on user history
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
- LM Studio (Local AI inference)
- Ollama (Embeddings - Nomic Embed Text)
- RAG System with vector search

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
3. **Ollama** running on `localhost:11434` with `nomic-embed-text` model
4. **Supabase** project created
5. **Telegram Bot** token (optional)

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

# Telegram Bot (optional)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=YourBotUsername

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Database Setup

```bash
# Run migrations in Supabase SQL Editor
# Execute files from /sql/ folder:
# - notes_table.sql
# - telegram_migration.sql
# - psychology_embeddings.sql
# - psychology_rag_768.sql
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
├── sql/                     # Database migrations
└── telegram-bot-polling.js  # Telegram bot entry
```

## 🔌 API Endpoints

- `POST /api/chat` - AI chat completion
- `GET /api/chat/notes` - Get anchored notes
- `POST /api/notes/analyze` - Analyze note sentiment
- `POST /api/auth/telegram` - Telegram authentication
- `GET /api/profile/stats` - User statistics
- `GET /api/news` - Psychology news feed

## 📊 Database Schema

**Main Tables:**
- `profiles` - User profiles
- `user_settings` - App preferences
- `chat_messages` - Chat history
- `notes` - Daily diary entries
- `test_results` - Exercise results
- `telegram_users` - Telegram integration
- `psychology_embeddings` - RAG knowledge vectors

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
