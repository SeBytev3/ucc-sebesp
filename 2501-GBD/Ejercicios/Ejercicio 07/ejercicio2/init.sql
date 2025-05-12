--APLICAR LA 1 FORMA NORMAL

-- Eliminar tablas si existen para evitar errores
DROP TABLE IF EXISTS pagos_peaje, peajes, vehiculos, conductores CASCADE;

-- Crear tabla de Conductores
CREATE TABLE conductores (
    conductor_id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    direccion VARCHAR(255) NOT NULL
);

-- Crear tabla de Vehículos
CREATE TABLE vehiculos (
    vehiculo_id SERIAL PRIMARY KEY,
    conductor_id INT NOT NULL REFERENCES conductores(conductor_id) ON DELETE CASCADE,
    marca VARCHAR(50) NOT NULL,
    modelo VARCHAR(50) NOT NULL
);

-- Crear tabla de Peajes
CREATE TABLE peajes (
    peaje_id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    valor DECIMAL(10,2) NOT NULL CHECK (valor >= 0)
);


-- Aplicando la 2FN. En la tabla pagos_peaje, el monto depende del peaje_id y no del vehiculo_id.
-- Se debe eliminar la dependencia parcial del valor del peaje, ya que este siempre debe estar en la tabla peajes.
-- Se debe asegurar que la tabla pagos_peaje solo almacene las relaciones entre vehículos y peajes con fecha.

-- Crear tabla de Pagos de Peaje
CREATE TABLE pagos_peaje (
    pago_id SERIAL PRIMARY KEY,
    vehiculo_id INT NOT NULL REFERENCES vehiculos(vehiculo_id) ON DELETE CASCADE,
    peaje_id INT NOT NULL REFERENCES peajes(peaje_id) ON DELETE CASCADE,
    fecha_pago DATE NOT NULL
);


-- Aplicando la 3FN. La dirección del conductor depende del nombre, pero no del ID del conductor.
-- Se soluciona asegurando que cada campo depende únicamente de la clave primaria. La dirección ya está correctamente ubicada en la tabla conductores.

-- Insertar datos de prueba en Conductores
INSERT INTO conductores (nombre, direccion) VALUES
('Juan Pérez', 'Calle 123'),
('Ana García', 'Calle 456'),
('Carlos López', 'Calle 789');

-- Insertar datos de prueba en Vehículos
INSERT INTO vehiculos (conductor_id, marca, modelo) VALUES
(1, 'Toyota', 'Corolla'),
(2, 'Honda', 'Civic'),
(3, 'Ford', 'Focus');

-- Insertar datos de prueba en Peajes
INSERT INTO peajes (nombre, valor) VALUES
('Peaje A', 10.00),
('Peaje B', 15.00),
('Peaje C', 20.00);

-- Insertar datos de prueba en Pagos de Peaje
INSERT INTO pagos_peaje (vehiculo_id, peaje_id, fecha_pago) VALUES
(1, 1, '2025-07-01'), -- Juan Pérez (Toyota Corolla) - Peaje A
(1, 2, '2025-07-01'), -- Juan Pérez (Toyota Corolla) - Peaje B
(2, 1, '2025-07-02'), -- Ana García (Honda Civic) - Peaje A
(2, 3, '2025-07-02'), -- Ana García (Honda Civic) - Peaje C
(3, 2, '2025-07-03'); -- Carlos López (Ford Focus) - Peaje B

-- Mostrar datos insertados
SELECT * FROM conductores;
SELECT * FROM vehiculos;
SELECT * FROM peajes;
SELECT * FROM pagos_peaje;
