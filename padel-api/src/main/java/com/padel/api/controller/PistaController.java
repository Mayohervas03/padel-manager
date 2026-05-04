package com.padel.api.controller;

import com.padel.api.dto.PistaRequest;
import com.padel.api.model.Pista;
import com.padel.api.service.PistaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/pistas")
@RequiredArgsConstructor
public class PistaController {

    private final PistaService pistaService;

    @GetMapping
    public List<Pista> listarPistas() {
        return pistaService.listarTodas();
    }

    @GetMapping("/disponibles")
    public List<Pista> getPistasDisponibles(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime hora) {
        return pistaService.listarTodas();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Pista guardarPista(@Valid @RequestBody PistaRequest request) {
        return pistaService.crearPista(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Pista actualizarPista(@PathVariable Long id, @Valid @RequestBody PistaRequest request) {
        return pistaService.actualizarPista(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void borrarPista(@PathVariable Long id) {
        pistaService.borrarPista(id);
    }
}
