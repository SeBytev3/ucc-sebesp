-- Tabla de productos
CREATE TABLE productos (
    producto_id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    precio DECIMAL(10,2) NOT NULL CHECK (precio >= 0)
);

-- Tabla de clientes
CREATE TABLE clientes (
    cliente_id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    direccion VARCHAR(255)
);

-- Tabla de ventas (una venta puede incluir varios productos)
CREATE TABLE ventas (
    venta_id SERIAL PRIMARY KEY,
    cliente_id INT NOT NULL REFERENCES clientes(cliente_id),
    fecha_venta TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla detalle_ventas para relacionar ventas con productos
CREATE TABLE detalle_ventas (
    detalle_id SERIAL PRIMARY KEY,
    venta_id INT NOT NULL REFERENCES ventas(venta_id) ON DELETE CASCADE,
    producto_id INT NOT NULL REFERENCES productos(producto_id),
    cantidad INT NOT NULL CHECK (cantidad > 0),
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0)
);

-- Insertar productos
INSERT INTO productos (nombre, precio) VALUES 
('Laptop HP', 1200000), 
('Mouse Logitech', 25990), 
('Teclado Mecánico Redragon', 45990);

-- Insertar clientes
INSERT INTO clientes (nombre, direccion) VALUES 
('Juan Pérez', 'Calle 123, Ciudad A'),
('María López', 'Avenida 456, Ciudad B');

-- Insertar ventas (transacciones de compra)
INSERT INTO ventas (cliente_id) VALUES 
(1), -- Venta 1: Cliente Juan Pérez
(2); -- Venta 2: Cliente María López

-- Insertar detalles de ventas (productos vendidos en cada venta)
INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, subtotal) VALUES 
(1, 1, 1, 1200.50), -- Juan Pérez compra 1 Laptop HP
(1, 2, 2, 51.98),  -- Juan Pérez compra 2 Mouse Logitech
(2, 3, 1, 45.75);  -- María López compra 1 Teclado Mecánico
