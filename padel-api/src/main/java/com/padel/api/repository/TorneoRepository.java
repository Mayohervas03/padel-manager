package com.padel.api.repository;

import com.padel.api.model.EstadoTorneo;
import com.padel.api.model.Torneo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TorneoRepository extends JpaRepository<Torneo, Long> {
    List<Torneo> findByFechaFinGreaterThanEqualOrderByFechaFinAsc(LocalDate date);

    List<Torneo> findByEstadoAndFechaFinGreaterThanEqualOrderByFechaFinAsc(EstadoTorneo estado, LocalDate date);

    @Query("SELECT DISTINCT t FROM Torneo t LEFT JOIN FETCH t.categorias ORDER BY t.fechaFin ASC")
    List<Torneo> findAllWithCategorias();

    @Query("SELECT DISTINCT t FROM Torneo t LEFT JOIN FETCH t.categorias WHERE t.id = :id")
    Optional<Torneo> findByIdWithCategorias(@Param("id") Long id);

    @Query("SELECT t, COUNT(i) FROM Torneo t LEFT JOIN InscripcionTorneo i ON t.id = i.torneo.id AND i.estado = 'ACTIVA' GROUP BY t ORDER BY t.fechaFin ASC")
    List<Object[]> findAllWithInscripcionesCount();
}
