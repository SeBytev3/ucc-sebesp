-- Eliminar esquemas si ya existen
DROP SCHEMA IF EXISTS ventas CASCADE;
DROP SCHEMA IF EXISTS clientes CASCADE;

-- Crear esquemas
CREATE SCHEMA ventas;
CREATE SCHEMA clientes;

-- Crear tabla de Clientes en el esquema clientes
CREATE TABLE clientes.clientes (
    cliente_id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL
);

-- Crear tabla de Direcciones en el esquema clientes
CREATE TABLE clientes.direcciones (
    direccion_id SERIAL PRIMARY KEY,
    cliente_id INT NOT NULL REFERENCES clientes.clientes(cliente_id) ON DELETE CASCADE,
    direccion VARCHAR(255) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    pais VARCHAR(100) NOT NULL
);

-- Crear tabla de Productos en el esquema ventas
CREATE TABLE ventas.productos (
    producto_id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    precio DECIMAL(10,2) NOT NULL CHECK (precio > 0)
);

-- Crear tabla de Pedidos en el esquema ventas
CREATE TABLE ventas.pedidos (
    pedido_id SERIAL PRIMARY KEY,
    cliente_id INT NOT NULL REFERENCES clientes.clientes(cliente_id) ON DELETE CASCADE,
    direccion_id INT NOT NULL REFERENCES clientes.direcciones(direccion_id) ON DELETE CASCADE,
    fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de Detalle de Pedidos sin la columna generada
CREATE TABLE ventas.detalle_pedidos (
    detalle_id SERIAL PRIMARY KEY,
    pedido_id INT NOT NULL REFERENCES ventas.pedidos(pedido_id) ON DELETE CASCADE,
    producto_id INT NOT NULL REFERENCES ventas.productos(producto_id) ON DELETE CASCADE,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    subtotal DECIMAL(10,2) NOT NULL
);

-- Insertar datos de prueba en Clientes
INSERT INTO clientes.clientes (nombre, email) VALUES
('Juan Pérez', 'juan.perez@email.com'),
('Ana García', 'ana.garcia@email.com');

-- Insertar datos de prueba en Direcciones
INSERT INTO clientes.direcciones (cliente_id, direccion, ciudad, pais) VALUES
(1, 'Calle 123', 'Bogotá', 'Colombia'),
(2, 'Avenida 456', 'Medellín', 'Colombia');

-- Insertar datos de prueba en Productos
INSERT INTO ventas.productos (nombre, precio) VALUES
('Laptop HP', 1200000),
('Mouse Logitech', 25990),
('Teclado Mecánico', 45750);

-- Insertar datos de prueba en Pedidos
INSERT INTO ventas.pedidos (cliente_id, direccion_id) VALUES
(1, 1),
(2, 2);

-- Insertar datos de prueba en Detalle de Pedidos (Calculando subtotal manualmente)
INSERT INTO ventas.detalle_pedidos (pedido_id, producto_id, cantidad, subtotal) VALUES
(1, 1, 1, 1200000), -- Juan Pérez compra 1 Laptop HP
(1, 2, 2, 51980),  -- Juan Pérez compra 2 Mouse Logitech 
(2, 3, 1, 45750);  -- Ana García compra 1 Teclado Mecánico

-- Crear una vista para calcular el subtotal dinámicamente
CREATE VIEW ventas.vw_detalle_pedidos AS
SELECT dp.detalle_id, dp.pedido_id, dp.producto_id, p.nombre AS producto_nombre, 
       dp.cantidad, (dp.cantidad * p.precio) AS subtotal
FROM ventas.detalle_pedidos dp
JOIN ventas.productos p ON dp.producto_id = p.producto_id;

-- Mostrar datos insertados
SELECT * FROM clientes.clientes;
SELECT * FROM clientes.direcciones;
SELECT * FROM ventas.productos;
SELECT * FROM ventas.pedidos;
SELECT * FROM ventas.detalle_pedidos;
SELECT * FROM ventas.vw_detalle_pedidos;
