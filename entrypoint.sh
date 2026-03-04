#!/bin/sh
node_modules/.bin/drizzle-kit migrate --config drizzle.config.ts
exec node build/index.js