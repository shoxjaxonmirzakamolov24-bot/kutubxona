#!/bin/bash
set -e

if [ -z "$GITHUB_TOKEN" ]; then
  echo "Error: GITHUB_TOKEN environment variable is not set."
  echo "Usage: GITHUB_TOKEN=your_token bash scripts/push-to-github.sh"
  exit 1
fi

GITHUB_REPO="https://shoxjaxonmirzakamolov24-bot:${GITHUB_TOKEN}@github.com/shoxjaxonmirzakamolov24-bot/kutubxona.git"

echo "==> Setting git config..."
git config user.email "deploy@kuaf.uz"
git config user.name "KUAF Deploy"

echo "==> Adding/updating remote..."
git remote remove github 2>/dev/null || true
git remote add github "$GITHUB_REPO"

echo "==> Staging all changes..."
git add -A

echo "==> Committing..."
git diff --cached --quiet && echo "Nothing to commit, pushing existing commits..." || git commit -m "Ready for Render.com deployment - Medical Learning Platform KUAF"

echo "==> Pushing to GitHub..."
git push github HEAD:main --force

echo "==> Done! Check: https://github.com/shoxjaxonmirzakamolov24-bot/kutubxona"
