package com.padel.api.controller;

import com.padel.api.dto.InscripcionTorneoRequest;
import com.padel.api.dto.TorneoRequest;
import com.padel.api.model.Torneo;
import com.padel.api.service.TorneoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/torneos")
@RequiredArgsConstructor
public class TorneoController {

    private final TorneoService torneoService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Torneo>> getAllTorneos() {
        return ResponseEntity.ok(torneoService.findAll());
    }

    @GetMapping("/activos")
    public ResponseEntity<List<Torneo>> getTorneosActivos() {
        return ResponseEntity.ok(torneoService.findActivos());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Torneo> createTorneo(@Valid @RequestBody TorneoRequest request) {
        return ResponseEntity.ok(torneoService.createTorneo(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Torneo> updateTorneo(@PathVariable Long id, @Valid @RequestBody TorneoRequest request) {
        return ResponseEntity.ok(torneoService.updateTorneo(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTorneo(@PathVariable Long id) {
        torneoService.deleteTorneo(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/inscripciones")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getInscripciones(@PathVariable Long id) {
        return ResponseEntity.ok(torneoService.getInscripciones(id));
    }

    @PostMapping("/{id}/inscribirse")
    public ResponseEntity<Void> inscribirse(@PathVariable Long id, @RequestBody InscripcionTorneoRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        torneoService.inscribirse(id, email, request);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/inscripciones/{inscripcionId}/pagado")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> marcarPagado(@PathVariable Long inscripcionId, @RequestParam boolean pagado) {
        return ResponseEntity.ok(torneoService.marcarPagado(inscripcionId, pagado));
    }
}
