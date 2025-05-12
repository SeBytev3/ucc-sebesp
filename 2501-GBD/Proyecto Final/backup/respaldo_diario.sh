#!/bin/sh

DATE=$(date +"%Y%m%d")
YESTERDAY=$(date -d "yesterday" +"%Y-%m-%d")

psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB -t -c \
  "COPY (SELECT * FROM prestamos.prestamos WHERE fecha_inicio::date >= '$YESTERDAY') TO STDOUT WITH CSV HEADER" \
  | gzip > /respaldo/incremental_$DATE.csv.gz

# Eliminar respaldos incrementales de más de 3 días
find /respaldo/ -name "incremental_*.csv.gz" -mtime +3 -exec rm {} \;