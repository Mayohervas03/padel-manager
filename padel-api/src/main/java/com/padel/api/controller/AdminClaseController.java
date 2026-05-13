package com.padel.api.controller;

import com.padel.api.dto.ClaseRequest;
import com.padel.api.model.Clase;
import com.padel.api.service.ClaseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/clases")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminClaseController {

    private final ClaseService claseService;

    @GetMapping
    public ResponseEntity<List<Clase>> listarClases() {
        return ResponseEntity.ok(claseService.listarTodas());
    }

    @GetMapping("/historial")
    public ResponseEntity<List<Clase>> listarHistorialClases() {
        return ResponseEntity.ok(claseService.listarHistorial());
    }

    @PostMapping
    public ResponseEntity<Clase> crearClase(@Valid @RequestBody ClaseRequest request) {
        return ResponseEntity.ok(claseService.crearClase(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Clase> actualizarClase(@PathVariable("id") Long id, @Valid @RequestBody ClaseRequest request) {
        return ResponseEntity.ok(claseService.actualizarClase(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarClase(@PathVariable("id") Long id) {
        claseService.eliminarClase(id);
        return ResponseEntity.ok().build();
    }
}
