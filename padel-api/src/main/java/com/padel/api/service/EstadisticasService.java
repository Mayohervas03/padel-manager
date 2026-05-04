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

    public Map<String, Long> getOcupacion() {
        List<Object[]> results = reservaRepository.getOcupacionPistas();
        Map<String, Long> ocupacion = new HashMap<>();
        for (Object[] row : results) {
            String pista = (String) row[0];
            Long total = ((Number) row[1]).longValue();
            ocupacion.put(pista, total);
        }
        return ocupacion;
    }

    public List<Map<String, Object>> getIngresos() {
        LocalDate limite = LocalDate.now().minusDays(30);
        List<Object[]> results = reservaRepository.getIngresosDias(limite);

        List<Map<String, Object>> ingresos = new ArrayList<>();
        for (Object[] row : results) {
            Map<String, Object> map = new HashMap<>();
            map.put("fecha", row[0].toString());
            map.put("total", ((Number) row[1]).doubleValue());
            ingresos.add(map);
        }
        return ingresos;
    }

    public Map<String, Long> getHoras() {
        List<Object[]> results = reservaRepository.getOcupacionHoras();
        Map<String, Long> horas = new HashMap<>();
        for (Object[] row : results) {
            String hora = row[0].toString();
            Long total = ((Number) row[1]).longValue();
            horas.put(hora, total);
        }
        return horas;
    }
}
