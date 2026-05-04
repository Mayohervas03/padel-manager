package com.padel.api;

import com.padel.api.model.Usuario;
import com.padel.api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (usuarioRepository.count() == 0) {
            Usuario admin = new Usuario();
            admin.setNombre("Admin Principal");
            admin.setEmail("admin@padel.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRol("ADMIN");
            usuarioRepository.save(admin);

            Usuario jugador = new Usuario();
            jugador.setNombre("Juan Jugador");
            jugador.setEmail("juan@padel.com");
            jugador.setPassword(passwordEncoder.encode("juan123"));
            jugador.setRol("JUGADOR");
            usuarioRepository.save(jugador);

            System.out.println("Usuarios de prueba cargados correctamente");
        }
    }
}
