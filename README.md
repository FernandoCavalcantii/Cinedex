# RocketLab 2026.2 — repositório base

Base inicial para evoluir a atividade do RocketLab 2026.2. Ela preserva a organização do backend,
o modelo relacional do catálogo de filmes em SQLAlchemy 2.0 e o histórico de
migrações com Alembic. A API do catálogo já está exposta e o frontend Vite
lista os filmes e abre o detalhe de cada um.

Os CSVs usados no bootcamp foram organizados dentro do próprio repositório em
`data/raw/`, separados em `bases-1/` e `bases-2/`, para facilitar o uso durante
o desenvolvimento e a futura carga inicial.

> **Nota:** `RocketLab` é apenas o nome de referência desta base. O diretório,
> nome do pacote, título da API e arquivo do banco podem ser renomeados para o
> que preferirem; eles não representam uma exigência da
> estrutura-base.

## Estrutura

```text
.
├── backend/
│   ├── app/
│   │   ├── api/v1/        # ponto de composição dos futuros routers
│   │   ├── core/          # configurações e logging
│   │   ├── db/            # Base ORM, engine e sessões
│   │   └── movies/        # modelos SQLAlchemy do domínio de filmes
│   ├── migrations/        # ambiente e revisões Alembic
│   └── tests/
├── data/
│   └── raw/               # CSVs de apoio do bootcamp
├── frontend/              # app Vite + React + TypeScript
└── README.md
```

## Execução

Requer Python 3.11 ou superior.

```bash
cd backend
python3 -m venv .venv
.venv/bin/pip install -e ".[dev]"
cp .env.example .env
.venv/bin/alembic upgrade head
.venv/bin/python -m app.scripts.seed_catalog
.venv/bin/uvicorn app.main:app --reload
```

## Execução com Docker

Para desenvolvimento multi-plataforma, o repositório já inclui:
- `backend/Dockerfile` para a API FastAPI;
- `frontend/Dockerfile` para a aplicação Vite;
- `docker-compose.yml` para orquestração.

Na primeira vez, ou depois de mudar Dockerfile e dependências:

```bash
docker compose up -d --build
```

No dia a dia:

```bash
docker compose up -d
```

Isso sobe a API, o frontend e, se o volume `rocketlab-data` ainda estiver vazio, a carga dos CSVs. O banco fica nesse volume. `docker compose down` para os containers e mantém os dados. A carga só roda de novo se o volume for removido com `docker compose down -v`.

A API fica em `http://localhost:8000` (`/docs` e `GET /health`). A interface fica em `http://localhost:5173`.

## Frontend

O app também pode subir fora do Docker, com Node 18.19 ou superior, desde que a API esteja em `http://localhost:8000`:

```bash
cd frontend
npm install
npm run dev
```

O cliente HTTP usa `VITE_API_BASE_URL`, com padrão `http://localhost:8000/api/v1`. A home e `/movies` consomem `GET /api/v1/movies` e mostram a faixa de cards. A busca confirmada com Enter filtra `/movies?q=...`. O clique no card abre `/movies/{id}`. Sem pôster, o card mostra um cartaz com a marca do Cinedex e o título.

Na carga, `normalize_catalog_title` desfaz aspas dobradas de escape do CSV só no título do filme. O arquivo original não muda, e um título criado pela API não passa por essa regra.

## API do catalogo

A Fase 2 do backend ja expõe os seguintes endpoints na versao `v1`:
- `GET /api/v1/movies` para listagem paginada e busca;
- `GET /api/v1/movies/{id}` para detalhe completo;
- `POST /api/v1/movies` para cadastro;
- `PUT /api/v1/movies/{id}` para atualização;
- `DELETE /api/v1/movies/{id}` para remoção;
- `POST /api/v1/reviews` para inserir novas avaliacoes.

Os retornos incluem relacionamento com generos, produtoras, pessoas, performance,
resumo de avaliacoes e lista de reviews quando aplicavel.

## Banco de dados e migrações

O modelo usa um esquema estrela para o catálogo de filmes:

- dimensões de filmes, gêneros, pessoas, produtoras e resumo de avaliações;
- fato de desempenho financeiro e de engajamento;
- tabelas de associação N:N entre filmes, gêneros, produtoras e pessoas;

O schema corresponde aos nove arquivos CSV atuais da camada Diamond, com a
adição de `movie_reviews`: uma avaliação individual por linha, na escala 0–10.
A tabela aceita diretamente as colunas `sk_movie_review_id`, `sk_movie_id`,
`nome`, `nota` e `comentario` do CSV enviado separadamente. `created_at` é
gerado pelo banco. O contexto generativo não faz parte desta base.

Os CSVs de apoio ficam em `data/raw/`. A ordem esperada para futura carga é:
primeiro os filmes em `dim_movies`, depois as tabelas auxiliares e por fim o
CSV de `movie_reviews`.

Para refazer a carga inicial em um banco limpo, execute o script de seed
novamente. Ele limpa as tabelas antes de importar os arquivos por padrão.

As tabelas são criadas exclusivamente pelo Alembic. Para evoluir os modelos,
crie uma revisão e aplique-a:

```bash
cd backend
.venv/bin/alembic revision --autogenerate -m "descreva a alteração"
.venv/bin/alembic upgrade head
```

O banco padrão é SQLite local em `backend/rocketlab.db`. Ajuste
`DATABASE_URL` no arquivo `.env` para usar outro banco compatível.
