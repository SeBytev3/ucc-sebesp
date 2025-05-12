import random
import time
import psycopg2

def generar_numero_identidad():
    return random.randint(1_000_000_000, 1_999_999_999)

def generar_nombre():
    nombres = [
        "Juan", "Carlos", "Luis", "Andrés", "Jorge", 
        "Sofía", "María", "Ana", "Camila", "Luisa"
    ]
    return random.choice(nombres)

def generar_apellido():
    apellidos = [
        "Gómez", "Martínez", "Rodríguez", "López", "García",
        "Hernández", "Pérez", "Sánchez", "Torres", "Ramírez"
    ]
    return random.choice(apellidos)

def generar_datos():
    numero_identidad = generar_numero_identidad()
    nombre = generar_nombre()
    apellido = generar_apellido()
    return {
        "numero_identidad": numero_identidad,
        "nombre": nombre,
        "apellido": apellido
    }

def insertar_datos_bd(conn, registro):
    cursor = conn.cursor()
    insert_query = """
    INSERT INTO tabla2 (numero_identidad, nombre, apellido)
    VALUES (%s, %s, %s)
    """
    cursor.execute(insert_query, (
        registro['numero_identidad'],
        registro['nombre'],
        registro['apellido']
    ))
    conn.commit()
    cursor.close()

if __name__ == "__main__":
    print("Generando datos automáticamente cada 5 segundos. Presiona Ctrl+C para detener.")
    conn = psycopg2.connect(
        host="db-pg-ppal",         # Nombre del servicio en docker-compose.yml
        database="proyectofppal",
        user="postgres",
        password="postgres"
    )

    try:
        while True:
            registro = generar_datos()
            print(f"Número de identidad: {registro['numero_identidad']}, Nombre: {registro['nombre']}, Apellido: {registro['apellido']}")
            insertar_datos_bd(conn, registro)
            time.sleep(5)
    except KeyboardInterrupt:
        print("\nGeneración de datos detenida.")
    finally:
        conn.close()
