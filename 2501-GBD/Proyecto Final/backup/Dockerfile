FROM alpine:latest

RUN apk add --no-cache postgresql-client bash curl tzdata

RUN cp /usr/share/zoneinfo/America/Bogota /etc/localtime && \
    echo "America/Bogota" > /etc/timezone

RUN mkdir -p /respaldo && chmod -R 777 /respaldo

COPY cron.sh /cron.sh
COPY respaldo_completo.sh /respaldo_completo.sh
COPY respaldo_diario.sh /respaldo_diario.sh

RUN chmod +x /cron.sh /respaldo_completo.sh /respaldo_diario.sh

CMD ["/cron.sh"]