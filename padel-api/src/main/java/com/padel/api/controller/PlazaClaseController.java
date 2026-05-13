package com.padel.api.controller;

import com.padel.api.model.Clase;
import com.padel.api.service.ClaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clases")
@RequiredArgsConstructor
public class PlazaClaseController {

    private final ClaseService claseService;

    @GetMapping("/disponibles")
    public ResponseEntity<List<Clase>> obtenerClasesDisponibles() {
        return ResponseEntity.ok(claseService.obtenerClasesDisponibles());
    }

    @PostMapping("/{id}/inscribir")
    public ResponseEntity<Void> inscribirse(@PathVariable("id") Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        claseService.inscribirse(id, email);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/mis-clases")
    public ResponseEntity<List<Clase>> obtenerMisClases() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(claseService.obtenerMisClases(email));
    }

    @GetMapping("/mis-clases/historial")
    public ResponseEntity<List<Clase>> obtenerHistorialClases() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(claseService.obtenerHistorialClases(email));
    }

    @PostMapping("/{id}/cancelar")
    public ResponseEntity<Void> cancelarInscripcion(@PathVariable("id") Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        claseService.cancelarInscripcion(id, email);
        return ResponseEntity.ok().build();
    }
}
