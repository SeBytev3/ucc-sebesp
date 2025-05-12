-- Crear esquemas
CREATE SCHEMA aeropuerto;
CREATE SCHEMA pasajeros;
CREATE SCHEMA vuelos;
CREATE SCHEMA checkins;

-- Tabla de información de pasajeros
CREATE TABLE pasajeros.info (
    pasajero_id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    direccion TEXT NOT NULL
);

-- Tabla de detalles de vuelos
CREATE TABLE vuelos.detalles (
    vuelo_id SERIAL PRIMARY KEY,
    vuelo_numero VARCHAR(10) UNIQUE NOT NULL,
    vuelo_fecha DATE NOT NULL
);

-- Tabla de check-ins
CREATE TABLE aeropuerto.checkins (
    checkin_id SERIAL PRIMARY KEY,
    pasajero_id INT NOT NULL,
    vuelo_id INT NOT NULL,
    estado_checkin VARCHAR(20) CHECK (estado_checkin IN ('Confirmado', 'No Confirmado')) NOT NULL,
    total_fee DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (pasajero_id) REFERENCES pasajeros.info(pasajero_id) ON DELETE CASCADE,
    FOREIGN KEY (vuelo_id) REFERENCES vuelos.detalles(vuelo_id) ON DELETE CASCADE
);

-- Tabla de asientos asociados a cada check-in
CREATE TABLE aeropuerto.asientos (
    asiento_id SERIAL PRIMARY KEY,
    checkin_id INT NOT NULL,
    asiento VARCHAR(5) NOT NULL,
    FOREIGN KEY (checkin_id) REFERENCES aeropuerto.checkins(checkin_id) ON DELETE CASCADE
);

-- Insertar datos de ejemplo
INSERT INTO pasajeros.info (nombre, direccion) VALUES
('Juan Pérez', 'Calle 123'),
('Ana García', 'Calle 456'),
('Carlos López', 'Calle 789');

INSERT INTO vuelos.detalles (vuelo_numero, vuelo_fecha) VALUES
('AA101', '2025-07-01'),
('BA202', '2025-07-02'),
('UA303', '2025-07-03');

INSERT INTO aeropuerto.checkins (pasajero_id, vuelo_id, estado_checkin, total_fee) VALUES
(1, 1, 'Confirmado', 50.00),
(2, 2, 'Confirmado', 45.00),
(3, 3, 'No Confirmado', 50.00);

INSERT INTO aeropuerto.asientos (checkin_id, asiento) VALUES
(1, '12A'), (1, '12B'),
(2, '1A'), (2, '1B'),
(3, '8A');

-- Crear vista para facilitar reportes
CREATE VIEW aeropuerto.vw_checkin_info AS
SELECT ch.checkin_id, p.nombre AS pasajero, p.direccion, v.vuelo_numero, v.vuelo_fecha,
       ch.estado_checkin, ch.total_fee, a.asiento
FROM aeropuerto.checkins ch
JOIN pasajeros.info p ON ch.pasajero_id = p.pasajero_id
JOIN vuelos.detalles v ON ch.vuelo_id = v.vuelo_id
LEFT JOIN aeropuerto.asientos a ON ch.checkin_id = a.checkin_id;