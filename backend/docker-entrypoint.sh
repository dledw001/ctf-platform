#!/bin/sh

set -e

echo "Waiting for PostgreSQL..."
until nc -z db 5432; do
  sleep 1
done
echo "PostgreSQL is up."

echo "Running migrations..."
npm run migrate:dev

echo "Starting app..."
npm run start