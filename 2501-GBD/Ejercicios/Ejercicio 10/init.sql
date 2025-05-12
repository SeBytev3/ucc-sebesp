-- Crear esquemas
CREATE SCHEMA ventas;
CREATE SCHEMA productos;
CREATE SCHEMA clientes;

-- Crear tabla de clientes en su esquema
CREATE TABLE clientes.clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL
);

-- Crear tabla de productos en su esquema
CREATE TABLE productos.productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    precio DECIMAL(10,2) NOT NULL CHECK (precio >= 0)
);

-- Crear tabla de ventas en su esquema
CREATE TABLE ventas.ventas (
    id SERIAL PRIMARY KEY,
    cliente_id INT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cliente FOREIGN KEY (cliente_id) REFERENCES clientes.clientes(id)
);

-- Crear tabla de detalle de ventas en el esquema de ventas
CREATE TABLE ventas.detalle_ventas (
    id SERIAL PRIMARY KEY,
    venta_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10,2) NOT NULL CHECK (precio_unitario >= 0),
    CONSTRAINT fk_venta FOREIGN KEY (venta_id) REFERENCES ventas.ventas(id),
    CONSTRAINT fk_producto FOREIGN KEY (producto_id) REFERENCES productos.productos(id)
);

-- Insertar datos de prueba
INSERT INTO clientes.clientes (nombre, email) VALUES 
('Juan Pérez', 'juan@example.com'),
('María López', 'maria@example.com');

INSERT INTO productos.productos (nombre, precio) VALUES 
('Laptop', 1200.00),
('Mouse', 25.50),
('Teclado', 45.00);

-- Transacción para registrar una venta con su detalle
BEGIN;
DO $$ 
DECLARE venta_id INT;
BEGIN
    INSERT INTO ventas.ventas (cliente_id) VALUES (1) RETURNING id INTO venta_id;
    INSERT INTO ventas.detalle_ventas (venta_id, producto_id, cantidad, precio_unitario) 
    VALUES (venta_id, 1, 1, 1200.00);
END $$;
COMMIT;

-- Insertar 500 clientes únicos
DO $$ 
BEGIN
    FOR i IN 1..500 LOOP
        INSERT INTO clientes.clientes (nombre, email)
        VALUES ('Cliente_' || i, 'cliente_' || i || '@example.com');
    END LOOP;
END $$;

-- Insertar 50 clientes con nombre 'Juan Pérez'
DO $$ 
BEGIN
    FOR i IN 1..50 LOOP
        INSERT INTO clientes.clientes (nombre, email)
        VALUES ('Juan Pérez', 'juan' || i || '@repeat.com');
    END LOOP;
END $$;

-- Insertar 100 ventas aleatorias para clientes existentes
DO $$
DECLARE
    venta_id INT;
    max_cliente INT;
BEGIN
    SELECT MAX(id) INTO max_cliente FROM clientes.clientes;

    FOR i IN 1..100 LOOP
        INSERT INTO ventas.ventas (cliente_id)
        VALUES (1 + floor(random() * max_cliente)::INT)
        RETURNING id INTO venta_id;

        -- Insertar 2 productos por venta
        INSERT INTO ventas.detalle_ventas (venta_id, producto_id, cantidad, precio_unitario)
        VALUES 
            (venta_id, 1 + floor(random() * 3)::INT, 1 + floor(random() * 5)::INT, 10 + random() * 100),
            (venta_id, 1 + floor(random() * 3)::INT, 1 + floor(random() * 5)::INT, 10 + random() * 100);
    END LOOP;
END $$;

-- Modificar tabla clientes para agregar columna direccion_cliente
ALTER TABLE clientes.clientes ADD COLUMN direccion_cliente VARCHAR(200);

-- Llenar la tabla clientes con 50 registros aleatorios
DO $$ 
DECLARE 
    i INT;
BEGIN
    FOR i IN 1..50 LOOP
        INSERT INTO clientes.clientes (nombre, email, direccion_cliente) 
        VALUES 
        (
            'Cliente ' || i, 
            'cliente' || i || '@example.com', 
            'Calle Aleatoria ' || (i * 2) || ', Ciudad ' || (i * 3)
        );
    END LOOP;
END $$;
