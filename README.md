# ctf-platform
A mini CTF (Capture the Flag) platform with an admin side and a user side.

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
### Load front end in a web browser:
```
http://localhost:3000
```
### Additional commands:
If you want to seed the database with some demo data, make sure the docker container is running, and in another window run:
```
docker compose exec backend npm run seed:demo
```
To run test suite:
```
docker compose up --build backend_test
```