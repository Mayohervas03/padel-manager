package com.padel.api.controller;

import com.padel.api.model.Clase;
import com.padel.api.repository.ClaseRepository;
import com.padel.api.repository.ReservaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/clases")
@CrossOrigin(origins = "http://localhost:4200")
@PreAuthorize("hasRole('ADMIN')")
public class AdminClaseController {

    @Autowired
    private ClaseRepository claseRepository;

    @Autowired
    private ReservaRepository reservaRepository;

    @GetMapping
    public ResponseEntity<?> listarClases() {
        return ResponseEntity.ok(claseRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> crearClase(@RequestBody Clase clase) {
        // Validar pista disponible
        boolean ocupadaPorReserva = reservaRepository.existsByPistaIdAndFechaAndHora(clase.getPista().getId(), clase.getFecha(), clase.getHora());
        boolean ocupadaPorOtraClase = claseRepository.existsByPistaIdAndFechaAndHora(clase.getPista().getId(), clase.getFecha(), clase.getHora());

        if (ocupadaPorReserva || ocupadaPorOtraClase) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: La pista seleccionada ya está ocupada para esa fecha y hora.");
        }

        Clase guardada = claseRepository.save(clase);
        return ResponseEntity.status(HttpStatus.CREATED).body(guardada);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarClase(@PathVariable("id") Long id) {
        if (!claseRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        claseRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
