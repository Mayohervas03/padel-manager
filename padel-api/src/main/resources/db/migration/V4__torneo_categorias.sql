-- V4__torneo_categorias.sql
-- Crear sistema de categorías por torneo

-- 1. Crear tabla de categorías
CREATE TABLE categorias_torneo (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    max_parejas INTEGER NOT NULL,
    torneo_id BIGINT NOT NULL REFERENCES torneos(id) ON DELETE CASCADE
);

-- 2. Crear categoría "General" para cada torneo existente e insertarlas
INSERT INTO categorias_torneo (nombre, max_parejas, torneo_id)
SELECT 'General', max_parejas, id FROM torneos;

-- 3. Añadir columna categoria_id a inscripciones_torneo
ALTER TABLE inscripciones_torneo ADD COLUMN categoria_id BIGINT;

-- 4. Actualizar inscripciones existentes para apuntar a la categoría "General" de su torneo
UPDATE inscripciones_torneo i
SET categoria_id = c.id
FROM categorias_torneo c
WHERE c.torneo_id = i.torneo_id;

-- 5. Hacer categoria_id NOT NULL
ALTER TABLE inscripciones_torneo ALTER COLUMN categoria_id SET NOT NULL;
ALTER TABLE inscripciones_torneo ADD CONSTRAINT fk_inscripcion_categoria 
    FOREIGN KEY (categoria_id) REFERENCES categorias_torneo(id);

-- 6. Eliminar columna categoria (string) de inscripciones_torneo
ALTER TABLE inscripciones_torneo DROP COLUMN categoria;

-- 7. Eliminar columna max_parejas de torneos (ahora está en categorias)
ALTER TABLE torneos DROP COLUMN max_parejas;
