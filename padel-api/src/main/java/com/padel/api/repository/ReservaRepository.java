package com.padel.api.repository;

import com.padel.api.model.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReservaRepository extends JpaRepository<Reserva, Long> {
    boolean existsByPistaIdAndFechaAndHora(Long pistaId, java.time.LocalDate fecha, Integer hora);
    long countByFecha(java.time.LocalDate fecha);
}
