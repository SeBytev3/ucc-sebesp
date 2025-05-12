-- Crear los esquemas
CREATE SCHEMA clientes;
CREATE SCHEMA prestamos;
CREATE SCHEMA pagos;
CREATE SCHEMA auditoria;

-- Crear la tabla de clientes
CREATE TABLE clientes.clientes (
    cliente_id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    direccion VARCHAR(200),
    telefono VARCHAR(15),
    email VARCHAR(100),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear la tabla de préstamos
CREATE TABLE prestamos.prestamos (
    prestamo_id SERIAL PRIMARY KEY,
    cliente_id INT REFERENCES clientes.clientes(cliente_id) ON DELETE CASCADE,
    monto DECIMAL(10, 2) NOT NULL,
    fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_vencimiento TIMESTAMP,
    tasa_interes DECIMAL(5, 2) NOT NULL,
    estado VARCHAR(50) CHECK (estado IN ('activo', 'pagado', 'moroso')) DEFAULT 'activo'
);

-- Crear la tabla de pagos
CREATE TABLE pagos.pagos (
    pago_id SERIAL PRIMARY KEY,
    prestamo_id INT REFERENCES prestamos.prestamos(prestamo_id) ON DELETE CASCADE,
    monto_pago DECIMAL(10, 2) NOT NULL,
    fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metodo_pago VARCHAR(50)
);

-- Crear la tabla de auditoría
CREATE TABLE auditoria.registro_acciones (
    accion_id SERIAL PRIMARY KEY,
    tabla_afectada VARCHAR(50),
    accion VARCHAR(50),
    descripcion TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario VARCHAR(100)
);

-- Insertar un cliente de ejemplo
INSERT INTO clientes.clientes (nombre, direccion, telefono, email)
VALUES ('Juan Pérez', 'Calle Ficticia 123', '555-1234', 'juan@example.com');