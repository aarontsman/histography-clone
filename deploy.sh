#!/usr/bin/env bash
# deploy.sh — Deploy histography clone to Raspberry Pi 5
#
# Usage:
#   ./deploy.sh [user@]host
#   e.g. ./deploy.sh pi@192.168.1.42
#
set -euo pipefail

TARGET="${1:-}"
if [[ -z "$TARGET" ]]; then
  read -rp "Enter RPi5 address (e.g. pi@192.168.1.42): " TARGET
fi

DEPLOY_DIR="/var/www/histography"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Parse user and host
if [[ "$TARGET" == *@* ]]; then
  RPI_USER="${TARGET%%@*}"
  RPI_HOST="${TARGET##*@}"
else
  RPI_USER="pi"
  RPI_HOST="$TARGET"
fi

echo ""
echo "Deploying to ${RPI_USER}@${RPI_HOST}:${DEPLOY_DIR}"
echo "────────────────────────────────────────────"

# ── 1. Create web root on RPi ──────────────────────────────
echo "[1/4] Creating web root..."
ssh "${RPI_USER}@${RPI_HOST}" "sudo mkdir -p ${DEPLOY_DIR} && sudo chown ${RPI_USER}:${RPI_USER} ${DEPLOY_DIR}"

# ── 2. Sync files ──────────────────────────────────────────
echo "[2/4] Syncing files..."
rsync -az --delete \
  --exclude='*.py' \
  --exclude='deploy.sh' \
  --exclude='.git' \
  --exclude='__pycache__' \
  --exclude='*.md' \
  --exclude='data/' \
  "${SCRIPT_DIR}/" "${RPI_USER}@${RPI_HOST}:${DEPLOY_DIR}/"

# ── 3. Install & configure nginx ──────────────────────────
echo "[3/4] Configuring nginx..."
ssh "${RPI_USER}@${RPI_HOST}" bash << REMOTE
set -e

# Install nginx if missing
if ! command -v nginx &>/dev/null; then
  echo "  Installing nginx..."
  sudo apt-get update -qq
  sudo apt-get install -y -qq nginx
fi

# Write site config
sudo tee /etc/nginx/sites-available/histography > /dev/null << 'NGINX'
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    root ${DEPLOY_DIR};
    index index.html;
    server_name _;

    location / {
        try_files \$uri \$uri/ =404;
    }

    # Never cache the app files so updates are instant
    location ~* \.(html|css|js)$ {
        expires -1;
        add_header Cache-Control "no-store, no-cache, must-revalidate";
    }

    # Cache images and data with a short TTL
    location ~* \.(json|png|jpg|svg|ico)$ {
        expires 10m;
        add_header Cache-Control "public";
    }

    # Disable access log for favicon/robots
    location = /favicon.ico { log_not_found off; access_log off; }
    location = /robots.txt  { log_not_found off; access_log off; }
}
NGINX

# Enable site, disable default
sudo ln -sf /etc/nginx/sites-available/histography /etc/nginx/sites-enabled/histography
sudo rm -f /etc/nginx/sites-enabled/default

# Test config and reload
sudo nginx -t 2>&1
sudo systemctl reload nginx
sudo systemctl enable nginx
REMOTE

# ── 4. Done ────────────────────────────────────────────────
echo "[4/4] Done!"
echo ""
echo "  App is live at:  http://${RPI_HOST}/"
echo ""
echo "  Optional: to download more events (requires internet on RPi):"
echo "    ssh ${RPI_USER}@${RPI_HOST}"
echo "    cd ${DEPLOY_DIR} && python3 fetch_data.py"
echo "    # (first run: sudo apt install python3-requests)"
