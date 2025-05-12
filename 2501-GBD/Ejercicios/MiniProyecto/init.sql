-- Crear la base de datos (PostgreSQL ya la crea con POSTGRES_DB)

-- Crear rol y usuario con contraseña segura
CREATE ROLE generador_datos WITH LOGIN PASSWORD 'clave_segura';
GRANT CONNECT ON DATABASE banco TO generador_datos;

CREATE USER mi_usuario WITH PASSWORD 'mi_clave' IN ROLE generador_datos;

-- Crear las tablas
CREATE TABLE IF NOT EXISTS cuentas (
    id_cuenta SERIAL PRIMARY KEY,
    nombre_cliente VARCHAR(255),
    saldo DECIMAL
);

CREATE TABLE IF NOT EXISTS transacciones (
    id_transaccion SERIAL PRIMARY KEY,
    id_cuenta INTEGER,
    tipo_transaccion VARCHAR(10),
    monto DECIMAL,
    fecha_transaccion TIMESTAMP,
    FOREIGN KEY (id_cuenta) REFERENCES cuentas(id_cuenta)
);

-- Otorgar permisos
GRANT INSERT ON TABLE cuentas TO generador_datos;
GRANT INSERT ON TABLE transacciones TO generador_datos;

-- Revocar permisos al público por seguridad
REVOKE ALL ON cuentas, transacciones FROM PUBLIC;

GRANT INSERT, SELECT ON TABLE cuentas TO mi_usuario;
GRANT INSERT, SELECT ON TABLE transacciones TO mi_usuario;
GRANT USAGE, SELECT ON SEQUENCE cuentas_id_cuenta_seq TO mi_usuario;
GRANT USAGE, SELECT ON SEQUENCE transacciones_id_transaccion_seq TO mi_usuario;
