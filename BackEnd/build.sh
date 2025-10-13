#!/usr/bin/env bash
# build.sh

set -o errexit

echo "=== Installation des dépendances ==="
pip install -r requirements.txt

echo "=== Application des migrations ==="
python manage.py migrate

echo "=== Collecte des fichiers static ==="
python manage.py collectstatic --noinput

echo "=== Build terminé avec succès ==="
