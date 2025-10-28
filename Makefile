.PHONY: up down logs seed health fresh restart

up:
	docker compose up -d --build

down:
	docker compose down -v

logs:
	docker compose logs -f --tail=120

seed:
	curl -s -X POST http://localhost:8088/api/flows -H 'Content-Type: application/json' -d '{"station_id":1,"count_in":220,"count_out":160,"source":"manual"}' && \
	curl -s -X POST http://localhost:8088/api/flows -H 'Content-Type: application/json' -d '{"station_id":2,"count_in":340,"count_out":60}'

health:
	curl -s http://localhost:8088/api/health && echo && curl -I http://localhost:5173 | head -n1

fresh:
	make down && make up

restart:
	docker compose restart backend frontend
