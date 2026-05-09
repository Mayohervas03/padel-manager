package com.padel.api.service;

import com.padel.api.repository.ReservaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EstadisticasService {

    private final ReservaRepository reservaRepository;

    public Map<String, Long> getOcupacion(LocalDate desde, LocalDate hasta) {
        List<Object[]> results = (desde != null && hasta != null)
                ? reservaRepository.getOcupacionPistasBetween(desde, hasta)
                : reservaRepository.getOcupacionPistas();
        Map<String, Long> ocupacion = new HashMap<>();
        for (Object[] row : results) {
            String pista = (String) row[0];
            Long total = ((Number) row[1]).longValue();
            ocupacion.put(pista, total);
        }
        return ocupacion;
    }

    public List<Map<String, Object>> getIngresos(LocalDate desde, LocalDate hasta) {
        List<Object[]> results;
        if (desde != null && hasta != null) {
            results = reservaRepository.getIngresosDiasBetween(desde, hasta);
        } else {
            LocalDate limite = LocalDate.now().minusDays(30);
            results = reservaRepository.getIngresosDias(limite);
        }

        List<Map<String, Object>> ingresos = new ArrayList<>();
        for (Object[] row : results) {
            Map<String, Object> map = new HashMap<>();
            map.put("fecha", row[0].toString());
            map.put("total", ((Number) row[1]).doubleValue());
            ingresos.add(map);
        }
        return ingresos;
    }

    public Map<String, Long> getHoras(LocalDate desde, LocalDate hasta) {
        List<Object[]> results = (desde != null && hasta != null)
                ? reservaRepository.getOcupacionHorasBetween(desde, hasta)
                : reservaRepository.getOcupacionHoras();
        Map<String, Long> horas = new HashMap<>();
        for (Object[] row : results) {
            String hora = row[0].toString();
            Long total = ((Number) row[1]).longValue();
            horas.put(hora, total);
        }
        return horas;
    }
}
