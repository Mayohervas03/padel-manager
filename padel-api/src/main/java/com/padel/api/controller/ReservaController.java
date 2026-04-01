package com.padel.api.controller;

import com.padel.api.model.Reserva;
import com.padel.api.repository.ReservaRepository;
import com.padel.api.repository.UsuarioRepository;
import com.padel.api.model.Usuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/reservas")
@CrossOrigin(origins = "http://localhost:4200")
public class ReservaController {

    @Autowired
    private ReservaRepository reservaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    // Listar reservas (ADMIN = Todas, USER = Solo las suyas)
    @GetMapping
    public List<Reserva> listarReservas() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioRepository.findByEmail(email).orElseThrow();
        
        List<Reserva> lista;
        if ("ADMIN".equals(usuario.getRol())) {
            lista = reservaRepository.findAll();
        } else {
            lista = reservaRepository.findByUsuarioEmail(email);
        }
        
        return lista;
    }

    // Guardar una nueva reserva
    @PostMapping
    public ResponseEntity<?> crearReserva(@RequestBody Reserva reserva) {
        
        // Obtener al usuario autenticado usando SecurityContextHolder
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioRepository.findByEmail(email).orElseThrow();
        
        // Asignarlo a la reserva directamente
        reserva.setUsuario(usuario);

        // REGLAS DE NEGOCIO
        if (reserva.getFecha().isBefore(LocalDate.now())) {
            return ResponseEntity.badRequest().body("No puedes reservar en una fecha pasada.");
        }

        if (reserva.getHora().isBefore(LocalTime.of(9, 0)) || reserva.getHora().isAfter(LocalTime.of(23, 0))) {
            return ResponseEntity.badRequest().body("El horario del club es de 09:00 a 23:00.");
        }

        if (reserva.getFecha().isEqual(LocalDate.now()) && !reserva.getHora().isAfter(LocalTime.now())) {
            return ResponseEntity.badRequest().body("Esa hora ya ha pasado en el día de hoy.");
        }

        // VALIDACIÓN ROBUSTA: Usamos IDs
        boolean ocupada = reservaRepository.existsByPistaIdAndFechaAndHora(
                reserva.getPista().getId(),
                reserva.getFecha(),
                reserva.getHora()
        );

        if (ocupada) {
            return ResponseEntity.badRequest().body("⚠️ Esa pista ya está reservada a esa hora.");
        }

        Reserva nuevaReserva = reservaRepository.save(reserva);
        return ResponseEntity.ok(nuevaReserva);
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<?> borrarReserva(@PathVariable Long id) {
        if (!reservaRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        reservaRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
