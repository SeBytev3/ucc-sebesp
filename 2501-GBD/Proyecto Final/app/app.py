import random
import time
import psycopg
from threading import Thread
from flask import Flask

app = Flask(__name__)

# URI hardcodeada, como estaba originalmente
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

def generar_pago(prestamo_id, monto_total):
    monto_pago = random.randint(100, int(monto_total))
    fecha_pago = time.strftime('%Y-%m-%d %H:%M:%S')
    with conn.cursor() as cursor:
        cursor.execute(
            "INSERT INTO pagos.pagos (prestamo_id, monto_pago, fecha_pago, metodo_pago) VALUES (%s, %s, %s, %s)",
            (prestamo_id, monto_pago, fecha_pago, "efectivo")
        )
        print(f"✅ Pago de ${monto_pago} registrado para préstamo {prestamo_id}")

def simular_prestamos_y_pagos():
    with conn.cursor() as cursor:
        while True:
            nombre, monto, fecha = generar_prestamo()
            cursor.execute("SELECT cliente_id FROM clientes.clientes WHERE nombre = %s", (nombre,))
            result = cursor.fetchone()
            if not result:
                print(f"❌ Cliente no encontrado: {nombre}")
                continue
            cliente_id = result[0]
            # Fecha de vencimiento aleatoria entre 30 y 180 días desde hoy
            fecha_vencimiento = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time() + random.randint(86400*30, 86400*180)))
            cursor.execute(
                "INSERT INTO prestamos.prestamos (cliente_id, monto, fecha_inicio, fecha_vencimiento, tasa_interes) VALUES (%s, %s, %s, %s, %s) RETURNING prestamo_id",
                (cliente_id, monto, fecha, fecha_vencimiento, 5.0)
            )
            prestamo_id = cursor.fetchone()[0]
            print(f"💸 Préstamo generado para {nombre}: ${monto} con vencimiento {fecha_vencimiento}")

            # Simula un pago aleatorio para ese préstamo
            generar_pago(prestamo_id, monto)

            time.sleep(random.randint(3, 6))

Thread(target=simular_prestamos_y_pagos, daemon=True).start()

@app.route('/')
def index():
    return "✅ Sistema de Préstamos Personales en funcionamiento!"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
