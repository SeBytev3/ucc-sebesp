import random
import time
import psycopg
from threading import Thread
from flask import Flask

app = Flask(__name__)

# Variables de entorno (puedes usar os.environ si prefieres leerlas desde .env)
DB_URI = "postgresql://postgres:postgres@postgres:5432/prestamos_db"

# Conexión con reintentos
for i in range(10):
    try:
        conn = psycopg.connect(DB_URI, autocommit=True)
        print("✅ Conectado a PostgreSQL")
        break
    except psycopg.OperationalError:
        print(f"⏳ Reintentando conexión a PostgreSQL ({i+1}/10)...")
        time.sleep(3)
else:
    raise Exception("❌ No se pudo conectar a PostgreSQL después de 10 intentos.")

clientes_nombres = ['Juan Pérez', 'Ana García', 'Carlos López', 'María Fernández']
montos_prestamo = [1000, 2000, 3000, 4000, 5000]

def generar_prestamo():
    nombre = random.choice(clientes_nombres)
    monto = random.choice(montos_prestamo)
    fecha = time.strftime('%Y-%m-%d %H:%M:%S')
    return (nombre, monto, fecha)

def generar_prestamos_aleatorios():
    with conn.cursor() as cursor:
        while True:
            nombre, monto, fecha = generar_prestamo()

            # Obtener cliente_id desde clientes.clientes
            cursor.execute("SELECT cliente_id FROM clientes.clientes WHERE nombre = %s", (nombre,))
            result = cursor.fetchone()
            if not result:
                print(f"❌ Cliente no encontrado: {nombre}")
                continue
            cliente_id = result[0]

            # Insertar préstamo
            cursor.execute(
                "INSERT INTO prestamos.prestamos (cliente_id, monto, fecha_inicio, tasa_interes) VALUES (%s, %s, %s, %s)",
                (cliente_id, monto, fecha, 5.0)
            )
            print(f"💸 Préstamo generado para {nombre}: ${monto} el {fecha}")
            time.sleep(random.randint(1, 3))

Thread(target=generar_prestamos_aleatorios, daemon=True).start()

@app.route('/')
def index():
    return "✅ Sistema de Préstamos Personales en funcionamiento!"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
