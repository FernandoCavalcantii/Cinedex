# Cinedex

Catálogo de filmes com busca, avaliações e um painel de métricas de uso.

## Como rodar

A forma de subir o projeto é o Docker Compose. Na primeira vez, ou depois de mudar Dockerfile e dependências:

```bash
docker compose up -d --build
```

No dia a dia:

```bash
docker compose up -d
```

- Interface: http://localhost:5173
- API: http://localhost:8000 (`/docs` e `GET /health`)

Na primeira subida, se o volume do banco ainda estiver vazio, os CSVs de `data/raw/` são carregados. `docker compose down` para os containers e mantém os dados. `docker compose down -v` apaga o volume e a próxima subida carrega os CSVs de novo.

### Sem Docker

A API pede Python 3.11 ou superior. O frontend pede Node 18.19 ou superior, com a API em http://localhost:8000.

```bash
cd backend
python3 -m venv .venv
.venv/bin/pip install -e ".[dev]"
cp .env.example .env
.venv/bin/alembic upgrade head
.venv/bin/python -m app.scripts.seed_catalog
.venv/bin/uvicorn app.main:app --reload
```

```bash
cd frontend
npm install
npm run dev
```

Os testes da API:

```bash
cd backend
.venv/bin/python -m pytest
```

## Funcionalidades

- **Discover.** Três faixas: Catalog, Top Rated e Trending. Top Rated exige pelo menos 3 avaliações. Trending lista os filmes mais abertos, o maior à esquerda.
- **All Movies.** Busca, filtro por gênero e ano, paginação e o cadastro, a edição e a exclusão de filmes.
- **Detalhe.** Sinopse, créditos, pôster e avaliações de 0 a 10. Sem pôster, a tela mostra um cartaz gerado.
- **Admin.** Métricas do catálogo e do uso, exportação desse retrato em CSV, e a atividade recente: avaliações e filmes cadastrados pela tela.

Na carga, aspas escapadas de título e sinopse são desfeitas. Um nome de pessoa que é só um número não entra no crédito. Os CSVs originais não são reescritos.

## API

A referência interativa fica em http://localhost:8000/docs.

- `GET /api/v1/movies` lista com paginação, busca, gênero, ano e ordem (`sort=rating` ou `sort=views`)
- `GET /api/v1/movies/{id}` detalhe
- `POST`, `PUT` e `DELETE /api/v1/movies` cadastro, edição e exclusão
- `GET /api/v1/genres` gêneros
- `GET` e `POST /api/v1/reviews` avaliações
- `GET /api/v1/admin/metrics` métricas
- `GET /api/v1/admin/feed` atividade do Admin
- `POST /api/v1/events` abertura de filme, tempo na tela e busca

## Estrutura

```text
.
├── backend/          # API FastAPI, modelos e migrações Alembic
├── frontend/         # interface Vite + React
├── data/raw/         # CSVs da carga inicial
└── docker-compose.yml
```

O banco padrão é SQLite. As tabelas nascem pelo Alembic. No Docker, o arquivo fica no volume; fora dele, em `backend/rocketlab.db`, ou no caminho de `DATABASE_URL`.
