import psycopg2
import time
import random
import signal
import sys

DB_URL = "dbname='postgres' user='postgres' host='postgres-ppal' password='postgres'"

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
            wait_time = random.randint(1, 10)  # Espera aleatoria entre 1 y 10 segundos
            time.sleep(wait_time)

            cursor.execute("SELECT id, name FROM public.dummy")
            results = cursor.fetchall()

            for row in results:
                print(f"Resultado: {row[0]} {row[1]}", flush=True)  # `flush=True` fuerza la salida inmediata

    except Exception as e:
        print(f"Error: {e}", flush=True)

    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    main()
