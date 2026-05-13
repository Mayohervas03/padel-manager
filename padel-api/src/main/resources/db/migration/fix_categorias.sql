-- Migración manual para categorías de torneo
-- Paso 1: Añadir categoria_id como nullable
ALTER TABLE inscripciones_torneo ADD COLUMN IF NOT EXISTS categoria_id BIGINT;

-- Paso 2: Crear categorías basadas en las inscripciones existentes
-- Para cada torneo y cada categoría única en sus inscripciones, crear una entrada en categorias_torneo
INSERT INTO categorias_torneo (nombre, max_parejas, torneo_id)
SELECT DISTINCT 
    i.categoria AS nombre,
    COALESCE(t.max_parejas, 8) AS max_parejas,
    i.torneo_id
FROM inscripciones_torneo i
JOIN torneos t ON i.torneo_id = t.id
WHERE NOT EXISTS (
    SELECT 1 FROM categorias_torneo c 
    WHERE c.torneo_id = i.torneo_id AND c.nombre = i.categoria
);

-- Paso 3: Actualizar inscripciones existentes para apuntar a la categoría correspondiente
UPDATE inscripciones_torneo i
SET categoria_id = c.id
FROM categorias_torneo c
WHERE i.torneo_id = c.torneo_id 
  AND i.categoria = c.nombre;

-- Paso 4: Verificar que todas las inscripciones tienen categoria_id
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM inscripciones_torneo WHERE categoria_id IS NULL) THEN
        RAISE EXCEPTION 'Hay inscripciones sin categoria_id';
    END IF;
END $$;

-- Paso 5: Hacer categoria_id NOT NULL
ALTER TABLE inscripciones_torneo ALTER COLUMN categoria_id SET NOT NULL;

-- Paso 6: Añadir foreign key
ALTER TABLE inscripciones_torneo 
    ADD CONSTRAINT fk_inscripcion_categoria 
    FOREIGN KEY (categoria_id) REFERENCES categorias_torneo(id);

-- Paso 7: Eliminar columna categoria (string) antigua
ALTER TABLE inscripciones_torneo DROP COLUMN IF EXISTS categoria;

-- Paso 8: Eliminar max_parejas de torneos (ahora está en categorias)
ALTER TABLE torneos DROP COLUMN IF EXISTS max_parejas;
