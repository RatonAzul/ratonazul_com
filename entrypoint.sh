#!/bin/sh
set -e

echo "Running Drizzle migrations..."
node_modules/.bin/drizzle-kit push --config=drizzle.config.ts

echo "Starting app..."
exec node build/index.js