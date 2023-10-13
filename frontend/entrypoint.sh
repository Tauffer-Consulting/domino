#!/bin/sh
set -e

echo "API_ENV=$API_ENV" >> .env.production
echo "DOMINO_DEPLOY_MODE=$DOMINO_DEPLOY_MODE" >> .env.production

/usr/share/nginx/html/import-meta-env -x .env.production -p /usr/share/nginx/html/index.html || exit 1

nginx -g "daemon off;"
