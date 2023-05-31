#!/bin/sh

# Sleep for 20 seconds
sleep 20

# Run database migration using alembic
alembic -x db_username=$DOMINO_DB_USER -x db_password=$DOMINO_DB_PASSWORD -x db_host=$DOMINO_DB_HOST -x db_name=$DOMINO_DB_NAME upgrade heads