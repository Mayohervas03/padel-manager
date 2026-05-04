package com.padel.api.service;

import com.padel.api.dto.InscripcionTorneoDto;
import com.padel.api.dto.InscripcionTorneoRequest;
import com.padel.api.dto.TorneoRequest;
import com.padel.api.exception.BusinessException;
import com.padel.api.exception.ResourceNotFoundException;
import com.padel.api.model.InscripcionTorneo;
import com.padel.api.model.Torneo;
import com.padel.api.model.Usuario;
import com.padel.api.repository.InscripcionTorneoRepository;
import com.padel.api.repository.TorneoRepository;
import com.padel.api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TorneoService {

    private final TorneoRepository torneoRepository;
    private final InscripcionTorneoRepository inscripcionRepository;
    private final UsuarioRepository usuarioRepository;

    public List<Torneo> findAll() {
        return torneoRepository.findAll();
    }

    public List<Torneo> findActivos() {
        return torneoRepository.findByFechaFinGreaterThanEqualOrderByFechaFinAsc(LocalDate.now());
    }

    public Torneo findById(Long id) {
        return torneoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Torneo no encontrado"));
    }

    @Transactional
    public Torneo createTorneo(TorneoRequest request) {
        Torneo torneo = mapToEntity(request);
        return torneoRepository.save(torneo);
    }

    @Transactional
    public Torneo updateTorneo(Long id, TorneoRequest request) {
        Torneo torneo = findById(id);
        torneo.setTitulo(request.getTitulo());
        torneo.setDescripcion(request.getDescripcion());
        torneo.setFechaInicio(request.getFechaInicio());
        torneo.setFechaFin(request.getFechaFin());
        torneo.setPrecioPareja(request.getPrecioPareja());
        torneo.setMaxParejas(request.getMaxParejas());
        torneo.setImagenUrl(request.getImagenUrl());
        return torneoRepository.save(torneo);
    }

    @Transactional
    public void deleteTorneo(Long id) {
        if (!torneoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Torneo no encontrado");
        }
        torneoRepository.deleteById(id);
    }

    public List<InscripcionTorneoDto> getInscripciones(Long torneoId) {
        return inscripcionRepository.findByTorneoId(torneoId).stream()
                .map(InscripcionTorneoDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public void inscribirse(Long torneoId, String emailUsuario, InscripcionTorneoRequest request) {
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Torneo torneo = findById(torneoId);

        if (inscripcionRepository.existsByTorneoIdAndUser1Id(torneoId, usuario.getId())) {
            throw new BusinessException("Ya estas inscrito en este torneo");
        }

        long count = inscripcionRepository.findByTorneoId(torneoId).size();
        if (count >= torneo.getMaxParejas()) {
            throw new BusinessException("El torneo esta lleno");
        }

        InscripcionTorneo inscripcion = new InscripcionTorneo();
        inscripcion.setTorneo(torneo);
        inscripcion.setUser1(usuario);
        inscripcion.setNombreCompanero(request.getNombreCompanero());
        inscripcion.setCategoria(request.getCategoria());
        inscripcion.setPagado(false);
        inscripcion.setFechaInscripcion(LocalDate.now());

        inscripcionRepository.save(inscripcion);
    }

    @Transactional
    public InscripcionTorneoDto marcarPagado(Long inscripcionId, boolean pagado) {
        InscripcionTorneo inscripcion = inscripcionRepository.findById(inscripcionId)
                .orElseThrow(() -> new ResourceNotFoundException("Inscripcion no encontrada"));
        inscripcion.setPagado(pagado);
        return InscripcionTorneoDto.fromEntity(inscripcionRepository.save(inscripcion));
    }

    private Torneo mapToEntity(TorneoRequest request) {
        Torneo torneo = new Torneo();
        torneo.setTitulo(request.getTitulo());
        torneo.setDescripcion(request.getDescripcion());
        torneo.setFechaInicio(request.getFechaInicio());
        torneo.setFechaFin(request.getFechaFin());
        torneo.setPrecioPareja(request.getPrecioPareja());
        torneo.setMaxParejas(request.getMaxParejas());
        torneo.setImagenUrl(request.getImagenUrl());
        return torneo;
    }
}
