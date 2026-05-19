package com.padel.api.service;

import com.padel.api.dto.ReservaRequest;
import com.padel.api.exception.BusinessException;
import com.padel.api.exception.ResourceNotFoundException;
import com.padel.api.exception.UnauthorizedException;
import com.padel.api.model.EstadoReserva;
import com.padel.api.model.Reserva;
import com.padel.api.model.Usuario;
import com.padel.api.repository.ClaseRepository;
import com.padel.api.repository.PistaRepository;
import com.padel.api.repository.ReservaRepository;
import com.padel.api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservaService {

    private final ReservaRepository reservaRepository;
    private final UsuarioRepository usuarioRepository;
    private final PistaRepository pistaRepository;
    private final ClaseRepository claseRepository;

    private static final List<EstadoReserva> ESTADOS_ACTIVOS = Arrays.asList(EstadoReserva.PENDIENTE, EstadoReserva.CONFIRMADA);

    public List<Reserva> listarReservasActivasUsuario(String email) {
        return reservaRepository.findByUsuarioEmailAndEstadoInAndFechaGreaterThanEqual(email, ESTADOS_ACTIVOS, LocalDate.now());
    }

    public List<Reserva> listarTodasReservasUsuario(String email) {
        return reservaRepository.findByUsuarioEmailOrderByFechaDescHoraDesc(email);
    }

    public List<Reserva> listarTodasReservasFuturas() {
        return reservaRepository.findByFechaGreaterThanEqualAndEstadoNot(LocalDate.now(), EstadoReserva.CANCELADA);
    }

    public List<Reserva> listarHistorialCompleto() {
        return reservaRepository.findAllByOrderByFechaDescHoraDesc();
    }

    @Transactional
    public Reserva crearReserva(String email, ReservaRequest request) {
        Usuario usuario = getUsuarioByEmail(email);

        validarReglasNegocio(request);
        validarSlotHorario(request.getHora());
        validarLimiteReservasActivas(email);

        boolean ocupadaPorClase = claseRepository.existsByPistaIdAndFechaAndHora(
                request.getPistaId(), request.getFecha(), request.getHora());

        if (ocupadaPorClase) {
            throw new BusinessException("Esa pista ya tiene una clase programada a esa hora.");
        }

        var pista = pistaRepository.findById(request.getPistaId())
                .orElseThrow(() -> new ResourceNotFoundException("Pista no encontrada"));

        // Verificar que no existe una reserva activa en ese slot
        boolean ocupada = reservaRepository.existsByPistaIdAndFechaAndHoraAndEstadoIn(
                request.getPistaId(), request.getFecha(), request.getHora(), ESTADOS_ACTIVOS);
        if (ocupada) {
            throw new BusinessException("Esa pista ya esta reservada a esa hora. Por favor, elige otro horario.");
        }

        Reserva reserva = new Reserva();
        reserva.setUsuario(usuario);
        reserva.setPista(pista);
        reserva.setFecha(request.getFecha());
        reserva.setHora(request.getHora());
        reserva.setPrecioPagado(pista.getPrecio());

        try {
            return reservaRepository.save(reserva);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            throw new BusinessException("Esa pista ya esta reservada a esa hora. Por favor, elige otro horario.");
        }
    }

    @Transactional
    public void borrarReserva(Long id, String email) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reserva no encontrada"));

        Usuario usuario = getUsuarioByEmail(email);

        if (!reserva.getUsuario().getEmail().equals(email) && !"ADMIN".equals(usuario.getRol())) {
            throw new UnauthorizedException("No tienes permisos para cancelar esta reserva.");
        }

        if (reserva.getEstado() == EstadoReserva.CANCELADA) {
            throw new BusinessException("Esta reserva ya esta cancelada.");
        }

        LocalDateTime fechaHoraReserva = LocalDateTime.of(reserva.getFecha(), reserva.getHora());
        long horas = ChronoUnit.HOURS.between(LocalDateTime.now(), fechaHoraReserva);

        if (horas < 24 && !"ADMIN".equals(usuario.getRol())) {
            throw new BusinessException("No se puede cancelar con menos de 24h de antelacion.");
        }

        reserva.setEstado(EstadoReserva.CANCELADA);
        reservaRepository.save(reserva);
    }

    private void validarReglasNegocio(ReservaRequest request) {
        if (request.getFecha().isBefore(LocalDate.now())) {
            throw new BusinessException("No puedes reservar en una fecha pasada.");
        }

        if (request.getHora().isBefore(LocalTime.of(9, 0)) || request.getHora().isAfter(LocalTime.of(23, 0))) {
            throw new BusinessException("El horario del club es de 09:00 a 23:00.");
        }

        if (request.getFecha().isEqual(LocalDate.now()) && !request.getHora().isAfter(LocalTime.now())) {
            throw new BusinessException("Esa hora ya ha pasado en el dia de hoy.");
        }
    }

    private void validarSlotHorario(LocalTime hora) {
        int minutos = hora.getHour() * 60 + hora.getMinute();
        int apertura = 9 * 60;   // 09:00
        int cierre = 23 * 60;    // 23:00
        int slot = 90;           // 1h 30min

        if (minutos < apertura || minutos > cierre) {
            throw new BusinessException("El horario debe estar entre 09:00 y 23:00.");
        }

        int offset = minutos - apertura;
        if (offset % slot != 0) {
            throw new BusinessException("Los horarios disponibles son: 09:00, 10:30, 12:00, 13:30, 15:00, 16:30, 18:00, 19:30, 21:00.");
        }
    }

    private void validarLimiteReservasActivas(String email) {
        long activas = reservaRepository.countByUsuarioEmailAndEstadoInAndFechaGreaterThanEqual(email, ESTADOS_ACTIVOS, LocalDate.now());
        if (activas >= 3) {
            throw new BusinessException("Ya tienes 3 reservas activas. Cancela una para hacer una nueva.");
        }
    }

    private Usuario getUsuarioByEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    }
}
