package com.padel.api.controller;

import com.padel.api.model.Pista;
import com.padel.api.service.PistaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/pistas")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminPistaController {

    private final PistaService pistaService;

    @GetMapping
    public List<Pista> listarTodas() {
        return pistaService.listarTodas();
    }

    @PostMapping
    public Pista crearPista(@RequestBody Pista pista) {
        pista.setActivo(true);
        return pistaService.crearPista(new com.padel.api.dto.PistaRequest() {{
            setNombre(pista.getNombre());
            setTipo(pista.getTipo());
            setUbicacion(pista.getUbicacion());
            setPrecio(pista.getPrecio());
        }});
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> borrarPista(@PathVariable Long id) {
        pistaService.borrarPista(id);
        return ResponseEntity.ok().build();
    }
}
