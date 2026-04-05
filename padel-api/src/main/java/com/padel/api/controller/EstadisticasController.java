package com.padel.api.controller;

import com.padel.api.repository.ReservaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/admin/stats")
@CrossOrigin(origins = "http://localhost:4200")
@PreAuthorize("hasRole('ADMIN')")
public class EstadisticasController {

    @Autowired
    private ReservaRepository reservaRepository;

    @GetMapping("/ocupacion")
    public ResponseEntity<Map<String, Long>> getOcupacion() {
        List<Object[]> results = reservaRepository.getOcupacionPistas();
        Map<String, Long> ocupacion = new HashMap<>();
        for (Object[] row : results) {
            String pista = (String) row[0];
            Long total = ((Number) row[1]).longValue();
            ocupacion.put(pista, total);
        }
        return ResponseEntity.ok(ocupacion);
    }

    @GetMapping("/ingresos")
    public ResponseEntity<List<Map<String, Object>>> getIngresos() {
        LocalDate limite = LocalDate.now().minusDays(30);
        List<Object[]> results = reservaRepository.getIngresosDias(limite);
        
        List<Map<String, Object>> ingresos = new ArrayList<>();
        for (Object[] row : results) {
            Map<String, Object> map = new HashMap<>();
            map.put("fecha", row[0].toString());
            map.put("total", ((Number) row[1]).doubleValue());
            ingresos.add(map);
        }
        return ResponseEntity.ok(ingresos);
    }

    @GetMapping("/horas")
    public ResponseEntity<Map<String, Long>> getHoras() {
        List<Object[]> results = reservaRepository.getOcupacionHoras();
        Map<String, Long> horas = new HashMap<>();
        for (Object[] row : results) {
            String hora = row[0].toString();
            Long total = ((Number) row[1]).longValue();
            horas.put(hora, total);
        }
        return ResponseEntity.ok(horas);
    }
}
