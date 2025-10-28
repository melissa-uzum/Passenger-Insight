#!/usr/bin/env bash
set -euo pipefail

echo "Building & starting containers…"
docker compose up -d --build

echo "Waiting for backend health…"
until curl -fsS http://localhost:${BACKEND_PORT:-8088}/api/health >/dev/null; do
  sleep 1
done

echo "Opening frontend…"
{ open http://localhost:5173 || xdg-open http://localhost:5173 || true; }

echo "Ready: http://localhost:5173 (frontend), http://localhost:${BACKEND_PORT:-8088} (API)"
