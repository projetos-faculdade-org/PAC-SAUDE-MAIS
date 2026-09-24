# Jaraguá Mais Saudável

Projeto do PAC para a ORG Saúde Mais — plataforma onde empresas se cadastram, são
aprovadas pela organização e publicam atividades de saúde.

**Stack:** React + Vite + TypeScript (front) · Express + Prisma (back) · PostgreSQL

## Pré-requisitos

- [Docker](https://www.docker.com/products/docker-desktop/) (com Docker Compose)
- Node.js 20+ (só para o modo de desenvolvimento)

## Como rodar

Tudo é feito pelo `make`. Rode `make` sem argumentos para ver a lista de comandos.

### Desenvolvimento — `make dev`

Sobe o Postgres em Docker e roda backend e frontend localmente com hot reload:

```bash
make dev
```

| Serviço  | URL                     |
| -------- | ----------------------- |
| Frontend | http://localhost:5173   |
| Backend  | http://localhost:3000   |
| Postgres | localhost:5432          |

Na primeira execução o comando cria os `.env` a partir dos exemplos, instala as
dependências e aplica as migrations — não precisa de nenhum passo manual antes.

`Ctrl+C` encerra back e front. O banco continua rodando; use `make down` para parar.

### Produção / demonstração — `make deploy`

Builda e sobe os três serviços em Docker, com o nginx servindo o front e fazendo
proxy da API em `/api`:

```bash
make deploy
```

| Serviço   | URL                    |
| --------- | ---------------------- |
| Aplicação | http://localhost       |
| API       | http://localhost/api   |

## Login do admin

O admin entra pela mesma tela das empresas (`/login`) e é levado direto para o
painel administrativo. A conta é criada automaticamente na primeira subida do
backend, com os valores de `ADMIN_EMAIL` / `ADMIN_PASSWORD` do `.env`:

```
admin@jaraguamaissaudavel.com / admin123!
```

## Outros comandos

| Comando                       | O que faz                                            |
| ----------------------------- | ---------------------------------------------------- |
| `make`                        | Lista todos os comandos                              |
| `make install`                | Instala as dependências do front e do back           |
| `make down`                   | Para os containers (os dados do banco são mantidos)  |
| `make restart`                | Rebuilda e sobe tudo de novo                         |
| `make logs`                   | Acompanha os logs dos containers                     |
| `make ps`                     | Mostra o estado dos containers                       |
| `make migrate`                | Aplica as migrations pendentes                       |
| `make migration name=xyz`     | Cria uma nova migration                              |
| `make seed`                   | Cria o usuário admin no banco                        |
| `make studio`                 | Abre o Prisma Studio                                 |
| `make psql`                   | Abre um shell psql no banco                          |
| `make reset`                  | **Apaga** o banco e recria do zero                   |
| `make clean`                  | Remove containers, volumes, `node_modules` e builds  |

## Variáveis de ambiente

Os arquivos de exemplo são versionados; `make dev` e `make deploy` copiam o que
faltar automaticamente.

| Arquivo             | Usado por                                      |
| ------------------- | ---------------------------------------------- |
| `.env`              | docker-compose (banco, JWT, admin)             |
| `backend/.env`      | backend rodando local (`make dev`)             |
| `.env.local`        | frontend rodando local — `VITE_API_URL`        |

Em produção, troque `JWT_SECRET` (`openssl rand -hex 32`), `POSTGRES_PASSWORD`,
`ADMIN_PASSWORD` e ajuste `CORS_ORIGIN` para o domínio real.

## Observação sobre portas

`make dev` e `make deploy` disputam a porta 3000. O `make dev` já para os
containers de app automaticamente antes de subir. No sentido inverso, encerre o
`make dev` com `Ctrl+C` antes de rodar `make deploy`.
