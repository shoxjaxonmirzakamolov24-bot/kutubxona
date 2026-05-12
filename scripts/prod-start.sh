#!/bin/bash
set -e

echo "==> Pushing database schema..."
pnpm --filter @workspace/db run push-force

echo "==> Seeding admin user..."
pnpm --filter @workspace/scripts run seed

echo "==> Starting API server..."
exec node --enable-source-maps artifacts/api-server/dist/index.mjs
