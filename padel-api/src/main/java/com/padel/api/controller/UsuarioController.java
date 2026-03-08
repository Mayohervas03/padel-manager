package com.padel.api.controller;

import com.padel.api.model.Usuario;
import com.padel.api.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController // Indica que esta clase responderá peticiones web
@RequestMapping("/api/usuarios") // La dirección base será: localhost:8080/api/usuarios
@CrossOrigin(origins = "http://localhost:4200") // ¡IMPORTANTE! Esto permite que Angular (puerto 4200) nos hable luego
public class UsuarioController {

    @Autowired // Inyecta el repositorio automáticamente (sin hacer new Repository)
    private UsuarioRepository usuarioRepository;

    // Petición GET para listar todos
    @GetMapping
    public List<Usuario> listarUsuarios() {
        return usuarioRepository.findAll();
    }

    // Petición POST para guardar uno nuevo
    @PostMapping
    public Usuario guardarUsuario(@RequestBody Usuario usuario) {
        return usuarioRepository.save(usuario);
    }
    // Petición DELETE para borrar un usuario por su ID
    @DeleteMapping("/{id}")
    public void borrarUsuario(@PathVariable Long id) {
        usuarioRepository.deleteById(id);
    }
    // Petición PUT para actualizar un usuario existente
    @PutMapping("/{id}")
    public Usuario actualizarUsuario(@PathVariable Long id, @RequestBody Usuario usuarioDetalles) {
        // 1. Buscamos el usuario en la BD
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // 2. Actualizamos sus datos
        usuario.setNombre(usuarioDetalles.getNombre());
        usuario.setEmail(usuarioDetalles.getEmail());
        usuario.setRol(usuarioDetalles.getRol());

        // (Nota: No actualizamos la contraseña aquí para no borrarla accidentalmente)

        // 3. Guardamos los cambios
        return usuarioRepository.save(usuario);
    }
}
