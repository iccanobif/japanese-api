Docker + Mongo deployment:

- MongoDB will run in a separate container and be accessible from the host at localhost:27017 (data persisted in a Docker volume).
- The app container will wait for Mongo to be healthy, then (if `INIT_DB=true`) run the following init scripts:
  - `yarn build-daijirin-intermediate-file`
  - `yarn build-accent-dictionary-intermediate-file`
  - `yarn build-db`
- By default the app exposes port 8085 to the host (http://localhost:8085).

Quick start:

1. Build and start services:
   - `docker compose up --build` (or `docker-compose up --build`)
2. To rebuild and re-run init scripts, set `INIT_DB=true` (default in `docker-compose.yml`). To skip initialization set `INIT_DB=false` in environment or override.

Notes:
- If you prefer to run init only once, you can set `INIT_DB=false` and run the init commands manually against the running Mongo instance.
- If you want to connect from host to Mongo, point your client to `mongodb://localhost:27017/japaneseapi`.
