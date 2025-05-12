from flask import Flask
import psycopg2

app = Flask(__name__)

@app.route('/')
def hello():
    try:
        conn = psycopg2.connect(
            host="db",
            user="miusuario",
            password="mipassword",
            database="midb"
        )
        cur = conn.cursor()
        cur.execute("SELECT 1")
        result = cur.fetchone()
        cur.close()
        conn.close()
        return f"Conexión a la base de datos exitosa: {result}"
    except Exception as e:
        return f"Error al conectar a la base de datos: {e}"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
