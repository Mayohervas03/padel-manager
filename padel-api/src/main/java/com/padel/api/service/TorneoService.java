package com.padel.api.service;

import com.padel.api.dto.*;
import com.padel.api.exception.BusinessException;
import com.padel.api.exception.ResourceNotFoundException;
import com.padel.api.model.*;
import com.padel.api.repository.CategoriaTorneoRepository;
import com.padel.api.repository.InscripcionTorneoRepository;
import com.padel.api.repository.TorneoRepository;
import com.padel.api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TorneoService {

    private final TorneoRepository torneoRepository;
    private final InscripcionTorneoRepository inscripcionRepository;
    private final UsuarioRepository usuarioRepository;
    private final CategoriaTorneoRepository categoriaTorneoRepository;

    public List<Torneo> findAll() {
        List<Object[]> results = torneoRepository.findAllWithInscripcionesCount();
        return results.stream().map(result -> {
            Torneo torneo = (Torneo) result[0];
            Long count = (Long) result[1];
            torneo.setInscripcionesCount(count.intValue());
            return torneo;
        }).collect(Collectors.toList());
    }

    public List<Torneo> findActivos() {
        List<Torneo> torneos = torneoRepository.findByEstadoAndFechaFinGreaterThanEqualOrderByFechaFinAsc(EstadoTorneo.ABIERTO, LocalDate.now());
        // Cargar categorías para cada torneo
        for (Torneo torneo : torneos) {
            torneo.getCategorias().size(); // Forzar carga lazy
        }
        return torneos;
    }

    public Torneo findById(Long id) {
        return torneoRepository.findByIdWithCategorias(id)
                .orElseThrow(() -> new ResourceNotFoundException("Torneo no encontrado"));
    }

    @Transactional
    public Torneo createTorneo(TorneoRequest request) {
        Torneo torneo = mapToEntity(request);
        Torneo saved = torneoRepository.save(torneo);
        
        // Crear categorías
        for (CategoriaTorneoRequest catReq : request.getCategorias()) {
            CategoriaTorneo categoria = new CategoriaTorneo();
            categoria.setNombre(catReq.getNombre());
            categoria.setMaxParejas(catReq.getMaxParejas());
            categoria.setTorneo(saved);
            categoriaTorneoRepository.save(categoria);
        }
        
        return torneoRepository.findByIdWithCategorias(saved.getId()).orElse(saved);
    }

    @Transactional
    public Torneo updateTorneo(Long id, TorneoRequest request) {
        Torneo torneo = findById(id);
        torneo.setTitulo(request.getTitulo());
        torneo.setDescripcion(request.getDescripcion());
        torneo.setFechaInicio(request.getFechaInicio());
        torneo.setFechaFin(request.getFechaFin());
        torneo.setPrecioPareja(request.getPrecioPareja());
        torneo.setImagenUrl(request.getImagenUrl());
        if (request.getEstado() != null) {
            torneo.setEstado(request.getEstado());
        }
        if (request.getFechaCierreInscripcion() != null) {
            torneo.setFechaCierreInscripcion(request.getFechaCierreInscripcion());
        }
        
        // Actualizar categorías: eliminar las que ya no están, actualizar existentes, crear nuevas
        List<CategoriaTorneo> categoriasExistentes = new ArrayList<>(torneo.getCategorias());
        List<CategoriaTorneoRequest> categoriasNuevas = request.getCategorias();
        
        // Eliminar categorías que ya no están en la lista
        categoriasExistentes.forEach(catExistente -> {
            boolean sigue = categoriasNuevas.stream()
                    .anyMatch(cn -> cn.getNombre().equals(catExistente.getNombre()));
            if (!sigue) {
                // Cancelar inscripciones de esta categoría antes de eliminar
                List<InscripcionTorneo> inscripciones = inscripcionRepository
                        .findByCategoriaTorneoIdAndEstado(catExistente.getId(), EstadoInscripcion.ACTIVA);
                inscripciones.forEach(i -> i.setEstado(EstadoInscripcion.CANCELADA));
                inscripcionRepository.saveAll(inscripciones);
                categoriaTorneoRepository.delete(catExistente);
            }
        });
        
        // Actualizar o crear categorías
        for (CategoriaTorneoRequest catReq : categoriasNuevas) {
            CategoriaTorneo categoria = categoriasExistentes.stream()
                    .filter(c -> c.getNombre().equals(catReq.getNombre()))
                    .findFirst()
                    .orElse(null);
            
            if (categoria == null) {
                // Nueva categoría
                categoria = new CategoriaTorneo();
                categoria.setNombre(catReq.getNombre());
                categoria.setTorneo(torneo);
            }
            categoria.setMaxParejas(catReq.getMaxParejas());
            categoriaTorneoRepository.save(categoria);
        }
        
        return torneoRepository.findByIdWithCategorias(id).orElse(torneo);
    }

    @Transactional
    public Torneo cambiarEstado(Long id, EstadoTorneo estado) {
        Torneo torneo = findById(id);
        torneo.setEstado(estado);
        return torneoRepository.save(torneo);
    }

    @Transactional
    public void deleteTorneo(Long id) {
        if (!torneoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Torneo no encontrado");
        }
        long inscritos = inscripcionRepository.countByTorneoIdAndEstado(id, EstadoInscripcion.ACTIVA);
        if (inscritos > 0) {
            throw new BusinessException("No se puede eliminar el torneo porque tiene " + inscritos + " inscripcion(es). Elimina las inscripciones primero.");
        }
        torneoRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<InscripcionTorneoDto> getInscripciones(Long torneoId) {
        return inscripcionRepository.findByTorneoIdAndEstado(torneoId, EstadoInscripcion.ACTIVA).stream()
                .map(InscripcionTorneoDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InscripcionTorneoPerfilDto> getMisInscripciones(String emailUsuario) {
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        return inscripcionRepository.findActivasByUser1IdAndEstado(usuario.getId(), EstadoInscripcion.ACTIVA, java.time.LocalDate.now()).stream()
                .map(InscripcionTorneoPerfilDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public void inscribirse(Long torneoId, String emailUsuario, InscripcionTorneoRequest request) {
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Torneo torneo = findById(torneoId);

        if (torneo.getEstado() != EstadoTorneo.ABIERTO) {
            throw new BusinessException("El torneo no está abierto a inscripciones");
        }

        if (torneo.getFechaCierreInscripcion() != null && LocalDate.now().isAfter(torneo.getFechaCierreInscripcion())) {
            throw new BusinessException("El plazo de inscripción ha cerrado");
        }

        CategoriaTorneo categoria = categoriaTorneoRepository.findById(request.getCategoriaId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoria no encontrada"));
        
        if (!categoria.getTorneo().getId().equals(torneoId)) {
            throw new BusinessException("La categoria no pertenece a este torneo");
        }

        // Validar que el usuario no esté inscrito en otra categoría del mismo torneo
        boolean yaInscritoEnOtraCategoria = inscripcionRepository
                .existsByTorneoIdAndUser1IdAndEstadoAndCategoriaTorneoIdNot(
                        torneoId, usuario.getId(), EstadoInscripcion.ACTIVA, request.getCategoriaId());
        if (yaInscritoEnOtraCategoria) {
            throw new BusinessException("Ya estas inscrito en otra categoria de este torneo");
        }
        
        // Validar que no esté inscrito en esta misma categoría
        boolean yaInscritoEnEstaCategoria = inscripcionRepository
                .existsByTorneoIdAndUser1IdAndEstado(torneoId, usuario.getId(), EstadoInscripcion.ACTIVA);
        if (yaInscritoEnEstaCategoria) {
            throw new BusinessException("Ya estas inscrito en este torneo");
        }

        // Validar cupo por categoría
        long count = inscripcionRepository.countByCategoriaTorneoIdAndEstado(request.getCategoriaId(), EstadoInscripcion.ACTIVA);
        if (count >= categoria.getMaxParejas()) {
            throw new BusinessException("La categoria '" + categoria.getNombre() + "' esta llena");
        }

        InscripcionTorneo inscripcion = new InscripcionTorneo();
        inscripcion.setTorneo(torneo);
        inscripcion.setUser1(usuario);
        inscripcion.setNombreCompanero(request.getNombreCompanero());
        inscripcion.setCategoriaTorneo(categoria);
        inscripcion.setPagado(false);
        inscripcion.setFechaInscripcion(LocalDate.now());
        inscripcion.setEstado(EstadoInscripcion.ACTIVA);

        inscripcionRepository.save(inscripcion);
    }

    @Transactional
    public void cancelarInscripcion(Long inscripcionId, String emailUsuario) {
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        InscripcionTorneo inscripcion = inscripcionRepository.findById(inscripcionId)
                .orElseThrow(() -> new ResourceNotFoundException("Inscripcion no encontrada"));

        if (!inscripcion.getUser1().getId().equals(usuario.getId())) {
            throw new BusinessException("No puedes cancelar una inscripcion que no es tuya");
        }

        inscripcion.setEstado(EstadoInscripcion.CANCELADA);
        inscripcionRepository.save(inscripcion);
    }

    @Transactional
    public InscripcionTorneoDto marcarPagado(Long inscripcionId, boolean pagado) {
        InscripcionTorneo inscripcion = inscripcionRepository.findById(inscripcionId)
                .orElseThrow(() -> new ResourceNotFoundException("Inscripcion no encontrada"));
        inscripcion.setPagado(pagado);
        InscripcionTorneo saved = inscripcionRepository.save(inscripcion);
        // Forzar carga de relaciones lazy antes de cerrar la transacción
        saved.getTorneo().getId();
        saved.getUser1().getId();
        saved.getCategoriaTorneo().getId();
        return InscripcionTorneoDto.fromEntity(saved);
    }

    private Torneo mapToEntity(TorneoRequest request) {
        Torneo torneo = new Torneo();
        torneo.setTitulo(request.getTitulo());
        torneo.setDescripcion(request.getDescripcion());
        torneo.setFechaInicio(request.getFechaInicio());
        torneo.setFechaFin(request.getFechaFin());
        torneo.setPrecioPareja(request.getPrecioPareja());
        torneo.setImagenUrl(request.getImagenUrl());
        if (request.getEstado() != null) {
            torneo.setEstado(request.getEstado());
        }
        if (request.getFechaCierreInscripcion() != null) {
            torneo.setFechaCierreInscripcion(request.getFechaCierreInscripcion());
        }
        return torneo;
    }
}
