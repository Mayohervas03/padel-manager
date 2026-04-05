package com.padel.api.controller;

import com.padel.api.model.Pista;
import com.padel.api.repository.PistaRepository;
import com.padel.api.repository.ReservaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/pistas")
@CrossOrigin(origins = "http://localhost:4200")
@PreAuthorize("hasRole('ADMIN')")
public class AdminPistaController {

    @Autowired
    private PistaRepository pistaRepository;

    @Autowired
    private ReservaRepository reservaRepository;

    @GetMapping
    public List<Pista> listarTodas() {
        return pistaRepository.findAll();
    }

    @PostMapping
    public Pista crearPista(@RequestBody Pista pista) {
        pista.setActivo(true);
        return pistaRepository.save(pista);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> borrarPista(@PathVariable Long id) {
        if (!pistaRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        // Borrado en cascada manual
        reservaRepository.deleteByPistaId(id);
        pistaRepository.deleteById(id);
        return ResponseEntity.ok().body("Pista y reservas asociadas borradas correctamente.");
    }
}
