package com.padel.api.service;

import com.padel.api.dto.ReservaRequest;
import com.padel.api.exception.BusinessException;
import com.padel.api.exception.ResourceNotFoundException;
import com.padel.api.exception.UnauthorizedException;
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
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservaService {

    private final ReservaRepository reservaRepository;
    private final UsuarioRepository usuarioRepository;
    private final PistaRepository pistaRepository;
    private final ClaseRepository claseRepository;

    public List<Reserva> listarReservasUsuario(String email) {
        Usuario usuario = getUsuarioByEmail(email);
        if ("ADMIN".equals(usuario.getRol())) {
            return reservaRepository.findAll();
        }
        return reservaRepository.findByUsuarioEmail(email);
    }

    @Transactional
    public Reserva crearReserva(String email, ReservaRequest request) {
        Usuario usuario = getUsuarioByEmail(email);

        validarReglasNegocio(request);

        boolean ocupada = reservaRepository.existsByPistaIdAndFechaAndHora(
                request.getPistaId(), request.getFecha(), request.getHora());
        boolean ocupadaPorClase = claseRepository.existsByPistaIdAndFechaAndHora(
                request.getPistaId(), request.getFecha(), request.getHora());

        if (ocupada || ocupadaPorClase) {
            throw new BusinessException("Esa pista ya esta reservada o tiene una clase programada a esa hora.");
        }

        Reserva reserva = new Reserva();
        reserva.setUsuario(usuario);
        reserva.setPista(pistaRepository.findById(request.getPistaId())
                .orElseThrow(() -> new ResourceNotFoundException("Pista no encontrada")));
        reserva.setFecha(request.getFecha());
        reserva.setHora(request.getHora());

        return reservaRepository.save(reserva);
    }

    @Transactional
    public void borrarReserva(Long id, String email) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reserva no encontrada"));

        Usuario usuario = getUsuarioByEmail(email);

        if (!reserva.getUsuario().getEmail().equals(email) && !"ADMIN".equals(usuario.getRol())) {
            throw new UnauthorizedException("No tienes permisos para borrar esta reserva.");
        }

        LocalDateTime fechaHoraReserva = LocalDateTime.of(reserva.getFecha(), reserva.getHora());
        long horas = ChronoUnit.HOURS.between(LocalDateTime.now(), fechaHoraReserva);

        if (horas < 24 && !"ADMIN".equals(usuario.getRol())) {
            throw new BusinessException("No se puede cancelar con menos de 24h de antelacion.");
        }

        reservaRepository.deleteById(id);
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

    private Usuario getUsuarioByEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    }
}
