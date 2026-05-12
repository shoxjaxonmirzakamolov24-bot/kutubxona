#!/bin/bash
set -e

echo "==> Creating upload directory..."
mkdir -p "${UPLOAD_DIR:-/var/data/uploads}"

echo "==> Pushing database schema..."
pnpm --filter @workspace/db run push-force

echo "==> Seeding admin user..."
pnpm --filter @workspace/scripts run seed

echo "==> Starting server..."
exec node --enable-source-maps artifacts/api-server/dist/index.mjs
