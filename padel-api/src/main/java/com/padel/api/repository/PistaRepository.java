package com.padel.api.repository;

import com.padel.api.model.Pista;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface PistaRepository extends JpaRepository<Pista, Long> {

    // Extrae pistas asegurando que si la base de datos de Reservas está vacía, devuelve TODAS.
    @Query("SELECT p FROM Pista p LEFT JOIN Reserva r ON r.pista.id = p.id AND r.fecha = :fecha AND r.hora = :hora WHERE r.id IS NULL")
    List<Pista> findDisponibles(@Param("fecha") LocalDate fecha, @Param("hora") LocalTime hora);

}
