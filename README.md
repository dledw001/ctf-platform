# ctf-platform
A mini CTF (Capture the Flag) platform with an admin side and a user side.

## About
- Dockerized, runs via docker compose.
- Frontend: React.js
- Backend: Node.js with API endpoints
- Database: PostgreSQL
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
### Load front end UI in a web browser:
```
http://localhost:3000
```
### Demo admin user credentials:
```
email: admin@example.com
password: changeme
```
### Additional commands:
If you want to seed the database with some demo data, make sure the docker container is running, and in another window run:
```
docker compose exec backend npm run seed:demo
```
To run the backend test suite:
```
docker compose up --build backend_test
```