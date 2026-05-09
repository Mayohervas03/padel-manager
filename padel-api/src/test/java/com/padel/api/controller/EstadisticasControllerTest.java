package com.padel.api.controller;

import com.padel.api.service.EstadisticasService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EstadisticasControllerTest {

    @Mock
    private EstadisticasService estadisticasService;

    @InjectMocks
    private EstadisticasController estadisticasController;

    @Test
    void getOcupacion_sinFiltroFecha() {
        Map<String, Long> ocupacion = new HashMap<>();
        ocupacion.put("Pista 1", 5L);
        ocupacion.put("Pista 2", 3L);

        when(estadisticasService.getOcupacion(null, null)).thenReturn(ocupacion);

        ResponseEntity<Map<String, Long>> response = estadisticasController.getOcupacion(null, null);

        assertEquals(200, response.getStatusCode().value());
        assertEquals(5L, response.getBody().get("Pista 1"));
        assertEquals(3L, response.getBody().get("Pista 2"));
    }

    @Test
    void getOcupacion_conRangoFecha() {
        Map<String, Long> ocupacion = new HashMap<>();
        ocupacion.put("Pista 1", 2L);

        LocalDate desde = LocalDate.of(2024, 1, 1);
        LocalDate hasta = LocalDate.of(2024, 1, 31);
        when(estadisticasService.getOcupacion(desde, hasta)).thenReturn(ocupacion);

        ResponseEntity<Map<String, Long>> response = estadisticasController.getOcupacion(desde, hasta);

        assertEquals(200, response.getStatusCode().value());
        assertEquals(2L, response.getBody().get("Pista 1"));
    }

    @Test
    void getIngresos_sinFiltroFecha() {
        List<Map<String, Object>> ingresos = List.of(
                Map.of("fecha", "2024-01-01", "total", 150.0)
        );

        when(estadisticasService.getIngresos(null, null)).thenReturn(ingresos);

        ResponseEntity<List<Map<String, Object>>> response = estadisticasController.getIngresos(null, null);

        assertEquals(200, response.getStatusCode().value());
        assertEquals(1, response.getBody().size());
        assertEquals("2024-01-01", response.getBody().get(0).get("fecha"));
        assertEquals(150.0, response.getBody().get(0).get("total"));
    }

    @Test
    void getHoras_sinFiltroFecha() {
        Map<String, Long> horas = new HashMap<>();
        horas.put("10:00", 5L);

        when(estadisticasService.getHoras(null, null)).thenReturn(horas);

        ResponseEntity<Map<String, Long>> response = estadisticasController.getHoras(null, null);

        assertEquals(200, response.getStatusCode().value());
        assertEquals(5L, response.getBody().get("10:00"));
    }

    @Test
    void getOcupacion_conRangoFecha_pasaParametrosCorrectos() {
        LocalDate desde = LocalDate.of(2024, 6, 1);
        LocalDate hasta = LocalDate.of(2024, 6, 30);

        when(estadisticasService.getOcupacion(desde, hasta)).thenReturn(new HashMap<>());

        estadisticasController.getOcupacion(desde, hasta);

        // Verifica que el servicio recibió exactamente esas fechas
        // (Mockito ya verifica esto implícitamente con el when)
    }
}
