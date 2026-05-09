-- Migración: Soft delete, precio snapshot y constraint UNIQUE para reservas
-- Ejecutar manualmente en PostgreSQL antes de reiniciar la app

-- 1. Añadir columna estado con valor por defecto
ALTER TABLE reservas
    ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'CONFIRMADA';

-- Actualizar registros existentes
UPDATE reservas SET estado = 'CONFIRMADA' WHERE estado IS NULL;

-- Hacer NOT NULL después de poblar
ALTER TABLE reservas
    ALTER COLUMN estado SET NOT NULL;

-- 2. Añadir columna precio_pagado
ALTER TABLE reservas
    ADD COLUMN IF NOT EXISTS precio_pagado DOUBLE PRECISION;

-- Poblar precio_pagado desde pistas para registros existentes
UPDATE reservas r
SET precio_pagado = p.precio
FROM pistas p
WHERE r.pista_id = p.id AND r.precio_pagado IS NULL;

-- 3. Añadir columna created_at
ALTER TABLE reservas
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP;

-- Poblar created_at con un valor por defecto para registros existentes
UPDATE reservas SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL;

-- 4. Añadir UNIQUE constraint (pista_id, fecha, hora)
-- ATENCIÓN: Si hay datos duplicados, esto fallará. Limpiar primero:
-- DELETE FROM reservas WHERE id IN (
--     SELECT id FROM (
--         SELECT id, ROW_NUMBER() OVER (PARTITION BY pista_id, fecha, hora ORDER BY id) as rn
--         FROM reservas
--     ) t WHERE t.rn > 1
-- );

-- Comprobar duplicados antes de crear el constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'uk_reserva_pista_fecha_hora'
        AND table_name = 'reservas'
    ) THEN
        ALTER TABLE reservas
            ADD CONSTRAINT uk_reserva_pista_fecha_hora
            UNIQUE (pista_id, fecha, hora);
    END IF;
END $$;
