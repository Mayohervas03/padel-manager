package com.padel.api.controller;

import com.padel.api.service.EstadisticasService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/stats")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class EstadisticasController {

    private final EstadisticasService estadisticasService;

    @GetMapping("/ocupacion")
    public ResponseEntity<Map<String, Long>> getOcupacion() {
        return ResponseEntity.ok(estadisticasService.getOcupacion());
    }

    @GetMapping("/ingresos")
    public ResponseEntity<List<Map<String, Object>>> getIngresos() {
        return ResponseEntity.ok(estadisticasService.getIngresos());
    }

    @GetMapping("/horas")
    public ResponseEntity<Map<String, Long>> getHoras() {
        return ResponseEntity.ok(estadisticasService.getHoras());
    }
}
