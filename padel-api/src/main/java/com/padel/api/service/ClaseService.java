package com.padel.api.service;

import com.padel.api.dto.ClaseRequest;
import com.padel.api.exception.BusinessException;
import com.padel.api.exception.ResourceNotFoundException;
import com.padel.api.model.Clase;
import com.padel.api.model.EstadoClase;
import com.padel.api.model.EstadoReserva;
import com.padel.api.model.NivelClase;
import com.padel.api.model.Usuario;
import java.util.Arrays;
import com.padel.api.repository.ClaseRepository;
import com.padel.api.repository.PistaRepository;
import com.padel.api.repository.ReservaRepository;
import com.padel.api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClaseService {

    private final ClaseRepository claseRepository;
    private final ReservaRepository reservaRepository;
    private final PistaRepository pistaRepository;
    private final UsuarioRepository usuarioRepository;

    private static final List<EstadoReserva> ESTADOS_RESERVA_ACTIVOS = Arrays.asList(EstadoReserva.PENDIENTE, EstadoReserva.CONFIRMADA);

    @Transactional(readOnly = true)
    public List<Clase> listarTodas() {
        return claseRepository.findByEstadoNotOrderByFechaDescHoraDesc(EstadoClase.CANCELADA);
    }

    @Transactional(readOnly = true)
    public List<Clase> listarHistorial() {
        return claseRepository.findByEstadoOrderByFechaDescHoraDesc(EstadoClase.CANCELADA);
    }

    public Clase buscarPorId(Long id) {
        return claseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Clase no encontrada"));
    }

    @Transactional
    public Clase crearClase(ClaseRequest request) {
        validarReglasNegocio(request);
        validarSlotHorario(request.getHora());
        validarDisponibilidad(request.getPistaId(), request.getFecha(), request.getHora());

        Clase clase = new Clase();
        clase.setTitulo(request.getTitulo());
        clase.setMonitor(request.getMonitor());
        clase.setNivel(NivelClase.valueOf(request.getNivel()));
        clase.setPrecio(request.getPrecio());
        clase.setMaxAlumnos(request.getMaxAlumnos());
        clase.setFecha(request.getFecha());
        clase.setHora(request.getHora());
        clase.setPista(pistaRepository.findById(request.getPistaId())
                .orElseThrow(() -> new ResourceNotFoundException("Pista no encontrada")));

        return claseRepository.save(clase);
    }

    @Transactional
    public Clase actualizarClase(Long id, ClaseRequest request) {
        Clase clase = buscarPorId(id);
        
        if (clase.getEstado() == EstadoClase.CANCELADA) {
            throw new BusinessException("No se puede editar una clase cancelada.");
        }

        if (clase.getFecha().isBefore(LocalDate.now())) {
            throw new BusinessException("No se puede editar una clase que ya ha pasado.");
        }

        // Solo validar disponibilidad si cambia la pista, fecha u hora
        if (!clase.getPista().getId().equals(request.getPistaId()) ||
            !clase.getFecha().equals(request.getFecha()) ||
            !clase.getHora().equals(request.getHora())) {
            validarDisponibilidad(request.getPistaId(), request.getFecha(), request.getHora());
        }

        clase.setTitulo(request.getTitulo());
        clase.setMonitor(request.getMonitor());
        clase.setNivel(NivelClase.valueOf(request.getNivel()));
        clase.setPrecio(request.getPrecio());
        clase.setMaxAlumnos(request.getMaxAlumnos());
        clase.setFecha(request.getFecha());
        clase.setHora(request.getHora());
        clase.setPista(pistaRepository.findById(request.getPistaId())
                .orElseThrow(() -> new ResourceNotFoundException("Pista no encontrada")));

        return claseRepository.save(clase);
    }

    @Transactional
    public void eliminarClase(Long id) {
        Clase clase = claseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Clase no encontrada"));
        
        if (clase.getEstado() == EstadoClase.CANCELADA) {
            throw new BusinessException("Esta clase ya esta cancelada.");
        }
        
        clase.setEstado(EstadoClase.CANCELADA);
        claseRepository.save(clase);
    }

    @Transactional(readOnly = true)
    public List<Clase> obtenerClasesDisponibles() {
        List<Clase> futuras = claseRepository.findByFechaGreaterThanEqualAndEstadoNotOrderByFechaAscHoraAsc(
                LocalDate.now(), EstadoClase.CANCELADA);
        return futuras.stream()
                .filter(c -> {
                    int ocupadas = (c.getAlumnos() != null) ? c.getAlumnos().size() : 0;
                    return ocupadas < c.getMaxAlumnos();
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void inscribirse(Long claseId, String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Clase clase = buscarPorId(claseId);

        if (clase.getEstado() == EstadoClase.CANCELADA) {
            throw new BusinessException("Esta clase esta cancelada.");
        }

        if (clase.getFecha().isBefore(LocalDate.now())) {
            throw new BusinessException("Esta clase ya ha pasado.");
        }

        boolean yaInscrito = clase.getAlumnos().stream()
                .anyMatch(u -> u.getId().equals(usuario.getId()));
        if (yaInscrito) {
            throw new BusinessException("Ya estas inscrito en esta clase.");
        }

        // Control de concurrencia: recargar y verificar cupo
        Clase claseActualizada = claseRepository.findById(claseId)
                .orElseThrow(() -> new ResourceNotFoundException("Clase no encontrada"));
        if (claseActualizada.getAlumnos().size() >= claseActualizada.getMaxAlumnos()) {
            throw new BusinessException("La clase ya esta llena.");
        }

        // Validar límite de 3 clases activas
        long activas = claseRepository.countByAlumnosIdAndFechaGreaterThanEqualAndEstadoNot(
                usuario.getId(), LocalDate.now(), EstadoClase.CANCELADA);
        if (activas >= 3) {
            throw new BusinessException("Ya tienes 3 clases activas. Cancela una para inscribirte en otra.");
        }

        claseActualizada.getAlumnos().add(usuario);
        claseRepository.save(claseActualizada);
    }

    @Transactional
    public void cancelarInscripcion(Long claseId, String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Clase clase = buscarPorId(claseId);

        boolean inscrito = clase.getAlumnos().stream()
                .anyMatch(u -> u.getId().equals(usuario.getId()));
        if (!inscrito) {
            throw new BusinessException("No estas inscrito en esta clase.");
        }

        clase.getAlumnos().removeIf(u -> u.getId().equals(usuario.getId()));
        claseRepository.save(clase);
    }

    @Transactional(readOnly = true)
    public List<Clase> obtenerMisClases(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        return claseRepository.findByAlumnosIdAndFechaGreaterThanEqualAndEstadoNot(
                usuario.getId(), java.time.LocalDate.now(), EstadoClase.CANCELADA);
    }

    @Transactional(readOnly = true)
    public List<Clase> obtenerHistorialClases(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        return claseRepository.findByAlumnosIdOrderByFechaDescHoraDesc(usuario.getId());
    }

    private void validarReglasNegocio(ClaseRequest request) {
        if (request.getFecha().isBefore(LocalDate.now())) {
            throw new BusinessException("No puedes crear una clase en una fecha pasada.");
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

    private void validarDisponibilidad(Long pistaId, LocalDate fecha, java.time.LocalTime hora) {
        boolean ocupadaPorReserva = reservaRepository.existsByPistaIdAndFechaAndHoraAndEstadoIn(
                pistaId, fecha, hora, ESTADOS_RESERVA_ACTIVOS);
        boolean ocupadaPorOtraClase = claseRepository.existsByPistaIdAndFechaAndHora(pistaId, fecha, hora);

        if (ocupadaPorReserva || ocupadaPorOtraClase) {
            throw new BusinessException("La pista seleccionada ya esta ocupada para esa fecha y hora.");
        }
    }
}
