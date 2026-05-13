package com.padel.api.controller;

import com.padel.api.dto.ReservaRequest;
import com.padel.api.model.Reserva;
import com.padel.api.service.ReservaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservas")
@RequiredArgsConstructor
public class ReservaController {

    private final ReservaService reservaService;

    @GetMapping
    public List<Reserva> listarReservas(@RequestParam(required = false, defaultValue = "false") boolean historial) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return historial 
            ? reservaService.listarTodasReservasUsuario(email)
            : reservaService.listarReservasActivasUsuario(email);
    }

    @PostMapping
    public ResponseEntity<Reserva> crearReserva(@Valid @RequestBody ReservaRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Reserva nuevaReserva = reservaService.crearReserva(email, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaReserva);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> borrarReserva(@PathVariable Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        reservaService.borrarReserva(id, email);
        return ResponseEntity.ok().build();
    }
}
