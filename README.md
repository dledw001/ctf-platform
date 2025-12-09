# ctf-platform
A mini CTF (Capture the Flag) platform with an admin side and a user side.

## Usage
### Start ctf-platorm:
```aiignore
docker compose up --build frontend
```

If you want to seed the database with some demo data, with the docker container running, in another window:
```aiignore
docker compose exec backend npm run seed:demo
```

To run test suite:
```aiignore
docker compose up --build backend_test
```