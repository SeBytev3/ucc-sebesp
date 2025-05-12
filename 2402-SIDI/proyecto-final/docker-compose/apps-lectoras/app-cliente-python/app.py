import psycopg2
import time
import random
import signal
import sys

DB_URL = "dbname='proyectofppal' user='postgres' host='db-pg-slave' password='postgres'"

def handle_exit(sig, frame):
    print("\nCliente Python 🐍 ha terminado. ¡Gracias por usar el programa! 👋", flush=True)
    sys.exit(0)

def main():
    # Maneja Ctrl+C
    signal.signal(signal.SIGINT, handle_exit)

    print("Cliente Python 🐍 by Sebastian Espinosa B. 😎", flush=True)
    conn = psycopg2.connect(DB_URL)
    cursor = conn.cursor()

    try:
        while True:
            time.sleep(40)  # Espera fija de 40 segundos

            cursor.execute("SELECT numero_identidad, nombre FROM Tabla2")
            results = cursor.fetchall()
            count = 0

            for row in results:
                if count >= 5:
                    break
                print(f"Resultado: {row[0]} {row[1]}", flush=True)  # `flush=True` fuerza la salida inmediata
                count += 1

            if count == 0:
                print("No se encontraron resultados.", flush=True)

    except Exception as e:
        print(f"Error: {e}", flush=True)

    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    main()
