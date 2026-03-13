# -------- Stage 1: build frontend --------
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY frontend/package.json ./frontend/package.json
COPY frontend/vite.config.js ./frontend/vite.config.js
COPY frontend/tailwind.config.js ./frontend/tailwind.config.js
COPY frontend/postcss.config.js ./frontend/postcss.config.js
COPY frontend/index.html ./frontend/index.html
COPY frontend/src ./frontend/src
RUN cd frontend && npm install && npm run build

# -------- Stage 2: backend --------
FROM python:3.11-slim AS backend
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# System deps for requests/lxml and selenium (Chromium).
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    gcc \
    libffi-dev \
    libxml2-dev \
    libxslt1-dev \
    chromium \
    chromium-driver \
    fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

COPY backend /app/backend
COPY --from=frontend-builder /app/frontend/dist /app/backend/static

ENV PORT=8000
EXPOSE 8000

CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT}"]

