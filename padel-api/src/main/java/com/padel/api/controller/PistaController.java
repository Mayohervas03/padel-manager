package com.padel.api.controller;

import com.padel.api.model.Pista;
import com.padel.api.repository.PistaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pistas")
@CrossOrigin(origins = "http://localhost:4200")
public class PistaController {

    @Autowired
    private PistaRepository pistaRepository;

    @GetMapping
    public List<Pista> listarPistas() {
        return pistaRepository.findAll();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Pista guardarPista(@RequestBody Pista pista) {
        return pistaRepository.save(pista);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Pista actualizarPista(@PathVariable Long id, @RequestBody Pista pista) {
        pista.setId(id);
        return pistaRepository.save(pista);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void borrarPista(@PathVariable Long id) {
        pistaRepository.deleteById(id);
    }
}