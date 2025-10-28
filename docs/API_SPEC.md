# API Spec

## GET /api/health

- 200 { status: 'ok' }

## GET /api/stations

- 200 { data: Station[] }

## POST /api/stations

- Body: { code, name }
- 201 { message: 'created' }

## GET /api/flows/latest

- 200 { data: [{ name, in_total, out_total }] }

## POST /api/flows

- Body: { station_id, count_in?, count_out?, timestamp? }
- 201 { message: 'created' }

## GET /api/incidents

- 200 { data: Incident[] }

## POST /api/incidents

- Body: { severity ('info'|'warning'|'critical'), message }
- 201 { message: 'logged' }
