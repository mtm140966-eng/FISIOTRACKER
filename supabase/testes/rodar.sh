#!/usr/bin/env bash
# Roda migrações, seed e testes num banco Postgres vazio.
# Uso: supabase/testes/rodar.sh "postgresql://usuario@host:porta/banco_vazio"
set -euo pipefail
cd "$(dirname "$0")/.."
URL="$1"
psql "$URL" -q -v ON_ERROR_STOP=1 -f testes/simular_supabase.sql
for m in migrations/*.sql; do psql "$URL" -q -v ON_ERROR_STOP=1 -f "$m"; done
psql "$URL" -q -v ON_ERROR_STOP=1 -f seed.sql
psql "$URL" -q -v ON_ERROR_STOP=1 -f testes/testes.sql 2>&1 | sed -n 's/.*NOTICE:  //p'
