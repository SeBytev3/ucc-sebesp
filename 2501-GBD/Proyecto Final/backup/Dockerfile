FROM alpine:latest

RUN apk add --no-cache postgresql-client bash curl

COPY cron.sh /cron.sh
COPY respaldo_completo.sh /respaldo_completo.sh
COPY respaldo_diario.sh /respaldo_diario.sh

RUN chmod +x /cron.sh /respaldo_completo.sh /respaldo_diario.sh

CMD ["/cron.sh"]