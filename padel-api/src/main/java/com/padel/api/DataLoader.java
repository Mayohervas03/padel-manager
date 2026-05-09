package com.padel.api;

import com.padel.api.model.Producto;
import com.padel.api.model.Usuario;
import com.padel.api.repository.ProductoRepository;
import com.padel.api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final ProductoRepository productoRepository;
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

        if (productoRepository.count() == 0) {
            productoRepository.save(createProducto("Pala Bullpadel Hack 03", "Pala profesional de máximo control y potencia. Forma diamante, carbono 18K.", 289.99, 15, Producto.CategoriaProducto.PALAS, "https://www.bullpadel.com/12345-large_default/pala-bullpadel-hack-03-2024.jpg"));
            productoRepository.save(createProducto("Pala HEAD Delta Pro", "Pala de máxima potencia con tecnología Auxetic. Para jugadores de nivel avanzado.", 319.00, 8, Producto.CategoriaProducto.PALAS, "https://www.head.com/67890-large_default/delta-pro-2024.jpg"));
            productoRepository.save(createProducto("Pala Nox AT10 Genius", "Pala versátil de Agustín Tapia. Gran manejabilidad y salida de bola.", 259.95, 12, Producto.CategoriaProducto.PALAS, "https://www.noxsport.com/11111-large_default/at10-genius.jpg"));
            productoRepository.save(createProducto("Camiseta Bullpadel Pro", "Camiseta técnica transpirable para competición. 100% poliéster.", 39.99, 30, Producto.CategoriaProducto.ROPA, "https://www.bullpadel.com/22222-large_default/camiseta-pro.jpg"));
            productoRepository.save(createProducto("Pantalón Corto Premium", "Short deportivo con bolsillos laterales y cintura elástica.", 29.99, 25, Producto.CategoriaProducto.ROPA, "https://example.com/short.jpg"));
            productoRepository.save(createProducto("Overgrip Pro Perforado", "Pack 3 overgrips absorbentes con acabado perforado. Color blanco.", 9.99, 50, Producto.CategoriaProducto.ACCESORIOS, "https://example.com/overgrip.jpg"));
            productoRepository.save(createProducto("Pelotas HEAD Pro S", "Bote 3 pelotas de padel de alto rendimiento. Presión óptima para pistas.", 7.50, 100, Producto.CategoriaProducto.ACCESORIOS, "https://example.com/pelotas.jpg"));
            productoRepository.save(createProducto("Mochila Bullpadel", "Mochila técnica con compartimento térmico para palas.", 69.95, 10, Producto.CategoriaProducto.ACCESORIOS, "https://example.com/mochila.jpg"));

            System.out.println("Productos de prueba cargados correctamente");
        }
    }

    private Producto createProducto(String nombre, String descripcion, double precio, int stock, Producto.CategoriaProducto categoria, String imagenUrl) {
        Producto p = new Producto();
        p.setNombre(nombre);
        p.setDescripcion(descripcion);
        p.setPrecio(precio);
        p.setStock(stock);
        p.setCategoria(categoria);
        p.setImagenUrl(imagenUrl);
        return p;
    }
}
