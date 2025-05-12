-- Tabla de categorías
CREATE TABLE categorias (
    categoria_id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

-- Tabla de productos
CREATE TABLE productos (
    producto_id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    precio DECIMAL(10,2) NOT NULL CHECK (precio >= 0),
    categoria_id INT NOT NULL REFERENCES categorias(categoria_id) ON DELETE CASCADE
);

-- Tabla de clientes
CREATE TABLE clientes (
    cliente_id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    direccion VARCHAR(255)
);

-- Tabla de ventas
CREATE TABLE ventas (
    venta_id SERIAL PRIMARY KEY,
    cliente_id INT NOT NULL REFERENCES clientes(cliente_id) ON DELETE CASCADE,
    fecha_venta TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de detalle de ventas
CREATE TABLE detalle_ventas (
    detalle_id SERIAL PRIMARY KEY,
    venta_id INT NOT NULL REFERENCES ventas(venta_id) ON DELETE CASCADE,
    producto_id INT NOT NULL REFERENCES productos(producto_id),
    cantidad INT NOT NULL CHECK (cantidad > 0),
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0)
);
