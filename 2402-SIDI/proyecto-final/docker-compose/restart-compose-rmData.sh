docker compose down
docker volume rm docker-compose_postgres_ppal_data
docker volume rm docker-compose_postgres_slave_data
docker volume rm docker-compose_pentaho_data_integration_data
docker compose up --build