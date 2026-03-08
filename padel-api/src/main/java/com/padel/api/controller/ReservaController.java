package com.padel.api.controller;

import com.padel.api.model.Reserva;
import com.padel.api.repository.ReservaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservas")
@CrossOrigin(origins = "http://localhost:4200")
public class ReservaController {

    @Autowired
    private ReservaRepository reservaRepository;

    // Listar todas las reservas
    @GetMapping
    public List<Reserva> listarReservas() {
        List<Reserva> lista = reservaRepository.findAll();
        System.out.println("Enviando " + lista.size() + " reservas al frontend");
        return lista;
    }

    // Guardar una nueva reserva
    @PostMapping
    public ResponseEntity<?> crearReserva(@RequestBody Reserva reserva) {
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
