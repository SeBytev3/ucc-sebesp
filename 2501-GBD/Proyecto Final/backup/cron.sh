#!/bin/bash

# Tareas cron: respaldo completo y respaldo incremental cada 2 minutos
echo "*/2 * * * * /respaldo_completo.sh >> /respaldo/log.txt 2>&1" > /etc/crontabs/root
echo "*/2 * * * * /respaldo_diario.sh >> /respaldo/log.txt 2>&1" >> /etc/crontabs/root

# Iniciar cron
crond -f