package com.padel.api.repository;

import com.padel.api.model.Clase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface ClaseRepository extends JpaRepository<Clase, Long> {
    boolean existsByPistaIdAndFechaAndHora(Long pistaId, LocalDate fecha, LocalTime hora);
    List<Clase> findByFecha(LocalDate fecha);
    List<Clase> findByFechaGreaterThanEqualOrderByFechaAscHoraAsc(LocalDate fecha);
    List<Clase> findByAlumnosId(Long usuarioId);
}
