package com.padel.api.controller;

import com.padel.api.model.Usuario;
import com.padel.api.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;
import com.padel.api.repository.ReservaRepository;
import com.padel.api.dto.PerfilDTO;
import com.padel.api.dto.PasswordChangeRequest;
import com.padel.api.model.Reserva;

@RestController // Indica que esta clase responderá peticiones web
@RequestMapping("/api/usuarios") // La dirección base será: localhost:8080/api/usuarios
@CrossOrigin(origins = "http://localhost:4200") // ¡IMPORTANTE! Esto permite que Angular (puerto 4200) nos hable luego
public class UsuarioController {

    @Autowired // Inyecta el repositorio automáticamente (sin hacer new Repository)
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ReservaRepository reservaRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

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

    @GetMapping("/me")
    public ResponseEntity<PerfilDTO> getMiPerfil() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        LocalDate today = LocalDate.now();
        YearMonth currentMonth = YearMonth.from(today);
        LocalDate startOfMonth = currentMonth.atDay(1);
        LocalDate endOfMonth = currentMonth.atEndOfMonth();

        long partidosMes = reservaRepository.countByUsuarioIdAndFechaBetween(usuario.getId(), startOfMonth, endOfMonth);

        List<Reserva> reservas = reservaRepository.findByUsuarioEmail(email);
        Optional<Reserva> proximaReservaOpt = reservas.stream()
                .filter(r -> {
                    LocalDateTime fechaHora = LocalDateTime.of(r.getFecha(), r.getHora());
                    return fechaHora.isAfter(LocalDateTime.now());
                })
                .min((r1, r2) -> {
                    LocalDateTime dt1 = LocalDateTime.of(r1.getFecha(), r1.getHora());
                    LocalDateTime dt2 = LocalDateTime.of(r2.getFecha(), r2.getHora());
                    return dt1.compareTo(dt2);
                });

        String proximaStr = proximaReservaOpt
                .map(r -> r.getFecha().toString() + " " + r.getHora().toString())
                .orElse("Sin partidos próximos");

        PerfilDTO perfil = new PerfilDTO();
        perfil.setNombre(usuario.getNombre());
        perfil.setEmail(usuario.getEmail());
        perfil.setProximaReserva(proximaStr);
        perfil.setPartidosMes(partidosMes);

        return ResponseEntity.ok(perfil);
    }

    @PutMapping("/password")
    public ResponseEntity<?> cambiarPassword(@RequestBody PasswordChangeRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!passwordEncoder.matches(request.getOldPassword(), usuario.getPassword())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("La contraseña actual es incorrecta");
        }

        usuario.setPassword(passwordEncoder.encode(request.getNewPassword()));
        usuarioRepository.save(usuario);

        return ResponseEntity.ok("Contraseña actualizada correctamente");
    }
}
