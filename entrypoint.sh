#!/bin/sh
set -e

echo "Running Drizzle migrations..."
npx drizzle-kit push

echo "Starting app..."
exec node build/index.js