import random
import signal
import time
import datetime
import psycopg2
from colorama import Fore, Style, init

init(autoreset=True) #Inicializar colorama

#Definir tipos de vehículos y tipos de vías
vehiculos = ["Automovil 🚗", "Moto 🛵", "Bus 🚌", "Taxi 🚕", "Camión 🚚", "Bicicleta 🚲"]
vias = ["Calle", "Carrera", "Diagonal", "Transversal"]

#Variable global para controlar la ejecución del bucle
running = True

def generar_info_trafico():
    codigo_aleatorio = random.randint(1000, 9999)
    tipo_vehiculo = random.choice(vehiculos)
    if tipo_vehiculo == "Bicicleta 🚲":
        velocidad = random.randint(0,55)
    else:
        velocidad = random.randint(15,145) #Velocidad en km/h
    hora_actual = datetime.datetime.now().strftime("%H:%M:%S")
    via = random.choice(vias)
    latitud = round(random.uniform(-90.0, 90.0), 6)
    longitud = round(random.uniform(-180.0, 180.0), 6)

    informacion_trafico = {
        "Codigo": codigo_aleatorio,
        "Tipo_de_Vehiculo": tipo_vehiculo,
        "Velocidad": velocidad,
        "Hora": hora_actual,
        "Via": via,
        "Latitud": latitud,
        "Longitud": longitud,
    }

    return informacion_trafico

def imprimir_info_trafico(informacion):
    color = Fore.RED if informacion['Velocidad'] > 80 else Fore.BLUE

    print(color +
          f"{informacion['Codigo']:<8}"
          f"{informacion['Tipo_de_Vehiculo']:<17}"
          f"{informacion['Velocidad']:<18}"
          f"{informacion['Hora']:<12}"
          f"{informacion['Via']:<12}"
          f"{informacion['Latitud']:>12}"
          f"{informacion['Longitud']:>12}" + Style.RESET_ALL)

def insertar_datos_bd(conn, informacion):
    cursor = conn.cursor()
    insert_query = """
    INSERT INTO tabla1 (codigo, tipo_de_vehiculo, velocidad, hora, via, latitud, longitud)
    VALUES (%s, %s, %s, %s, %s, %s, %s)
    """
    cursor.execute(insert_query, (
        informacion['Codigo'],
        informacion['Tipo_de_Vehiculo'],
        informacion['Velocidad'],
        informacion['Hora'],
        informacion['Via'],
        informacion['Latitud'],
        informacion['Longitud']
    ))
    conn.commit()
    cursor.close()

def signal_handler(sig, frame):
    global running
    print("\nPrograma interrumpido por el usuario.")
    running = False

# Registrar el manejador de la señal SIGINT
signal.signal(signal.SIGINT, signal_handler)

conn = psycopg2.connect(
    host="db-pg-ppal",       # Nombre del servicio en docker-compose.yml
    database="proyectofppal",   # Nombre de la base de datos
    user="postgres",            # Usuario de la base de datos
    password="postgres"         # Contraseña de la base de datos
)

#Encabezado de la tabla
print(f"{'Codigo':<7} {'Tipo_de_Vehiculo':<17} {'Velocidad':<17} {'Hora':<11} {'Via':<15} {'Latitud':<12} {'Longitud':<11}")
print("-" * 93)

#Generar información de tráfico cada 0 a 5 segundos
while running:
    informacion = generar_info_trafico()
    imprimir_info_trafico(informacion)
    insertar_datos_bd(conn, informacion)
    tiempo_espera = random.randint(5, 10)
    for _ in range(tiempo_espera):
        if not running:
            break
        time.sleep(1)

# Cerrar la conexión al finalizar
conn.close()