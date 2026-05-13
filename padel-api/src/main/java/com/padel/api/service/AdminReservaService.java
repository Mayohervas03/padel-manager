package com.padel.api.service;

import com.padel.api.dto.ReservaManualRequest;
import com.padel.api.exception.BusinessException;
import com.padel.api.exception.ResourceNotFoundException;
import com.padel.api.model.EstadoReserva;
import com.padel.api.model.Pista;
import com.padel.api.model.Reserva;
import com.padel.api.model.Usuario;
import com.padel.api.repository.ClaseRepository;
import com.padel.api.repository.PistaRepository;
import com.padel.api.repository.ReservaRepository;
import com.padel.api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminReservaService {

    private final ReservaRepository reservaRepository;
    private final UsuarioRepository usuarioRepository;
    private final PistaRepository pistaRepository;
    private final ClaseRepository claseRepository;

    private static final List<EstadoReserva> ESTADOS_RESERVA_ACTIVOS = Arrays.asList(EstadoReserva.PENDIENTE, EstadoReserva.CONFIRMADA);

    public List<Map<String, Object>> listarAgendaPorFecha(LocalDate fecha) {
        List<Reserva> reservas = reservaRepository.findByFechaAndEstadoNot(fecha, EstadoReserva.CANCELADA);
        List<com.padel.api.model.Clase> clases = claseRepository.findByFechaAndEstadoNot(fecha, com.padel.api.model.EstadoClase.CANCELADA);

        List<Map<String, Object>> agenda = new ArrayList<>();

        for (Reserva r : reservas) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", r.getId());
            item.put("tipo", "RESERVA");

            Map<String, String> u = new HashMap<>();
            u.put("nombre", r.getUsuario() != null ? r.getUsuario().getNombre() : "Desconocido");
            u.put("email", r.getUsuario() != null ? r.getUsuario().getEmail() : "");
            item.put("usuario", u);

            Map<String, String> p = new HashMap<>();
            p.put("nombre", r.getPista() != null ? r.getPista().getNombre() : "Borrador");
            item.put("pista", p);

            item.put("hora", r.getHora().toString());
            item.put("estado", r.getEstado().name());
            agenda.add(item);
        }

        for (com.padel.api.model.Clase c : clases) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", c.getId());
            item.put("tipo", "CLASE");

            Map<String, String> u = new HashMap<>();
            u.put("nombre", "CLASE: " + c.getTitulo() + " (" + c.getMonitor() + ")");
            u.put("email", "Nivel: " + c.getNivel().name() + " | Alumnos: " + c.getAlumnos().size() + "/" + c.getMaxAlumnos());
            item.put("usuario", u);

            Map<String, String> p = new HashMap<>();
            p.put("nombre", c.getPista() != null ? c.getPista().getNombre() : "Borrador");
            item.put("pista", p);

            item.put("hora", c.getHora().toString());
            agenda.add(item);
        }

        agenda.sort((a, b) -> ((String)a.get("hora")).compareTo((String)b.get("hora")));
        return agenda;
    }

    @Transactional
    public void borrarReservaAdmin(Long id) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reserva no encontrada"));
        reserva.setEstado(EstadoReserva.CANCELADA);
        reservaRepository.save(reserva);
    }

    @Transactional
    public void cambiarEstadoReserva(Long id, EstadoReserva nuevoEstado) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reserva no encontrada"));

        // Validaciones de transicion de estado
        if (reserva.getEstado() == EstadoReserva.CANCELADA && nuevoEstado != EstadoReserva.CANCELADA) {
            // Al restaurar, validar que no haya conflicto de horario
            validarDisponibilidadAlRestaurar(reserva);
        }

        if (nuevoEstado == EstadoReserva.COMPLETADA) {
            // Solo se puede marcar como completada si la fecha/hora ya paso
            if (reserva.getFecha().isAfter(LocalDate.now()) ||
                (reserva.getFecha().isEqual(LocalDate.now()) && reserva.getHora().isAfter(LocalTime.now()))) {
                throw new BusinessException("No se puede marcar como completada una reserva futura.");
            }
        }

        reserva.setEstado(nuevoEstado);
        reservaRepository.save(reserva);
    }

    private void validarDisponibilidadAlRestaurar(Reserva reserva) {
        boolean ocupada = reservaRepository.existsByPistaIdAndFechaAndHoraAndEstadoIn(
                reserva.getPista().getId(), reserva.getFecha(), reserva.getHora(), ESTADOS_RESERVA_ACTIVOS);
        if (ocupada) {
            throw new BusinessException("No se puede restaurar la reserva: el slot ya esta ocupado por otra reserva activa.");
        }

        boolean ocupadaPorClase = claseRepository.existsByPistaIdAndFechaAndHora(
                reserva.getPista().getId(), reserva.getFecha(), reserva.getHora());
        if (ocupadaPorClase) {
            throw new BusinessException("No se puede restaurar la reserva: el slot esta ocupado por una clase.");
        }
    }

    @Transactional
    public Reserva crearReservaManual(ReservaManualRequest request) {
        LocalDate fecha = LocalDate.parse(request.getFecha());
        LocalTime hora = LocalTime.parse(request.getHora());

        validarReglasNegocio(fecha, hora);
        validarSlotHorario(hora);
        validarLimiteReservasActivas(request.getUsuarioId());

        boolean ocupadaPorReserva = reservaRepository.existsByPistaIdAndFechaAndHoraAndEstadoIn(
                request.getPistaId(), fecha, hora, ESTADOS_RESERVA_ACTIVOS);
        if (ocupadaPorReserva) {
            throw new BusinessException("Esa pista ya esta reservada a esa hora.");
        }

        boolean ocupadaPorClase = claseRepository.existsByPistaIdAndFechaAndHora(request.getPistaId(), fecha, hora);
        if (ocupadaPorClase) {
            throw new BusinessException("Pista ocupada por una clase. Debe anularse la clase previa desde la Agenda.");
        }

        Usuario usuario = usuarioRepository.findById(request.getUsuarioId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        Pista pista = pistaRepository.findById(request.getPistaId())
                .orElseThrow(() -> new ResourceNotFoundException("Pista no encontrada"));

        if (!pista.getActivo()) {
            throw new BusinessException("La pista seleccionada no esta activa.");
        }

        Reserva reserva = new Reserva();
        reserva.setUsuario(usuario);
        reserva.setPista(pista);
        reserva.setFecha(fecha);
        reserva.setHora(hora);
        reserva.setPrecioPagado(pista.getPrecio());

        try {
            return reservaRepository.save(reserva);
        } catch (DataIntegrityViolationException e) {
            throw new BusinessException("Esa pista ya esta reservada a esa hora.");
        }
    }

    private void validarReglasNegocio(LocalDate fecha, LocalTime hora) {
        if (fecha.isBefore(LocalDate.now())) {
            throw new BusinessException("No puedes crear una reserva en una fecha pasada.");
        }

        if (hora.isBefore(LocalTime.of(9, 0)) || hora.isAfter(LocalTime.of(23, 0))) {
            throw new BusinessException("El horario del club es de 09:00 a 23:00.");
        }

        if (fecha.isEqual(LocalDate.now()) && !hora.isAfter(LocalTime.now())) {
            throw new BusinessException("Esa hora ya ha pasado en el dia de hoy.");
        }
    }

    private void validarSlotHorario(LocalTime hora) {
        int minutos = hora.getHour() * 60 + hora.getMinute();
        int apertura = 9 * 60;
        int cierre = 23 * 60;
        int slot = 90;

        if (minutos < apertura || minutos > cierre) {
            throw new BusinessException("El horario debe estar entre 09:00 y 23:00.");
        }

        // AL-5: Validar que el slot completo (90min) quepa dentro del horario
        if (minutos + slot > cierre) {
            throw new BusinessException("El horario seleccionado no permite completar la reserva de 90 minutos dentro del horario del club.");
        }

        int offset = minutos - apertura;
        if (offset % slot != 0) {
            throw new BusinessException("Los horarios disponibles son: 09:00, 10:30, 12:00, 13:30, 15:00, 16:30, 18:00, 19:30, 21:00.");
        }
    }

    private void validarLimiteReservasActivas(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        long activas = reservaRepository.countByUsuarioEmailAndEstadoIn(usuario.getEmail(), ESTADOS_RESERVA_ACTIVOS);
        if (activas >= 3) {
            throw new BusinessException("El usuario ya tiene 3 reservas activas.");
        }
    }
}
