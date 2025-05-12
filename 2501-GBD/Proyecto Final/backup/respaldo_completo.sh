#!/bin/sh

DATE=$(date +"%Y%m%d")
pg_dump -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB | gzip > /respaldo/full_$DATE.sql.gz

# Eliminar respaldos completos de más de 3 días
find /respaldo/ -name "full_*.sql.gz" -mtime +3 -exec rm {} \;