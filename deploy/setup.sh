#!/usr/bin/env bash
# EC2 (Ubuntu 24.04) 上で実行するセットアップ / 再デプロイ用スクリプト
#   bash setup.sh
set -euo pipefail

FRONT_REPO="https://github.com/itier920-create/notion-clone2.git"
API_REPO="https://github.com/kurushiba/notion-clone-api.git"
APP_DIR="$HOME/app"

# --- swap (1GB メモリだと Vite ビルドが落ちるため) ---
if ! swapon --show | grep -q /swapfile; then
  sudo fallocate -l 2G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
fi

# --- パッケージ ---
if ! command -v node >/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
fi
sudo apt-get update
sudo apt-get install -y nodejs nginx git build-essential python3
command -v pm2 >/dev/null || sudo npm install -g pm2

mkdir -p "$APP_DIR"

# --- コード取得 (初回 clone / 2回目以降 pull) ---
fetch() {
  if [ -d "$2/.git" ]; then git -C "$2" pull --ff-only; else git clone "$1" "$2"; fi
}
fetch "$FRONT_REPO" "$APP_DIR/front"
fetch "$API_REPO" "$APP_DIR/api"

# --- API ---
cd "$APP_DIR/api"
if [ ! -f .env ]; then
  echo "JWT_SECRET=$(openssl rand -hex 32)" > .env
fi
mkdir -p data uploads
npm ci
pm2 delete notion-api >/dev/null 2>&1 || true
pm2 start "npx ts-node -r tsconfig-paths/register --transpile-only src/index.ts" --name notion-api
pm2 save
sudo env PATH="$PATH" pm2 startup systemd -u "$USER" --hp "$HOME" >/dev/null

# --- フロント ---
cd "$APP_DIR/front"
npm ci
VITE_API_URL=/api npm run build
sudo mkdir -p /var/www/notion-clone
sudo rm -rf /var/www/notion-clone/*
sudo cp -r dist/* /var/www/notion-clone/

# --- Nginx ---
sudo cp "$APP_DIR/front/deploy/nginx.conf" /etc/nginx/sites-available/notion-clone
sudo ln -sf /etc/nginx/sites-available/notion-clone /etc/nginx/sites-enabled/notion-clone
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

IP=$(curl -s -H "X-aws-ec2-metadata-token: $(curl -s -X PUT http://169.254.169.254/latest/api/token -H 'X-aws-ec2-metadata-token-ttl-seconds: 60')" http://169.254.169.254/latest/meta-data/public-ipv4 || true)
echo
echo "✓ デプロイ完了: http://${IP:-<EC2のパブリックIP>}/"
