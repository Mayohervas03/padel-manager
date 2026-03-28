package com.padel.api.controller;

import com.padel.api.dto.AuthRequest;
import com.padel.api.dto.AuthResponse;
import com.padel.api.dto.RegisterRequest;
import com.padel.api.model.Usuario;
import com.padel.api.repository.UsuarioRepository;
import com.padel.api.security.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        
        // Verificamos si el email ya existe
        if (usuarioRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("El email ya está en uso");
        }

        Usuario nuevoUsuario = new Usuario();
        nuevoUsuario.setNombre(request.getNombre());
        nuevoUsuario.setEmail(request.getEmail());
        // Encriptar la contraseña
        nuevoUsuario.setPassword(passwordEncoder.encode(request.getPassword()));
        
        // Evaluar Rol de Administrador
        if (request.getEmail().toLowerCase().contains("admin")) {
            nuevoUsuario.setRol("ADMIN");
        } else {
            nuevoUsuario.setRol("USER");
        }

        usuarioRepository.save(nuevoUsuario);

        return ResponseEntity.status(HttpStatus.CREATED).body("Usuario registrado con éxito");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request) {
        
        // Buscar el usuario directamente en BD
        Optional<Usuario> usuarioOp = usuarioRepository.findByEmail(request.getEmail());

        if (usuarioOp.isPresent()) {
            Usuario usuario = usuarioOp.get();
            // Comparamos el password que viene en limpio con el hasheado en BD
            if (passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
                // Generamos token
                String token = jwtUtil.generateToken(usuario.getEmail());
                return ResponseEntity.ok(new AuthResponse(token, usuario.getEmail(), usuario.getRol()));
            }
        }
        
        // Credenciales inválidas
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciales inválidas");
    }
}
