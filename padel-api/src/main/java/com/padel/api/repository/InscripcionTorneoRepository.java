package com.padel.api.repository;

import com.padel.api.model.InscripcionTorneo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InscripcionTorneoRepository extends JpaRepository<InscripcionTorneo, Long> {
    List<InscripcionTorneo> findByTorneoId(Long torneoId);
    boolean existsByTorneoIdAndUser1Id(Long torneoId, Long usuarioId);
}
