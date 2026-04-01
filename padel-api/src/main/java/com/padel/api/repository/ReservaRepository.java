package com.padel.api.repository;

import com.padel.api.model.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.padel.api.model.Pista;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface ReservaRepository extends JpaRepository<Reserva, Long> {
    boolean existsByPistaIdAndFechaAndHora(Long pistaId, LocalDate fecha, LocalTime hora);
    long countByFecha(LocalDate fecha);
    List<Reserva> findByUsuarioEmail(String email);

    @Query("SELECT p FROM Pista p WHERE NOT EXISTS (SELECT r FROM Reserva r WHERE r.pista.id = p.id AND r.fecha = :fecha AND r.hora = :hora)")
    List<Pista> findDisponibles(@Param("fecha") LocalDate fecha, @Param("hora") LocalTime hora);
}
