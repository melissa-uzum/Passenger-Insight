# System Architecture

## Översikt

- React‑frontend (Vite) → Express API → MariaDB
- Docker Compose för orkestrering
- Hälsosond: /api/health (liveness/readiness)

## Datamodell

- station(id, code, name)
- flow(id, station_id, count_in, count_out, timestamp)
- incident(id, severity, message, created_at)

## Flöde

1) Sensor/agent POST:ar till /api/flows
2) Backend skriver till DB
3) Frontend frågar /api/flows/latest och visualiserar
4) Incidenter loggas via /api/incidents

## Livscykel

- Versionslogg i DEPLOYMENT_GUIDE.md
- DB‑migreringar via nya ALTER‑script
