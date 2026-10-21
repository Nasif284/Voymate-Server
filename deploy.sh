#!/usr/bin/env bash
set -e

APP_DIR="/home/ubuntu/apps/voymate"
mkdir -p "$APP_DIR"
cd "$APP_DIR"

echo "=== [Voymate Deploy] Ensuring Docker network exists ==="
docker network inspect app-network >/dev/null 2>&1 || docker network create app-network

echo "=== [Voymate Deploy] Authenticating with AWS ECR ==="
aws ecr get-login-password --region ap-southeast-2 | docker login --username AWS --password-stdin 592193419505.dkr.ecr.ap-southeast-2.amazonaws.com

echo "=== [Voymate Deploy] Pulling latest production image ==="
docker compose -f docker-compose.prod.yml pull api

echo "=== [Voymate Deploy] Rolling out updated container ==="
docker compose -f docker-compose.prod.yml up -d --no-deps api

echo "=== [Voymate Deploy] Running database migrations ==="
docker compose -f docker-compose.prod.yml exec -T api doppler run -- npx prisma migrate deploy

echo "=== [Voymate Deploy] Pruning dangling images ==="
docker image prune -f

echo "=== [Voymate Deploy] Successfully completed! ==="
