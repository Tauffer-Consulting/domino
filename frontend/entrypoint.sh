#!/bin/sh
set -e

echo "DOMINO_DEPLOY_MODE=$DOMINO_DEPLOY_MODE" >> .env.production
echo "API_URL=$API_URL" >> .env.production

/usr/share/nginx/html/import-meta-env -x .env.production -p /usr/share/nginx/html/index.html || exit 1

nginx -g "daemon off;"
