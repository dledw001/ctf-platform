#!/bin/sh

set -e

echo "Waiting for PostgreSQL..."
until nc -z db 5432; do
  sleep 1
done
echo "PostgreSQL is up."

echo "Running migrations..."
NODE_ENV=production npm run migrate:prod

echo "Starting app..."
NODE_ENV=production npm start