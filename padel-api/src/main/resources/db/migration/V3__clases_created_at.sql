-- Migración para añadir created_at y estado a clases existentes
-- Paso 1: Añadir columna created_at permitiendo NULL temporalmente
ALTER TABLE clases ADD COLUMN IF NOT EXISTS created_at TIMESTAMP;

-- Paso 2: Asignar fecha actual a registros existentes
UPDATE clases SET created_at = NOW() WHERE created_at IS NULL;

-- Paso 3: Hacer NOT NULL después de poblar
ALTER TABLE clases ALTER COLUMN created_at SET NOT NULL;

-- Paso 4: Añadir columna estado permitiendo NULL temporalmente
ALTER TABLE clases ADD COLUMN IF NOT EXISTS estado VARCHAR(20);

-- Paso 5: Asignar estado default a registros existentes
UPDATE clases SET estado = 'PROGRAMADA' WHERE estado IS NULL;

-- Paso 6: Hacer NOT NULL después de poblar
ALTER TABLE clases ALTER COLUMN estado SET NOT NULL;
