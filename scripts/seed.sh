#!/usr/bin/env bash
set -euo pipefail

BASE='http://localhost:8088'
TOKEN=$( \curl -sS "$BASE/api/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"admin123"}' | jq -r .token )

post() {
  \curl -sS "$BASE/api/flows" \
    -H "Authorization: Bearer $TOKEN" \
    -H 'Content-Type: application/json' \
    -d "$1" | jq .
}

post '{"station_id":1,"count_in":20,"count_out":10,"source":"manual"}'
post '{"station_id":2,"count_in":15,"count_out":5,"source":"manual"}'
post '{"station_id":3,"count_in":30,"count_out":12,"source":"manual"}'
post '{"station_id":4,"count_in":18,"count_out":22,"source":"manual"}'

echo '— latest —'
\curl -sS "$BASE/api/flows/latest" | jq .
echo '— history —'
\curl -sS "$BASE/api/flows/history?hours=24" | jq .
echo '— incidents —'
\curl -sS "$BASE/api/incidents" | jq .
