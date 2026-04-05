package com.padel.api.repository;

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
    boolean existsByPistaIdAndFechaAndHora(Long pistaId, LocalDate fecha, LocalTime hora);
    long countByFecha(LocalDate fecha);
    List<Reserva> findByUsuarioEmail(String email);

    List<Reserva> findByFecha(LocalDate fecha);

    @Query("SELECT p FROM Pista p WHERE p.activo = true AND NOT EXISTS (SELECT r FROM Reserva r WHERE r.pista.id = p.id AND r.fecha = :fecha AND r.hora = :hora)")
    List<Pista> findDisponibles(@Param("fecha") LocalDate fecha, @Param("hora") LocalTime hora);

    @Query("SELECT COUNT(r) FROM Reserva r WHERE r.usuario.id = :usuarioId AND r.fecha >= :inicio AND r.fecha <= :fin")
    long countByUsuarioIdAndFechaBetween(@Param("usuarioId") Long usuarioId, @Param("inicio") LocalDate inicio, @Param("fin") LocalDate fin);

    @Modifying
    @Transactional
    @Query("DELETE FROM Reserva r WHERE r.pista.id = :pistaId")
    void deleteByPistaId(@Param("pistaId") Long pistaId);

    // Estadísticas
    @Query("SELECT r.pista.nombre, COUNT(r) FROM Reserva r GROUP BY r.pista.nombre")
    List<Object[]> getOcupacionPistas();

    @Query("SELECT r.fecha, SUM(p.precio) FROM Reserva r JOIN r.pista p WHERE r.fecha >= :desde GROUP BY r.fecha ORDER BY r.fecha ASC")
    List<Object[]> getIngresosDias(@Param("desde") LocalDate desde);

    @Query("SELECT r.hora, COUNT(r) FROM Reserva r GROUP BY r.hora")
    List<Object[]> getOcupacionHoras();
}
