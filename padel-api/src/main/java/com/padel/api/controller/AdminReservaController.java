package com.padel.api.controller;

import com.padel.api.dto.CambioEstadoReservaRequest;
import com.padel.api.dto.ReservaManualRequest;
import com.padel.api.service.AdminReservaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/reservas")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminReservaController {

    private final AdminReservaService adminReservaService;

    @GetMapping
    public List<Map<String, Object>> listarReservasPorFecha(@RequestParam("fecha") String fechaStr) {
        LocalDate fecha = LocalDate.parse(fechaStr);
        return adminReservaService.listarAgendaPorFecha(fecha);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> borrarReservaAdmin(@PathVariable Long id) {
        adminReservaService.borrarReservaAdmin(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/manual")
    public ResponseEntity<?> crearReservaManual(@Valid @RequestBody ReservaManualRequest request) {
        return ResponseEntity.ok(adminReservaService.crearReservaManual(request));
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstadoReserva(
            @PathVariable Long id,
            @Valid @RequestBody CambioEstadoReservaRequest request) {
        adminReservaService.cambiarEstadoReserva(id, request.getEstado());
        return ResponseEntity.ok().build();
    }
}
