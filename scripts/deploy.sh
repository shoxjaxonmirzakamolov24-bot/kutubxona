#!/bin/bash
set -e

echo "==> Pushing database schema..."
pnpm --filter @workspace/db run push

echo "==> Seeding admin user..."
pnpm --filter @workspace/scripts run seed

echo "==> Pruning pnpm store..."
pnpm store prune

echo "==> Production setup complete!"
