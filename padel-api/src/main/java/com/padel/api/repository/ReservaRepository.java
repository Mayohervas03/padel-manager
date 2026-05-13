package com.padel.api.repository;

import com.padel.api.model.EstadoReserva;
import com.padel.api.model.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.repository.query.Param;
import com.padel.api.model.Pista;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface ReservaRepository extends JpaRepository<Reserva, Long> {
    boolean existsByPistaIdAndFechaAndHoraAndEstadoIn(Long pistaId, LocalDate fecha, LocalTime hora, List<EstadoReserva> estados);
    long countByFecha(LocalDate fecha);
    List<Reserva> findByUsuarioEmail(String email);

    List<Reserva> findByUsuarioEmailAndEstadoInAndFechaGreaterThanEqual(String email, List<EstadoReserva> estados, LocalDate fecha);

    List<Reserva> findByPistaIdAndFechaAndHoraAndEstadoIn(Long pistaId, LocalDate fecha, LocalTime hora, List<EstadoReserva> estados);

    long countByUsuarioEmailAndEstadoIn(String email, List<EstadoReserva> estados);

    List<Reserva> findByFechaAndEstadoNot(LocalDate fecha, EstadoReserva estado);
    List<Reserva> findByFechaGreaterThanEqualAndEstadoNot(LocalDate fecha, EstadoReserva estado);
    List<Reserva> findByUsuarioEmailOrderByFechaDescHoraDesc(String email);
    List<Reserva> findAllByOrderByFechaDescHoraDesc();

    @Query("SELECT p FROM Pista p WHERE p.activo = true AND NOT EXISTS (SELECT r FROM Reserva r WHERE r.pista.id = p.id AND r.fecha = :fecha AND r.hora = :hora)")
    List<Pista> findDisponibles(@Param("fecha") LocalDate fecha, @Param("hora") LocalTime hora);

    @Query("SELECT COUNT(r) FROM Reserva r WHERE r.usuario.id = :usuarioId AND r.fecha >= :inicio AND r.fecha <= :fin")
    long countByUsuarioIdAndFechaBetween(@Param("usuarioId") Long usuarioId, @Param("inicio") LocalDate inicio, @Param("fin") LocalDate fin);

    @Modifying
    @Transactional
    @Query("UPDATE Reserva r SET r.estado = 'CANCELADA' WHERE r.pista.id = :pistaId AND r.estado IN ('PENDIENTE', 'CONFIRMADA')")
    void cancelarReservasActivasByPistaId(@Param("pistaId") Long pistaId);

    @Query("SELECT COUNT(r) FROM Reserva r WHERE r.pista.id = :pistaId AND r.estado IN ('PENDIENTE', 'CONFIRMADA') AND r.fecha >= CURRENT_DATE")
    long countReservasActivasFuturasByPistaId(@Param("pistaId") Long pistaId);

    // Estadísticas sin filtro de fecha
    @Query("SELECT r.pista.nombre, COUNT(r) FROM Reserva r GROUP BY r.pista.nombre")
    List<Object[]> getOcupacionPistas();

    @Query("SELECT r.fecha, SUM(p.precio) FROM Reserva r JOIN r.pista p WHERE r.fecha >= :desde GROUP BY r.fecha ORDER BY r.fecha ASC")
    List<Object[]> getIngresosDias(@Param("desde") LocalDate desde);

    @Query("SELECT r.hora, COUNT(r) FROM Reserva r GROUP BY r.hora")
    List<Object[]> getOcupacionHoras();

    // Estadísticas con filtro de fecha
    @Query("SELECT r.pista.nombre, COUNT(r) FROM Reserva r WHERE r.fecha >= :desde AND r.fecha <= :hasta GROUP BY r.pista.nombre")
    List<Object[]> getOcupacionPistasBetween(@Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta);

    @Query("SELECT r.fecha, SUM(p.precio) FROM Reserva r JOIN r.pista p WHERE r.fecha >= :desde AND r.fecha <= :hasta GROUP BY r.fecha ORDER BY r.fecha ASC")
    List<Object[]> getIngresosDiasBetween(@Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta);

    @Query("SELECT r.hora, COUNT(r) FROM Reserva r WHERE r.fecha >= :desde AND r.fecha <= :hasta GROUP BY r.hora")
    List<Object[]> getOcupacionHorasBetween(@Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta);
}
