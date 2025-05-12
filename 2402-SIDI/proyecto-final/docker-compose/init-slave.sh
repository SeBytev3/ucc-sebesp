#!/bin/bash
set -e
PG_REPL_USER=replicator
PG_REPL_PASSWORD=pgslave
PG_MASTER_HOST=db-pg-ppal

# Detener PostgreSQL
pg_ctl stop -m fast

# Eliminar datos antiguos
rm -rf /var/lib/postgresql/data/*

# Realizar el backup del maestro
pg_basebackup -h "$PG_MASTER_HOST" -D /var/lib/postgresql/data -U "$PG_REPL_USER" -Fp -Xs -P -R

# Iniciar PostgreSQL en modo esclavo
pg_ctl start
