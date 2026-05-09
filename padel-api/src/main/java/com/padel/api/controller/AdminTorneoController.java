package com.padel.api.controller;

import com.padel.api.dto.InscripcionTorneoDto;
import com.padel.api.model.EstadoTorneo;
import com.padel.api.model.Torneo;
import com.padel.api.service.TorneoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Slf4j
public class AdminTorneoController {

    private final TorneoService torneoService;

    @GetMapping("/torneos/{id}")
    public ResponseEntity<Torneo> getTorneo(@PathVariable Long id) {
        logSecurityInfo();
        return ResponseEntity.ok(torneoService.findById(id));
    }

    private void logSecurityInfo() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            log.info("Request Admin by User: {} | Authorities: {}", auth.getName(), auth.getAuthorities());
        } else {
            log.warn("Request Admin with NO Authentication context!");
        }
    }

    @GetMapping("/torneos/{id}/inscripciones")
    public ResponseEntity<List<InscripcionTorneoDto>> getInscripciones(@PathVariable Long id) {
        logSecurityInfo();
        return ResponseEntity.ok(torneoService.getInscripciones(id));
    }

    @PatchMapping("/inscripciones/{id}/pago")
    public ResponseEntity<InscripcionTorneoDto> updatePago(@PathVariable Long id, @RequestParam boolean pagado) {
        logSecurityInfo();
        return ResponseEntity.ok(torneoService.marcarPagado(id, pagado));
    }

    @PatchMapping("/torneos/{id}/estado")
    public ResponseEntity<Torneo> cambiarEstado(@PathVariable Long id, @RequestParam EstadoTorneo estado) {
        logSecurityInfo();
        return ResponseEntity.ok(torneoService.cambiarEstado(id, estado));
    }
}
