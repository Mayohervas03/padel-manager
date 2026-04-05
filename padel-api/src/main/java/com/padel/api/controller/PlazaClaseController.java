package com.padel.api.controller;

import com.padel.api.model.Clase;
import com.padel.api.model.Usuario;
import com.padel.api.repository.ClaseRepository;
import com.padel.api.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/clases")
@CrossOrigin(origins = "http://localhost:4200")
public class PlazaClaseController {

    @Autowired
    private ClaseRepository claseRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @GetMapping("/disponibles")
    public ResponseEntity<?> obtenerClasesDisponibles() {
        List<Clase> futuras = claseRepository.findByFechaGreaterThanEqualOrderByFechaAscHoraAsc(LocalDate.now());
        System.out.println("DEBUG - Clases futuras encontradas en BBDD: " + futuras.size());
        
        List<Clase> conPlazas = futuras.stream()
                .filter(c -> {
                    int ocupadas = (c.getAlumnos() != null) ? c.getAlumnos().size() : 0;
                    return ocupadas < c.getMaxAlumnos();
                })
                .collect(Collectors.toList());
                
        System.out.println("DEBUG - Clases con plazas disponibles tras filtro: " + conPlazas.size());
        return ResponseEntity.ok(conPlazas);
    }

    @PostMapping("/{id}/inscribir")
    @Transactional
    public ResponseEntity<?> inscribirse(@PathVariable("id") Long id) {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String currentUsername;
        if (principal instanceof UserDetails) {
            currentUsername = ((UserDetails) principal).getUsername();
        } else {
            currentUsername = principal.toString();
        }

        Optional<Usuario> userOpt = usuarioRepository.findByEmail(currentUsername);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuario no autenticado");
        }
        Usuario currentUser = userOpt.get();

        Optional<Clase> claseOpt = claseRepository.findById(id);
        if (claseOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Clase no encontrada");
        }
        Clase clase = claseOpt.get();

        // Check duplicated
        boolean yaInscrito = clase.getAlumnos().stream().anyMatch(u -> u.getId().equals(currentUser.getId()));
        if (yaInscrito) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Ya estás inscrito en esta clase.");
        }

        // Check available capacity
        if (clase.getAlumnos().size() >= clase.getMaxAlumnos()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("La clase ya está llena.");
        }

        // Add user safely within transaction
        clase.getAlumnos().add(currentUser);
        claseRepository.save(clase);

        return ResponseEntity.ok("Inscripción realizada con éxito.");
    }

    @GetMapping("/mis-clases")
    public ResponseEntity<?> obtenerMisClases() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String currentUsername;
        if (principal instanceof UserDetails) {
            currentUsername = ((UserDetails) principal).getUsername();
        } else {
            currentUsername = principal.toString();
        }

        Optional<Usuario> userOpt = usuarioRepository.findByEmail(currentUsername);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuario no autenticado");
        }

        List<Clase> misClases = claseRepository.findByAlumnosId(userOpt.get().getId());
        return ResponseEntity.ok(misClases);
    }
}
