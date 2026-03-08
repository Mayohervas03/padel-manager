package com.padel.api;

import com.padel.api.model.Usuario;
import com.padel.api.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataLoader implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;

    public DataLoader(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Comprobamos si ya hay usuarios para no duplicarlos cada vez que arrancamos
        if (usuarioRepository.count() == 0) {

            Usuario admin = new Usuario();
            admin.setNombre("Admin Principal");
            admin.setEmail("admin@padel.com");
            admin.setPassword("admin123"); // En el futuro cifraremos esto
            admin.setRol("ADMIN");

            usuarioRepository.save(admin);

            Usuario jugador = new Usuario();
            jugador.setNombre("Juan Jugador");
            jugador.setEmail("juan@padel.com");
            jugador.setPassword("juan123");
            jugador.setRol("JUGADOR");

            usuarioRepository.save(jugador);

            System.out.println("✅ Usuarios de prueba cargados correctamente");
        }
    }
}
