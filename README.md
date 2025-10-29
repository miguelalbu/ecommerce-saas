# Ecommerce SaaS

Projeto fullstack de exemplo (SaaS e-commerce) com automações e API em Node.js + Prisma no backend e frontend em Vite + React + TypeScript.

## Visão Geral

Este repositório contém um e-commerce completo pensado para ser facilmente usado como base SaaS: gerencia produtos, categorias, clientes, carrinho, checkout e pedidos. O backend usa Node.js, Express e Prisma (ORM). O frontend é uma SPA em React + Vite com TypeScript.

Principais características:
- Autenticação com JWT
- Prisma como ORM (migrations e client)
- Uploads de imagens (pasta `backend/uploads/`)
- Estrutura separada de `backend/` e `frontend/`
- Scripts e automações para desenvolvimento e produção


## Tecnologias

Backend:
- Node.js
- Express
- Prisma (Postgres / SQLite)
- bcryptjs (hash de senhas)
- jsonwebtoken (JWT)

Frontend:
- React + TypeScript
- Vite
- Tailwind CSS

Banco de dados:
- PostgreSQL recomendado em produção
- SQLite disponível para desenvolvimento rápido (configurável via `DATABASE_URL`)


## Estrutura do projeto

- `/backend` - código do servidor (Express + Prisma)
  - `src/` - controllers, rotas, middleware
  - `prisma/` - schema e migrations
  - `uploads/` - imagens enviadas
- `/frontend` - app React + Vite


## Pré-requisitos

- Node.js (>= 18 recomendado)
- npm ou pnpm
- Git
- Um servidor de banco de dados (Postgres) ou usar SQLite local


## Variáveis de ambiente (exemplo)

Crie um arquivo `.env` na raiz do `backend/` com as variáveis mínimas:

```
# Backend - .env
DATABASE_URL="postgresql://USER:PASS@HOST:PORT/DATABASE?schema=public"
# ou para sqlite (dev rápido):
# DATABASE_URL="file:./dev.db"

JWT_SECRET="uma-string-muito-secreta-e-longa"
PORT=3000

# Opcional: configurações de storage, e-mail, etc.
```

Observação: é recomendável criar um arquivo `.env.example` contendo as chaves sem valores para referência.


## Instalação e execução (desenvolvimento)

Execute os passos a seguir no seu terminal (zsh no Windows/WSL funciona igual a bash):

### Backend

```bash
cd backend
npm install
# gerar o prisma client
npx prisma generate
# rodar migrations (dev) - cria/atualiza o DB
npx prisma migrate dev --name init
# iniciar em modo dev (assumindo que existe script `dev` no package.json do backend)
npm run dev
```

Se você preferir usar SQLite para testes rápidos, ajuste `DATABASE_URL` para `file:./dev.db` no `.env` antes de rodar `migrate dev`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

O frontend normalmente roda em `http://localhost:5173` (padrão Vite) e o backend em `http://localhost:3000`.


## Comandos Prisma úteis

No diretório `backend`:

- Gerar client: `npx prisma generate`
- Criar migration e aplicá-la (dev): `npx prisma migrate dev --name <nome>`
- Aplicar migrations (deploy/CI): `npx prisma migrate deploy`
- Abrir studio (UI): `npx prisma studio`
- Mostrar esquema: `npx prisma db pull` (quando sincronizar com DB existente)

As migrations já presentes em `backend/prisma/migrations/` mostram o histórico do schema.


## Scripts npm (sugestões)

No `backend/package.json` - garanta scripts parecidos com:

```json
{
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "migrate": "npx prisma migrate dev",
    "prisma:generate": "npx prisma generate"
  }
}
```

No `frontend/package.json` já deve existir `dev`, `build` e `preview` (Vite).


## Endpoints principais (resumo)

O backend contém rotas organizadas em `backend/src/routes/`. Exemplos:

- POST /api/users       — criar usuário
- POST /api/auth/login  — login (retorna JWT)
- GET  /api/products    — listar produtos públicos
- GET  /api/products/:id— detalhes do produto
- POST /api/checkout    — criar pedido
- GET  /api/orders      — rotas protegidas por JWT (pedidos do usuário / admin)

Consulte os arquivos em `backend/src/routes/` para a lista completa.


## Autenticação

- O backend fornece login com JWT (veja `backend/src/controllers/userController.js`).
- Proteja rotas com middleware que verifica `Authorization: Bearer <token>`.


## Testes

Se houver testes (veja `backend/package.json` e `frontend/package.json`), rode:

```bash
# backend
cd backend
npm test

# frontend
cd frontend
npm test
```


## CI/CD (sugestão rápida)

Um workflow básico do GitHub Actions deve:
1. Instalar Node
2. Instalar dependências (backend e frontend)
3. Rodar `npx prisma migrate deploy` (ou `migrate diff` conforme o fluxo)
4. Rodar testes
5. Build e deploy

(Se quiser, posso adicionar um `/.github/workflows/ci.yml` de exemplo.)


## Deploy

- Backend: containerize (Docker) ou deploy em serviços como Azure App Service, Heroku, Render, Railway.
- Certifique-se de definir `DATABASE_URL` e `JWT_SECRET` no ambiente do serviço.
- Aplicar `npx prisma migrate deploy` no momento do deploy.


## Boas práticas / Notas

- Nunca commit `*.env` ou chaves secretas; use secrets do provedor (GitHub/CI).
- Use backups e migrações revisadas para produção.
- Valide uploads e sanitize nomes/paths.


## Próximos passos que posso fazer pra você

- Criar `.env.example` com chaves mínimas.
- Documentar rotas detalhadas (exemplos de request/response).
- Adicionar workflow de CI/CD para GitHub Actions.
- Gerar um `README` em inglês também.


---

Se desejar, atualizo o `README` com mais detalhes específicos (ex.: endpoints completos e exemplos curl).
