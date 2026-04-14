# Multi-stage build для MindfulAI
# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем package.json и lock file
COPY package*.json ./

# Инсталируем dependencies
RUN npm ci

# Копируем исходный код
COPY . .

# Build-time fallback values to avoid failing static analysis when local env is absent.
ARG NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY=dummy-anon-key
ARG SUPABASE_SERVICE_ROLE_KEY=dummy-service-role-key
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY

# Собираем Next.js приложение
RUN npm run build

# Stage 2: Runtime
FROM node:20-alpine

WORKDIR /app

# Копируем только необходимые файлы из builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

# Копируем src и другие нужные директории для runtime
COPY src ./src
COPY psychology_knowledge ./psychology_knowledge

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Expose порт
EXPOSE 3000

# Environment
ENV NODE_ENV=production
ENV PORT=3000

# Стартовая команда
CMD ["npm", "start"]
