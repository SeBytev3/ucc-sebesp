from fastapi import FastAPI
from sqlalchemy import create_engine, MetaData, text
from sqlalchemy.orm import sessionmaker

# Configuración de la base de datos
DB_URL = "postgresql://postgres:postgres@db-e11evenn:5432/e11evenn"
engine = create_engine(DB_URL)
metadata = MetaData()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

app = FastAPI()

@app.get("/data")
def read_data():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT * FROM e11evenn"))
        data = [dict(zip(result.keys(), row)) for row in result]
        print("Cliente Python 🐍 by Sebastian Espinosa B. 😎", flush=True)
    return data