package com.padel.api.service;

import com.padel.api.dto.ReservaRequest;
import com.padel.api.exception.BusinessException;
import com.padel.api.model.EstadoReserva;
import com.padel.api.model.Pista;
import com.padel.api.model.Reserva;
import com.padel.api.model.Usuario;
import com.padel.api.repository.ClaseRepository;
import com.padel.api.repository.PistaRepository;
import com.padel.api.repository.ReservaRepository;
import com.padel.api.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ReservaServiceIntegrationTest {

    @Autowired
    private ReservaService reservaService;

    @Autowired
    private ReservaRepository reservaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PistaRepository pistaRepository;

    @Autowired
    private ClaseRepository claseRepository;

    private Usuario usuario;
    private Pista pista;

    @BeforeEach
    void setUp() {
        usuario = new Usuario();
        usuario.setEmail("integration@test.com");
        usuario.setNombre("Integration");
        usuario.setPassword("pass");
        usuario.setRol("USER");
        usuario = usuarioRepository.save(usuario);

        pista = new Pista();
        pista.setNombre("Pista Central");
        pista.setTipo("Cristal");
        pista.setUbicacion("Interior");
        pista.setPrecio(30.0);
        pista.setActivo(true);
        pista = pistaRepository.save(pista);
    }

    @Test
    void crearReserva_guardaPrecioSnapshot() {
        ReservaRequest request = new ReservaRequest();
        request.setFecha(LocalDate.now().plusDays(1));
        request.setHora(LocalTime.of(10, 30));
        request.setPistaId(pista.getId());

        Reserva reserva = reservaService.crearReserva(usuario.getEmail(), request);

        assertNotNull(reserva.getId());
        assertEquals(30.0, reserva.getPrecioPagado());
        assertEquals(EstadoReserva.PENDIENTE, reserva.getEstado());
        assertNotNull(reserva.getCreatedAt());
    }

    @Test
    void borrarReserva_softDeleteMantieneRegistro() {
        ReservaRequest request = new ReservaRequest();
        request.setFecha(LocalDate.now().plusDays(2));
        request.setHora(LocalTime.of(10, 30));
        request.setPistaId(pista.getId());

        Reserva reserva = reservaService.crearReserva(usuario.getEmail(), request);
        Long id = reserva.getId();

        reservaService.borrarReserva(id, usuario.getEmail());

        Reserva persisted = reservaRepository.findById(id).orElseThrow();
        assertEquals(EstadoReserva.CANCELADA, persisted.getEstado());
    }

    @Test
    void dobleReservaMismaPistaFechaHora_lanzaExcepcion() {
        ReservaRequest request = new ReservaRequest();
        request.setFecha(LocalDate.now().plusDays(1));
        request.setHora(LocalTime.of(10, 30));
        request.setPistaId(pista.getId());

        reservaService.crearReserva(usuario.getEmail(), request);

        Usuario otroUsuario = new Usuario();
        otroUsuario.setEmail("otro@test.com");
        otroUsuario.setNombre("Otro");
        otroUsuario.setPassword("pass");
        otroUsuario.setRol("USER");
        otroUsuario = usuarioRepository.save(otroUsuario);

        ReservaRequest request2 = new ReservaRequest();
        request2.setFecha(request.getFecha());
        request2.setHora(request.getHora());
        request2.setPistaId(pista.getId());

        final Usuario finalOtro = otroUsuario;
        BusinessException ex = assertThrows(BusinessException.class, () ->
                reservaService.crearReserva(finalOtro.getEmail(), request2));
        assertTrue(ex.getMessage().contains("ya esta reservada"));
    }

    @Test
    void limite3ReservasActivas_bloqueaCuarta() {
        for (int i = 0; i < 3; i++) {
            ReservaRequest req = new ReservaRequest();
            req.setFecha(LocalDate.now().plusDays(i + 1));
            req.setHora(LocalTime.of(10, 30));
            req.setPistaId(pista.getId());
            reservaService.crearReserva(usuario.getEmail(), req);
        }

        ReservaRequest cuarta = new ReservaRequest();
        cuarta.setFecha(LocalDate.now().plusDays(10));
        cuarta.setHora(LocalTime.of(12, 0));
        cuarta.setPistaId(pista.getId());

        BusinessException ex = assertThrows(BusinessException.class, () ->
                reservaService.crearReserva(usuario.getEmail(), cuarta));
        assertTrue(ex.getMessage().contains("3 reservas activas"));
    }

    @Test
    void cancelarReserva_liberaSlotParaNuevaReserva() {
        ReservaRequest request = new ReservaRequest();
        request.setFecha(LocalDate.now().plusDays(2));
        request.setHora(LocalTime.of(10, 30));
        request.setPistaId(pista.getId());

        Reserva reserva = reservaService.crearReserva(usuario.getEmail(), request);
        reservaService.borrarReserva(reserva.getId(), usuario.getEmail());

        // Ahora debería poder crear otra reserva en el mismo slot
        ReservaRequest nueva = new ReservaRequest();
        nueva.setFecha(request.getFecha());
        nueva.setHora(request.getHora());
        nueva.setPistaId(pista.getId());

        assertDoesNotThrow(() -> reservaService.crearReserva(usuario.getEmail(), nueva));
    }
}
