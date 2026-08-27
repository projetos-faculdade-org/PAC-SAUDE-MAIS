# ==============================================================================
#  Jaraguá Mais Saudável — atalhos de desenvolvimento e deploy
#
#  make          → lista todos os comandos
#  make dev      → banco no Docker + backend e frontend com hot reload
#  make deploy   → tudo no Docker (banco + backend + frontend em http://localhost)
# ==============================================================================

SHELL   := /bin/bash
COMPOSE := docker compose
DB      := saude-db

.DEFAULT_GOAL := help
.PHONY: help env install dev dev-stop-app deploy up down restart logs ps db db-wait api-wait \
        migrate migration seed studio psql reset clean

# ------------------------------------------------------------------ ajuda ----

help: ## Mostra esta ajuda
	@echo ""
	@echo "  Jaraguá Mais Saudável — comandos disponíveis"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*## .*$$' Makefile \
		| awk 'BEGIN {FS = ":.*## "}; {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'
	@echo ""

# ------------------------------------------------------------------ setup ----

env: ## Cria os arquivos .env a partir dos exemplos (se ainda não existirem)
	@[ -f .env ]         || { cp .env.example .env;                 echo "✓ .env criado"; }
	@[ -f backend/.env ] || { cp backend/.env.example backend/.env; echo "✓ backend/.env criado"; }
	@[ -f .env.local ]   || { echo "VITE_API_URL=http://localhost:3000" > .env.local; echo "✓ .env.local criado"; }

install: node_modules backend/node_modules ## Instala as dependências do front e do back

node_modules: package.json
	@echo "→ Instalando dependências do frontend..."
	@npm install
	@touch node_modules

backend/node_modules: backend/package.json
	@echo "→ Instalando dependências do backend..."
	@cd backend && npm install && npx prisma generate
	@touch backend/node_modules

# ----------------------------------------------------------- desenvolvimento -

dev: env install dev-stop-app db migrate ## Sobe tudo para desenvolver (banco no Docker, back e front com hot reload)
	@echo ""
	@echo "  ┌────────────────────────────────────────────┐"
	@echo "  │  Frontend   http://localhost:5173          │"
	@echo "  │  Backend    http://localhost:3000          │"
	@echo "  │  Postgres   localhost:5432                 │"
	@echo "  └────────────────────────────────────────────┘"
	@echo ""
	@echo "  Login admin: $$(grep -E '^ADMIN_EMAIL=' .env | cut -d= -f2-)"
	@echo "  Ctrl+C encerra back e front (o banco segue de pé — use 'make down')"
	@echo ""
	@trap 'kill 0' INT TERM; \
	 ( cd backend && npm run dev ) & \
	 npm run dev & \
	 wait

dev-stop-app:
	@if [ -n "$$($(COMPOSE) ps -q backend frontend 2>/dev/null)" ]; then \
		echo "→ Parando os containers de app (liberando as portas 3000 e 80)..."; \
		$(COMPOSE) stop backend frontend >/dev/null 2>&1; \
	fi

# ------------------------------------------------------------------ deploy ---

deploy: env ## Sobe TUDO em Docker (build + up): app em http://localhost
	@$(COMPOSE) up -d --build
	@$(MAKE) --no-print-directory db-wait api-wait
	@echo ""
	@echo "  ┌────────────────────────────────────────────┐"
	@echo "  │  Aplicação  http://localhost               │"
	@echo "  │  API        http://localhost/api           │"
	@echo "  └────────────────────────────────────────────┘"
	@echo ""
	@$(COMPOSE) ps

up: ## Sobe os containers já buildados (sem rebuild)
	@$(COMPOSE) up -d
	@$(MAKE) --no-print-directory db-wait api-wait
	@$(COMPOSE) ps

down: ## Para e remove os containers (os dados do banco são preservados)
	@$(COMPOSE) down

restart: down deploy ## Rebuilda e sobe tudo de novo

logs: ## Acompanha os logs dos containers (Ctrl+C para sair)
	@$(COMPOSE) logs -f

ps: ## Mostra o estado dos containers
	@$(COMPOSE) ps

# ------------------------------------------------------------------ banco ----

db: ## Sobe apenas o Postgres e espera ficar pronto
	@$(COMPOSE) up -d db
	@$(MAKE) --no-print-directory db-wait

db-wait:
	@printf "→ Aguardando o Postgres"
	@until [ "$$(docker inspect -f '{{.State.Health.Status}}' $(DB) 2>/dev/null)" = "healthy" ]; do \
		printf "."; sleep 1; \
	done
	@echo " pronto!"

api-wait:
	@printf "→ Aguardando a API (migrations)"
	@n=0; until curl -sf http://localhost:3000/health >/dev/null 2>&1; do \
		n=$$((n+1)); \
		if [ $$n -gt 90 ]; then echo " tempo esgotado — veja 'make logs'"; exit 1; fi; \
		printf "."; sleep 1; \
	done
	@echo " pronto!"

migrate: ## Aplica as migrations pendentes
	@cd backend && npx prisma migrate deploy

migration: ## Cria uma nova migration (uso: make migration name=add_campo_x)
	@[ -n "$(name)" ] || { echo "Informe o nome: make migration name=add_campo_x"; exit 1; }
	@cd backend && npx prisma migrate dev --name $(name)

seed: ## Cria o usuário admin no banco
	@cd backend && npm run db:seed

studio: ## Abre o Prisma Studio (http://localhost:5555)
	@cd backend && npm run db:studio

psql: ## Abre um shell psql dentro do container do banco
	@$(COMPOSE) exec db sh -c 'psql -U "$$POSTGRES_USER" -d "$$POSTGRES_DB"'

reset: ## APAGA o banco (volume) e recria do zero com as migrations
	@printf "Isso vai APAGAR todos os dados do banco. Continuar? [s/N] "; \
	 read ans; [ "$$ans" = "s" ] || { echo "Cancelado."; exit 1; }
	@$(COMPOSE) down -v
	@$(MAKE) --no-print-directory db migrate seed

# ------------------------------------------------------------------ limpeza --

clean: ## Remove containers, volumes, node_modules e builds
	@$(COMPOSE) down -v --remove-orphans
	@rm -rf node_modules dist backend/node_modules backend/dist
	@echo "✓ Limpo"
