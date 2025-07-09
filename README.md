# Customer Analysis Dashboard

## Setup Commands

**1. Start Database (WSL Terminal):**
```bash
docker-compose up -d
```

**2. Install Dependencies (WSL Terminal):**
```bash
npm install --legacy-peer-deps
```

**3. Start Development Server (WSL Terminal):**
```bash
npm run dev
```

**4. Access Application:**
- App: http://localhost:3000
- PgAdmin: http://localhost:8080

## Database Management

**Stop Database:**
```bash
docker-compose down
```

**Reset Database:**
```bash
docker-compose down -v && docker-compose up -d
```

**View Database Logs:**
```bash
docker-compose logs -f postgres
```