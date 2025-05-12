import random
import time
import psycopg
from threading import Thread
from flask import Flask

app = Flask(__name__)

# Conexión a la base de datos PostgreSQL
conn = psycopg.connect(
    host="postgres",
    dbname="prestamos_db",
    user="postgres",
    password="postgres"
)
cursor = conn.cursor()

# Lista de clientes y montos
clientes = ['Juan Pérez', 'Ana García', 'Carlos López', 'María Fernández']
montos_prestamo = [1000, 2000, 3000, 4000, 5000]

# Función para generar datos aleatorios de préstamos
def generar_prestamo():
    cliente = random.choice(clientes)
    monto = random.choice(montos_prestamo)
    fecha = time.strftime('%Y-%m-%d %H:%M:%S')
    return (cliente, monto, fecha)

# Hilo de ejecución para generar préstamos aleatorios
def generar_prestamos_aleatorios():
    while True:
        prestamo = generar_prestamo()
        cursor.execute("INSERT INTO prestamos.prestamos (cliente_id, monto, fecha_inicio, tasa_interes) VALUES (%s, %s, %s, %s)",
                       (prestamo[0], prestamo[1], prestamo[2], 5.0))  # tasa de interés fija para simplificar
        conn.commit()
        print(f"Préstamo generado: {prestamo}")
        time.sleep(random.randint(1, 3))  # Simula un intervalo aleatorio entre inserciones

# Iniciar hilo de generación de préstamos
Thread(target=generar_prestamos_aleatorios).start()

# Ruta de prueba para asegurarse de que la app está corriendo
@app.route('/')
def index():
    return "Sistema de Préstamos Personales en funcionamiento!"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)