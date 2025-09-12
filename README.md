# NBA Chatbot

A full-stack NBA chatbot web application powered by Node.js, PostgreSQL, Redis, and React. Ask questions about NBA stats, players, and teams, and get instant answers with caching and rate limiting.

## Features

- **Frontend:** React (Vite), Tailwind CSS, modern UI
- **Backend:** Node.js (Express, TypeScript), PostgreSQL, Redis caching
- **Database:** NBA stats, player, and team data
- **Rate Limiting:** Prevents abuse with express-rate-limit
- **Dockerized:** Easy to run locally with Docker Compose

---

## Quick Start (Local Development)

### Prerequisites

- [Docker](https://www.docker.com/get-started) & [Docker Compose](https://docs.docker.com/compose/)
- (Optional) [Node.js](https://nodejs.org/) & [npm](https://www.npmjs.com/) if you want to run frontend/backend separately

### 1. Clone the Repository

```sh
git clone https://github.com/Joel-Tai/NBA-Chatbot.git
cd NBA-Chatbot
```

### 2. Environment Variables

- Copy and edit the example `.env` files as needed:
  - `mcp-client-typescript/.env` (backend)
  - `db/.env` (PostgreSQL, if needed)

**Example for backend (`mcp-client-typescript/.env`):**

```
DATABASE_URL=postgresql://postgres:password@db:5432/yourdbname
REDIS_URL=redis://redis:6379
ANTHROPIC_API_KEY=your_anthropic_api_key
PORT=4000
```

### 3. Start All Services (Recommended)

This will start the database, backend, Redis, and frontend:

```sh
docker compose up --build
```

- Frontend: [http://localhost](http://localhost)
- Backend API: [http://localhost:4000/api](http://localhost:4000/api)
- PostgreSQL: port 5433 (default user: `postgres`)
- Redis: port 6379

### 4. (Optional) Run Frontend/Backend Separately

- **Frontend:**
  ```sh
  cd frontend
  npm install
  npm run dev
  ```
- **Backend:**
  ```sh
  cd mcp-client-typescript
  npm install
  npm run dev
  ```

### 5. Database Setup

- The database is initialized from `db/mydatabase.sql` on first run.
- If you need the `unaccent` extension for PostgreSQL, connect to the DB and run:
  ```sql
  CREATE EXTENSION IF NOT EXISTS unaccent;
  ```

---

## Troubleshooting

- **Redis connection errors:** Ensure `REDIS_URL` is set to `redis://redis:6379` in Docker, or `redis://localhost:6379` if running locally.
- **PostgreSQL errors:** Make sure the DB is running and credentials match your `.env`.
- **unaccent not working:** Run `CREATE EXTENSION unaccent;` in your database.
- **Port conflicts:** Change the ports in `docker-compose.yml` as needed.

---

## Project Structure

```
NBA-Chatbot/
├── db/                  # PostgreSQL Dockerfile and SQL
├── frontend/            # React app (Vite, Tailwind)
├── mcp-client-typescript/ # Node.js backend (Express, TypeScript)
├── docker-compose.yml   # Multi-service orchestration
└── ...
```

---

## License

MIT

---

## Author

Joel Tai
