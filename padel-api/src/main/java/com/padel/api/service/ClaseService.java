package com.padel.api.service;

import com.padel.api.dto.ClaseRequest;
import com.padel.api.exception.BusinessException;
import com.padel.api.exception.ResourceNotFoundException;
import com.padel.api.model.Clase;
import com.padel.api.model.NivelClase;
import com.padel.api.model.Usuario;
import com.padel.api.repository.ClaseRepository;
import com.padel.api.repository.PistaRepository;
import com.padel.api.repository.ReservaRepository;
import com.padel.api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClaseService {

    private final ClaseRepository claseRepository;
    private final ReservaRepository reservaRepository;
    private final PistaRepository pistaRepository;
    private final UsuarioRepository usuarioRepository;

    public List<Clase> listarTodas() {
        return claseRepository.findAll();
    }

    public Clase buscarPorId(Long id) {
        return claseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Clase no encontrada"));
    }

    @Transactional
    public Clase crearClase(ClaseRequest request) {
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
    public void eliminarClase(Long id) {
        if (!claseRepository.existsById(id)) {
            throw new ResourceNotFoundException("Clase no encontrada");
        }
        claseRepository.deleteById(id);
    }

    public List<Clase> obtenerClasesDisponibles() {
        List<Clase> futuras = claseRepository.findByFechaGreaterThanEqualOrderByFechaAscHoraAsc(LocalDate.now());
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

        boolean yaInscrito = clase.getAlumnos().stream()
                .anyMatch(u -> u.getId().equals(usuario.getId()));
        if (yaInscrito) {
            throw new BusinessException("Ya estas inscrito en esta clase.");
        }

        if (clase.getAlumnos().size() >= clase.getMaxAlumnos()) {
            throw new BusinessException("La clase ya esta llena.");
        }

        clase.getAlumnos().add(usuario);
        claseRepository.save(clase);
    }

    public List<Clase> obtenerMisClases(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        return claseRepository.findByAlumnosId(usuario.getId());
    }

    private void validarDisponibilidad(Long pistaId, LocalDate fecha, java.time.LocalTime hora) {
        boolean ocupadaPorReserva = reservaRepository.existsByPistaIdAndFechaAndHora(pistaId, fecha, hora);
        boolean ocupadaPorOtraClase = claseRepository.existsByPistaIdAndFechaAndHora(pistaId, fecha, hora);

        if (ocupadaPorReserva || ocupadaPorOtraClase) {
            throw new BusinessException("La pista seleccionada ya esta ocupada para esa fecha y hora.");
        }
    }
}
