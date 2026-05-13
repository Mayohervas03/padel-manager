package com.padel.api.repository;

import com.padel.api.model.Clase;
import com.padel.api.model.EstadoClase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface ClaseRepository extends JpaRepository<Clase, Long> {
    boolean existsByPistaIdAndFechaAndHora(Long pistaId, LocalDate fecha, LocalTime hora);
    List<Clase> findByFecha(LocalDate fecha);
    List<Clase> findByFechaAndEstadoNot(LocalDate fecha, EstadoClase estado);
    List<Clase> findByFechaGreaterThanEqualAndEstadoNotOrderByFechaAscHoraAsc(LocalDate fecha, EstadoClase estado);
    List<Clase> findByAlumnosIdAndFechaGreaterThanEqualAndEstadoNot(Long usuarioId, LocalDate fecha, EstadoClase estado);
    List<Clase> findByAlumnosIdOrderByFechaDescHoraDesc(Long usuarioId);
    List<Clase> findByEstadoNotOrderByFechaDescHoraDesc(EstadoClase estado);
    long countByAlumnosIdAndFechaGreaterThanEqualAndEstadoNot(Long usuarioId, LocalDate fecha, EstadoClase estado);
    List<Clase> findByEstadoOrderByFechaDescHoraDesc(EstadoClase estado);
}
