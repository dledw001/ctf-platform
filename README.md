# ctf-platform
A mini CTF (Capture the Flag) platform with public challenges, authenticated submissions, and an admin dashboard.
---
## Architecture
- Frontend: Next.js with React, Bootstrap 5 styling, client-side auth context
- Backend: Node.js with Express, JWT auth in HttpOnly cookies
- Database: PostgreSQL via Docker, schema managed with node-pg-migrate
- Authentication: Email/password (bcrypt) and JWT stored in secure cookies
- Features: User registration/login, browse challenges, flag submissions, scoreboard, admin dashboard with CRUD for challenges
- Docker: `docker-compose.yml` orchestrates frontend, backend, database
- Tests: Jest and Supertest for auth/challenges/submissions/scoreboard
> Flags are salted with a pepper (FLAG_PEPPER env var) before hashing, ensuring flags are never stored in plaintext.
---
## Requirements
- Docker
- Git
---
## Quick Start
### 1. Clone and enter the repo:
```
git clone https://github.com/dledw001/ctf-platform.git
cd ctf-platform
```
### 2. Launch stack:
```
docker compose up --build frontend
```
### 3. (Optional) Load demo data:
From another terminal window, in the project root:
```
docker compose exec backend npm run seed:demo
```
- Creates users admin@example.com, user1@example.com, user2@example.com (password for all: changeme)
- Inserts three sample challenges and a few submissions from each user.
> Important: Demo seeing is guarded by ALLOW_SEED_DEMO env var. In `docker-compose.yml`, it is set to `true` for reviewer convenience. Set ALLOW_SEED_DEMO to `false` in production deployments.

### 4. Create your own admin user:
```
docker compose exec backend npm run create-admin -- you@email.com password
```
- Promotes the user if they already exist, otherwise creates a new admin user.
### 5. Open the app:
Visit http://localhost:3000 in a browser.
- Guests can browse challenges, view challenge details, view the scoreboard.
- Authenticated users can submit flags; correct submissions add points to their score.
- Admin users have access to a dropdown nav item and can create/edit/delete challenges and view all submissions.
---
## Environment Variables
`docker-compose.yml` sets sane defaults for local testing. Override them via .env or otherwise.
- DATABASE_URL: PostgreSQL connection string
- JWT_SECRET: Secret used to sign JWTs
- FLAG_PEPPER: Appended to flags before hashing
- COOKIE_SECURE: Set to `true` in HTTPS/production deployments
- ALLOW_SEED_DEMO: Must be `true` to allow demo seeding
- PORT: Backend HTTP port (mapped to 4000 in Docker)
> For any hosted deployment, set unique values for JWT_SECRET and FLAG_PEPPER, and run with COOKIE_SECURE=true so cookies are only sent over HTTPS.
---
## Testing
### To run the backend test suite:
```
docker compose up --build backend_test
```