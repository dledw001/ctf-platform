# ctf-platform
A mini CTF (Capture the Flag) platform with an admin side and a user side.

## About
- Dockerized application, runs via docker compose.
- Frontend: React.js
- Backend: Node.js with API endpoints
- Database: PostgreSQL (node-pg-migrate handles migrations)
- Cookies:
  - Cookies are configured with httpOnly: true, with sameSite: lax. 
  - Whether they are set to 'secure' or not is controlled by an environment variable, COOKIE_SECURE, in backend/src/routes/auth.js.
  - COOKIE_SECURE: false - for local development / docker-compose on http://localhost
  - COOKIE_SECURE: true - for HTTPS deployment
- Access frontend UI via web browser: http://localhost:3000
- API documentation: https://github.com/dledw001/ctf-platform/wiki/API-Documentation

## Requirements
- Docker

## Usage
### Clone the repo:
```
git clone https://github.com/dledw001/ctf-platform.git
```
### Navigate to ctf-platform directory:
```
cd ctf-platform
```
### Start ctf-platorm:
```
docker compose up --build frontend
```
### Seeding the database with demo data (optional):
From another terminal window, in the project root directory:
```
docker compose exec backend npm run seed:demo
```
This command creates the following demo accounts (email / password):
- admin@example.com / changeme
- user1@example.com / changeme
- user2@example.com / changeme

It also loads a small set of sample challenges and submissions so you can explore the platform without creating everything manually.
#### NOTE ABOUT SEEDING:
The seeding script is enabled by default in the Docker environment for reviewer convenience, but it is intended only for local development.
Production deployments should disable demo seeding by setting `ALLOW_SEED_DEMO: "false"` in `docker-compose.yml`.
When ALLOW_DEMO_SEED is not set to "true", the seed script will refuse to run and will not modify your database.
### For production, admin users can be created as follows:
From another terminal window, in the project root directory:
```
docker compose exec backend npm run create-admin -- <email> <password>
```
This can also be used to promote existing users to admin users.
### Load front end UI in a web browser:
```
http://localhost:3000
```
Users can view challenges, submit flags, and view the scoreboard.  
Admin users can also create, edit, and delete challenges and view user submissions.
## Testing
### To run the backend test suite:
```
docker compose up --build backend_test
```