#!/bin/bash

# Tareas cron: respaldo completo semanal (domingo), respaldo diario (lunes a sábado)
echo "0 3 * * 0 /respaldo_completo.sh >> /respaldo/log.txt 2>&1" > /etc/crontabs/root
echo "0 3 * * 1-6 /respaldo_diario.sh >> /respaldo/log.txt 2>&1" >> /etc/crontabs/root

# Iniciar cron
crond -f