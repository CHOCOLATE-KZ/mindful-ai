# 🐳 DOCKER QUICKSTART - MindfulAI

Полная инструкция как запустить проект через Docker.

## 📋 ТРЕБОВАНИЯ

**Обязательно:**
- Docker Desktop установлен (https://docker.com/products/docker-desktop)
- Docker Compose (обычно идет с Docker Desktop)

**Отдельно (не в Docker, но нужны для работы):**
- LM Studio (локально на вашем компьютере)
- Ollama (локально на вашем компьютере)
- Supabase проект (облако)
- Telegram Bot Token (если используете Telegram)

---

## 🚀 БЫСТРЫЙ СТАРТ (5 МИНУТ)

### Шаг 1: Подготовка переменных окружения

```bash
# Скопируйте .env.example в .env.local
cp .env.example .env.local

# Отредактируйте .env.local с вашими данными:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
# - TELEGRAM_BOT_TOKEN (опционально)
# - и другие
```

### Шаг 2: Установите LM Studio (ВНЕ DOCKER)

```bash
# Скачайте с https://lmstudio.ai
# Установите на вашу ОС (Windows/Mac/Linux)

# Откройте LM Studio и сделайте:
1. Перейдите в "Models" → Search
2. Найдите: "gpt-oss-20b" (или другую модель)
3. Нажмите "Download"
4. Дождитесь загрузки (~10GB)
5. Нажмите "▶ Load into Context Window"
6. Проверьте что он слушает на localhost:1234:
   curl http://localhost:1234/v1/models
```

**ВАЖНО:** LM Studio должен ОСТАТЬСЯ ЗАПУЩЕННЫМ во время работы приложения!

### Шаг 3: Установите Ollama (ВНЕ DOCKER)

```bash
# Скачайте с https://ollama.ai
# Установите на вашу ОС

# Откройте терминал и запустите:
ollama serve

# В другом терминале загрузите модель embeddings:
ollama pull nomic-embed-text

# Проверьте что работает:
curl http://localhost:11434/api/tags
```

**ВАЖНО:** Ollama должен ОСТАТЬСЯ ЗАПУЩЕННЫМ во время работы приложения!

### Шаг 4: Запустите приложение через Docker

```bash
# В папке проекта запустите:
docker-compose up

# Первый раз может занять 2-3 минуты (pulling image, installing)
# Дождитесь пока не увидите:
# "Ready in Xms"

# Откройте браузер:
http://localhost:3000
```

**Готово!** Приложение работает.

---

## 📊 АРХИТЕКТУРА

```
Your Computer
│
├─ LM Studio (localhost:1234) ← Запущен вручную
│  └─ GPT-OSS-20B модель
│
├─ Ollama (localhost:11434) ← Запущен вручную
│  └─ Nomic Embed Text модель
│
└─ Docker Container
   └─ Next.js App (localhost:3000)
      ├─ Frontend (React)
      ├─ API handlers
      └─ Telegram Bot

Plus: Supabase (облако)
```

---

## 🛑 ОСТАНОВКА И ПЕРЕЗАГРУЗКА

```bash
# Остановить контейнер:
docker-compose down

# Перезагрузить контейнер:
docker-compose restart

# Полная пересборка (если изменили код):
docker-compose up --build

# Удалить всё (включая образ):
docker-compose down -v
```

---

## 🔧 РАЗВИТИЕ & DEBUG

### Запуск в режиме development

```bash
# Вместо docker-compose.yml используйте:
# (или отредактируйте docker-compose.yml и измените CMD на "npm run dev")

docker-compose -f docker-compose.dev.yml up

# Или просто исправьте docker-compose.yml:
# CMD ["npm", "run", "dev"]
```

### Логирование

```bash
# Смотреть логи приложения:
docker-compose logs -f app

# Смотреть логи с последних 100 строк:
docker-compose logs --tail=100 app

# В другом терминале смотреть обновления в реальном времени:
docker-compose logs -f
```

### Войти в контейнер

```bash
# Открыть shell в контейнере:
docker-compose exec app sh

# Внутри контейнера:
cd /app
npm list          # Увидеть установленные пакеты
ls -la            # Файлы
exit              # Выход
```

---

## ⚙️ ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ

Все в `.env.local`:

```env
# SUPABASE
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx

# LM STUDIO
LMSTUDIO_BASE_URL=http://host.docker.internal:1234
LMSTUDIO_MODEL=gpt-oss-20b

# OLLAMA
OLLAMA_BASE_URL=http://host.docker.internal:11434

# TELEGRAM (опционально)
TELEGRAM_BOT_TOKEN=123456:ABCxyz
TELEGRAM_BOT_USERNAME=YourBotName

# SITE
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# EMAIL (опционально)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
CONTACT_TO=contact@example.com
```

---

## 🐛 TROUBLESHOOTING

### "Cannot connect to LM Studio"

```
Ошибка: "LM Studio error (502): connection refused"

Решение:
1. Убедитесь что LM Studio запущен
2. Проверьте что модель загружена и в "Context"
3. Если на Mac: используйте host.docker.internal (уже в docker-compose.yml)
4. Если на Windows/Linux: может потребоваться изменить на localhost (с флагом --network host)
```

### "Cannot connect to Ollama"

```
Ошибка: "Ollama embeddings недоступны"

Решение:
1. Убедитесь что Ollama запущена (ollama serve)
2. Загрузили модель (ollama pull nomic-embed-text)
3. Проверьте: curl http://localhost:11434/api/tags
```

### "Port 3000 already in use"

```
Ошибка: "error listen EADDRINUSE: address already in use :::3000"

Решение:
# Вариант 1: Измените порт в docker-compose.yml:
ports:
  - "3001:3000"  # Используйте 3001 вместо 3000

# Вариант 2: Убейте процесс что слушает 3000:
lsof -i :3000         # На Mac/Linux
netstat -aon | grep 3000  # На Windows
kill <PID>            # На Mac/Linux
taskkill /PID <PID> /F  # На Windows
```

### "Out of memory"

```
Ошибка: Docker контейнер падает с OOM

Решение:
1. Дайте Docker больше памяти (Settings → Resources)
2. Или уменьшите CHUNK_SIZE в load-psychology-embeddings.mjs
3. Или удалите большие файлы из docker-compose.yml volumes
```

---

## 📦 DOCKER IMAGES

```bash
# Див список собранных образов:
docker images

# Приблизительный размер:
# node:18-alpine              ~150MB
# mindfulai-app               ~300-400MB (с зависимостями)

# Очистить неиспользуемые образы:
docker image prune
```

---

## 🌐 NETWORKING

Docker контейнер может обращаться к сервисам на хосте:

```bash
# На Linux/Mac:
http://host.docker.internal:1234  # LM Studio
http://host.docker.internal:11434 # Ollama

# На Windows (может потребоваться):
http://host.docker.internal:1234
# или
http://localhost:1234  (если используете --network host)
```

---

## 🚀 DEPLOYMENT

### На сервер (e.g., Heroku, Railway, DigitalOcean)

```bash
# 1. Соберите образ:
docker build -t mindfulai:latest .

# 2. Отправьте в registry (e.g., Docker Hub):
docker tag mindfulai:latest username/mindfulai:latest
docker push username/mindfulai:latest

# 3. На сервере:
docker pull username/mindfulai:latest
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=... \
  -e LMSTUDIO_BASE_URL=http://your-lmstudio-server:1234 \
  username/mindfulai:latest
```

---

## 📚 ДОПОЛНИТЕЛЬНО

### Компоха файлы:
- `Dockerfile` - инструкция как собрать образ
- `docker-compose.yml` - конфигурация сервисов
- `.dockerignore` - что НЕ копировать в образ

### Полезные команды:

```bash
# Информация о контейнере:
docker-compose ps
docker inspect <container-id>

# Останавливать и удалять:
docker-compose down -v  # Удалить всё с volumes

# Пересобрать от нуля:
docker system prune -a  # Очистить всё
docker-compose build --no-cache
```

---

## ✅ ПРОВЕРКА ЧТО ВСЕ РАБОТАЕТ

```bash
# 1. Проверьте что контейнер запущен:
docker-compose ps
# STATUS должен быть: Up X minutes

# 2. Проверьте что приложение отвечает:
curl http://localhost:3000

# 3. Проверьте что API работает:
curl http://localhost:3000/api/health

# 4. Проверьте что LM Studio доступен:
curl http://localhost:1234/v1/models

# 5. Проверьте что Ollama доступна:
curl http://localhost:11434/api/tags
```

Если всё вернуло 200 OK - **готово!** 🎉

---

## 📞 ПОМОЩЬ

Если что-то не работает:
1. Проверьте логи: `docker-compose logs -f`
2. Убедитесь что LM Studio + Ollama запущены
3. Проверьте .env.local переменные
4. Перезагрузите Docker: `docker-compose down && docker-compose up --build`
