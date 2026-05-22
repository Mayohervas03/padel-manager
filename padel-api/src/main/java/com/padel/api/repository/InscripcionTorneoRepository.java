package com.padel.api.repository;

import com.padel.api.model.EstadoInscripcion;
import com.padel.api.model.InscripcionTorneo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface InscripcionTorneoRepository extends JpaRepository<InscripcionTorneo, Long> {
    List<InscripcionTorneo> findByTorneoIdAndEstado(Long torneoId, EstadoInscripcion estado);
    List<InscripcionTorneo> findByUser1IdAndEstado(Long usuarioId, EstadoInscripcion estado);

    @Query("SELECT i FROM InscripcionTorneo i JOIN i.torneo t WHERE i.user1.id = :usuarioId AND i.estado = :estado AND t.fechaFin >= :fecha")
    List<InscripcionTorneo> findActivasByUser1IdAndEstado(@Param("usuarioId") Long usuarioId, @Param("estado") EstadoInscripcion estado, @Param("fecha") LocalDate fecha);

    boolean existsByTorneoIdAndUser1IdAndEstado(Long torneoId, Long usuarioId, EstadoInscripcion estado);
    long countByTorneoIdAndEstado(Long torneoId, EstadoInscripcion estado);

    long countByCategoriaTorneoIdAndEstado(Long categoriaId, EstadoInscripcion estado);
    
    boolean existsByTorneoIdAndUser1IdAndEstadoAndCategoriaTorneoIdNot(
            Long torneoId, Long usuarioId, EstadoInscripcion estado, Long categoriaId);
    
    List<InscripcionTorneo> findByCategoriaTorneoIdAndEstado(Long categoriaId, EstadoInscripcion estado);
}
