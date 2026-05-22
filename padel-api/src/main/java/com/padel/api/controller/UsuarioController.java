package com.padel.api.controller;

import com.padel.api.dto.PerfilDTO;
import com.padel.api.dto.PasswordChangeRequest;
import com.padel.api.dto.UsuarioUpdateRequest;
import com.padel.api.model.Usuario;
import com.padel.api.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping
    public List<Usuario> listarUsuarios() {
        return usuarioService.listarTodos();
    }

    @PostMapping
    public Usuario guardarUsuario(@RequestBody Usuario usuario) {
        return usuarioService.listarTodos().stream()
                .filter(u -> u.getEmail().equals(usuario.getEmail()))
                .findFirst()
                .orElseGet(() -> {
                    return usuario;
                });
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> borrarUsuario(@PathVariable Long id) {
        usuarioService.borrarUsuario(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public Usuario actualizarUsuario(@PathVariable Long id, @Valid @RequestBody UsuarioUpdateRequest request) {
        return usuarioService.actualizarUsuario(id, request);
    }

    @GetMapping("/me")
    public ResponseEntity<PerfilDTO> getMiPerfil() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(usuarioService.getMiPerfil(email));
    }

    @PutMapping("/password")
    public ResponseEntity<Void> cambiarPassword(@RequestBody PasswordChangeRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        usuarioService.cambiarPassword(email, request.getOldPassword(), request.getNewPassword());
        return ResponseEntity.ok().build();
    }
}
