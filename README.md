<a name="readme-top"></a>

# Cinedex

Catálogo de filmes para consultar o acervo, avaliar cada título e acompanhar o uso.

<details>
  <summary>Sumário</summary>
  <ol>
    <li><a href="#sobre-o-projeto">Sobre o projeto</a></li>
    <li>
      <a href="#fluxos">Fluxos</a>
      <ul>
        <li><a href="#catalogo">Catálogo</a></li>
        <li><a href="#detalhe">Detalhe</a></li>
        <li><a href="#busca">Busca</a></li>
        <li><a href="#gestao">Gestão do catálogo</a></li>
        <li><a href="#avaliacao">Avaliação</a></li>
        <li><a href="#admin">Admin</a></li>
      </ul>
    </li>
    <li><a href="#tecnologias">Tecnologias</a></li>
    <li>
      <a href="#como-rodar">Como rodar</a>
      <ul>
        <li><a href="#pre-requisitos">Pré-requisitos</a></li>
        <li><a href="#instalacao">Instalação</a></li>
        <li><a href="#sem-docker">Sem Docker</a></li>
      </ul>
    </li>
    <li><a href="#rotas">Rotas</a></li>
  </ol>
</details>

## Sobre o projeto

O Cinedex é um catálogo de filmes. Dá para percorrer a lista, abrir um título, ler sinopse, créditos e avaliações, e ver a média das notas. Também dá para cadastrar, editar e apagar filmes, e registrar uma nota com uma resenha.

A interface tem três áreas: **Discover**, **All Movies** e **Admin**.

<p align="right"><a href="#readme-top">voltar ao topo</a></p>

## Fluxos

<details>
<summary><h3 id="catalogo">Catálogo</h3></summary>

O Discover abre três faixas: Catalog, Top Rated e Trending. Top Rated só inclui filme com pelo menos 3 avaliações. Trending lista os mais abertos, o maior à esquerda.

All Movies mostra o acervo paginado, de 24 em 24. Dá para filtrar por um ou mais gêneros e por ano.

</details>

<details>
<summary><h3 id="detalhe">Detalhe</h3></summary>

A página do filme mostra sinopse, créditos, pôster e a lista de avaliações, da mais nova para a mais antiga. A média aparece no topo. Sem pôster, entra um cartaz gerado.

</details>

<details>
<summary><h3 id="busca">Busca</h3></summary>

A busca do cabeçalho filtra o catálogo pelo título. Uma pausa curta dispara a busca, e o Enter confirma na hora.

</details>

<details>
<summary><h3 id="gestao">Gestão do catálogo</h3></summary>

O cadastro fica em All Movies. O filme guarda título, diretor, ano, gênero e sinopse, além de duração, status e imagens. O lápis do card abre a edição. Apagar pede uma confirmação.

</details>

<details>
<summary><h3 id="avaliacao">Avaliação</h3></summary>

No detalhe dá para gravar nome, nota de 0 a 10 (um décimo) e uma resenha. A média e a lista atualizam na hora.

</details>

<details>
<summary><h3 id="admin">Admin</h3></summary>

O Admin junta métricas e atividade. As métricas cobrem o tamanho do catálogo, as notas e o uso: filmes mais abertos, buscas, tempo e retorno no dia seguinte. Dá para exportar esse retrato em CSV. A atividade lista avaliações recentes e filmes cadastrados pela tela.

</details>

Na carga inicial, aspas escapadas de título e sinopse são desfeitas. Um nome de pessoa que é só um número não entra no crédito. Os CSVs originais não são reescritos.

<p align="right"><a href="#readme-top">voltar ao topo</a></p>

## Tecnologias

**Front-end.** React, TypeScript e Vite.

**Back-end.** FastAPI e Pytest.

**Banco de dados.** SQLite, com SQLAlchemy e Alembic.

**Execução.** Docker Compose.

<p align="right"><a href="#readme-top">voltar ao topo</a></p>

## Como rodar

### Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) com Docker Compose.

Para rodar fora do Docker:

- Python 3.11 ou superior.
- Node.js 18.19 ou superior.

### Instalação

Na pasta do projeto:

```bash
docker compose up -d --build
```

Nas próximas vezes, `docker compose up -d` basta.

- Interface: http://localhost:5173
- API: http://localhost:8000 (`/docs` e `GET /health`)

Na primeira subida, se o volume do banco ainda estiver vazio, os CSVs de `data/raw/` são carregados. `docker compose down` para os containers e mantém os dados. `docker compose down -v` apaga o volume, e a próxima subida carrega os CSVs de novo.

### Sem Docker

O modelo de variáveis fica em `backend/.env.example`. Fora do Docker, as que importam são `DATABASE_URL` e `BACKEND_CORS_ORIGINS`. O frontend usa `VITE_API_BASE_URL`, com padrão `http://localhost:8000/api/v1`.

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
cp .env.example .env
alembic upgrade head
python -m app.scripts.seed_catalog
uvicorn app.main:app --reload
```

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

Os testes da API, com o ambiente do backend ativo:

```bash
pytest
```

<p align="right"><a href="#readme-top">voltar ao topo</a></p>

## Rotas

A referência interativa fica em http://localhost:8000/docs.

<details>
<summary><h3>Filmes</h3></summary>

- `GET /api/v1/movies` lista paginada, com busca, gênero, ano e ordem (`sort=rating` ou `sort=views`).
- `GET /api/v1/movies/{id}` detalhe.
- `POST /api/v1/movies` cadastro.
- `PUT /api/v1/movies/{id}` edição.
- `DELETE /api/v1/movies/{id}` exclusão.
- `GET /api/v1/genres` gêneros.

</details>

<details>
<summary><h3>Avaliações</h3></summary>

- `GET /api/v1/reviews` avaliações mais recentes.
- `POST /api/v1/reviews` nova avaliação.

</details>

<details>
<summary><h3>Admin e uso</h3></summary>

- `GET /api/v1/admin/metrics` métricas do catálogo e do uso.
- `GET /api/v1/admin/feed` avaliações e filmes cadastrados pela tela.
- `POST /api/v1/events` abertura de filme, tempo na tela e busca.

</details>

<p align="right"><a href="#readme-top">voltar ao topo</a></p>
