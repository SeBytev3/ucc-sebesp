import threading
import time
import random
from datetime import datetime
import logging
from sqlalchemy import create_engine, Column, Integer, String, DECIMAL, ForeignKey, TIMESTAMP
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)

# Parámetros de conexión
usuario = os.getenv("DB_USER", "mi_usuario")
clave = os.getenv("DB_PASS", "mi_clave")
host = os.getenv("DB_HOST", "db")
nombre_db = os.getenv("DB_NAME", "banco")
url_conexion = f"postgresql://{usuario}:{clave}@{host}:5432/{nombre_db}"

# Configuración SQLAlchemy
engine = create_engine(url_conexion)
Base = declarative_base()
Session = sessionmaker(bind=engine)

# Modelos
class Cuenta(Base):
    __tablename__ = "cuentas"
    id_cuenta = Column(Integer, primary_key=True)
    nombre_cliente = Column(String)
    saldo = Column(DECIMAL)

class Transaccion(Base):
    __tablename__ = "transacciones"
    id_transaccion = Column(Integer, primary_key=True)
    id_cuenta = Column(Integer, ForeignKey("cuentas.id_cuenta"))
    tipo_transaccion = Column(String)
    monto = Column(DECIMAL)
    fecha_transaccion = Column(TIMESTAMP)

def generar_datos(tiempo_ejecucion):
    inicio_tiempo = time.time()
    session = Session()
    logging.info("Hilo de generación de datos iniciado.")

    while time.time() - inicio_tiempo < tiempo_ejecucion:
        try:
            nombre_cliente = f"Cliente {random.randint(1, 100)}"
            saldo = round(random.uniform(1000, 10000), 2)

            nueva_cuenta = Cuenta(nombre_cliente=nombre_cliente, saldo=saldo)
            session.add(nueva_cuenta)
            session.flush()
            id_cuenta = nueva_cuenta.id_cuenta

            tipo_transaccion = random.choice(["deposito", "retiro"])
            monto = round(random.uniform(100, 1000), 2)
            fecha_transaccion = datetime.now()

            nueva_transaccion = Transaccion(
                id_cuenta=id_cuenta,
                tipo_transaccion=tipo_transaccion,
                monto=monto,
                fecha_transaccion=fecha_transaccion,
            )
            session.add(nueva_transaccion)
            session.commit()

            logging.info(f"Insertado: Cuenta {id_cuenta}, {tipo_transaccion} de ${monto}")
            time.sleep(2)

        except Exception as e:
            logging.error(f"Error al insertar datos: {e}")
            session.rollback()

    session.close()
    logging.info("Generación de datos finalizada.")

def main():
    try:
        tiempo_ejecucion = int(os.getenv("TIEMPO_EJECUCION", "60"))  # por defecto 60 segundos
        hilo_generador = threading.Thread(target=generar_datos, args=(tiempo_ejecucion,))
        hilo_generador.start()
        hilo_generador.join()
    except Exception as e:
        logging.error(f"Error: {e}")

if __name__ == "__main__":
    main()
