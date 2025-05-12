-- Crear tabla de clientes
CREATE TABLE clientes (
    cliente_id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    saldo DECIMAL(10, 2) NOT NULL CHECK (saldo >= 0)
);

-- Crear tabla de transacciones
CREATE TABLE transacciones (
    transaccion_id SERIAL PRIMARY KEY,
    cliente_id INT NOT NULL,
    tipo VARCHAR(50) CHECK (tipo IN ('deposito', 'retiro')) NOT NULL,
    monto DECIMAL(10, 2) CHECK (monto > 0) NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(cliente_id) ON DELETE CASCADE
);

-- Insertar clientes iniciales
INSERT INTO clientes (nombre, saldo) VALUES ('Juan Perez', 1500.00);
INSERT INTO clientes (nombre, saldo) VALUES ('Ana Garcia', 2500.00);

-- Función para realizar transacciones de manera segura
CREATE OR REPLACE FUNCTION realizar_transaccion(p_cliente_id INT, p_tipo VARCHAR, p_monto DECIMAL)
RETURNS VOID AS $$
DECLARE
    v_saldo_actual DECIMAL;
BEGIN
    -- Bloquear fila del cliente para evitar condiciones de carrera
    SELECT saldo INTO v_saldo_actual FROM clientes WHERE cliente_id = p_cliente_id FOR UPDATE;

    -- Verificar saldo suficiente en caso de retiro
    IF p_tipo = 'retiro' AND v_saldo_actual < p_monto THEN
        RAISE EXCEPTION 'Saldo insuficiente';
    END IF;

    -- Insertar la transacción
    INSERT INTO transacciones (cliente_id, tipo, monto) VALUES (p_cliente_id, p_tipo, p_monto);

    -- Actualizar saldo del cliente
    UPDATE clientes 
    SET saldo = saldo + (CASE WHEN p_tipo = 'deposito' THEN p_monto ELSE -p_monto END)
    WHERE cliente_id = p_cliente_id;
END;
$$ LANGUAGE plpgsql;

-- Ejemplo de uso: Ejecutar una transacción
BEGIN;
SELECT realizar_transaccion(1, 'retiro', 200.00);
COMMIT;

-- Consultar el saldo actualizado de un cliente
SELECT nombre, saldo FROM clientes WHERE cliente_id = 1;