package com.padel.api.service;

import com.padel.api.dto.PistaRequest;
import com.padel.api.exception.ResourceNotFoundException;
import com.padel.api.model.Pista;
import com.padel.api.repository.PistaRepository;
import com.padel.api.repository.ReservaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PistaService {

    private final PistaRepository pistaRepository;
    private final ReservaRepository reservaRepository;

    public List<Pista> listarTodas() {
        return pistaRepository.findAll();
    }

    public Pista buscarPorId(Long id) {
        return pistaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pista no encontrada"));
    }

    @Transactional
    public Pista crearPista(PistaRequest request) {
        Pista pista = new Pista();
        pista.setNombre(request.getNombre());
        pista.setTipo(request.getTipo());
        pista.setUbicacion(request.getUbicacion());
        pista.setPrecio(request.getPrecio());
        pista.setActivo(true);
        return pistaRepository.save(pista);
    }

    @Transactional
    public Pista actualizarPista(Long id, PistaRequest request) {
        Pista pista = buscarPorId(id);
        pista.setNombre(request.getNombre());
        pista.setTipo(request.getTipo());
        pista.setUbicacion(request.getUbicacion());
        pista.setPrecio(request.getPrecio());
        if (request.getActivo() != null) {
            pista.setActivo(request.getActivo());
        }
        return pistaRepository.save(pista);
    }

    @Transactional
    public void borrarPista(Long id) {
        if (!pistaRepository.existsById(id)) {
            throw new ResourceNotFoundException("Pista no encontrada");
        }
        reservaRepository.deleteByPistaId(id);
        pistaRepository.deleteById(id);
    }
}
