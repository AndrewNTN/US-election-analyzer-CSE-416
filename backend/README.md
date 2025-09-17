# Install & Run

## What’s included right now
- Node/Express API
- MongoDB seed script (loads CA/FL/OR)
- `.env` with defaults:  
  `MONGO_URI=mongodb://127.0.0.1:27017` · `DB_NAME=cse416` · `PORT=3001`
- API endpoints:
  - `GET /api/health`
  - `GET /api/states`
  - `GET /api/states/:usps/summary` (stub)

---

## macOS Setup (Homebrew)

1) Install & start MongoDB:
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0
mongosh --eval 'db.runCommand({ ping: 1 })'   # expect { ok: 1 }

2) Install Node deps (from repo root):
npm install
npm install dotenv

3. Ensure .env exists (should already be in repo):
cat .env
# MONGO_URI=mongodb://127.0.0.1:27017
# DB_NAME=cse416
# PORT=3001

4) Seed & run:
npm run seed
npm run api

5) Quick Test (in a new terminal)
curl http://localhost:3001/api/health
curl http://localhost:3001/api/states
curl http://localhost:3001/api/states/CA/summary


## Windows Setup (Docker)

1. Install Docker Desktop.
2. Create a minimal compose file (from repo root):

docker-compose.yml
services:
  mongo:
    image: mongo:7
    container_name: cse416-mongo
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.runCommand({ ping: 1 })"]
      interval: 10s
      timeout: 5s
      retries: 5
volumes:
  mongo_data:

3. docker compose up -d

4. run npm scripts
npm install
npm install dotenv
npm run seed
npm run api

5. Quick Test (in a new terminal)
curl http://localhost:3001/api/health
curl http://localhost:3001/api/states
curl http://localhost:3001/api/states/CA/summary


