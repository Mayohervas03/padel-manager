package com.padel.api.controller;

import com.padel.api.model.Usuario;
import com.padel.api.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/usuarios")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping
    public ResponseEntity<?> listarTodos() {
        return ResponseEntity.ok(usuarioService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Usuario> buscarPorId(@PathVariable("id") Long id) {
        return ResponseEntity.ok(usuarioService.buscarPorId(id));
    }

    @GetMapping({"/search", "/buscar"})
    public ResponseEntity<Usuario> buscarPorEmail(@RequestParam("email") String email) {
        return ResponseEntity.ok(usuarioService.buscarPorEmail(email));
    }

    @PutMapping("/{id}/rol")
    public ResponseEntity<Usuario> cambiarRol(@PathVariable("id") Long id, @RequestBody String nuevoRol) {
        Usuario usuario = usuarioService.buscarPorId(id);
        usuario.setRol(nuevoRol.replace("\"", ""));
        // Nota: deberia ir a un metodo especifico en el servicio
        return ResponseEntity.ok(usuario);
    }
}
