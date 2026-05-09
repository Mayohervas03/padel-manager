package com.padel.api.service;

import com.padel.api.dto.ReservaRequest;
import com.padel.api.exception.BusinessException;
import com.padel.api.exception.UnauthorizedException;
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
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReservaServiceTest {

    @Mock
    private ReservaRepository reservaRepository;
    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private PistaRepository pistaRepository;
    @Mock
    private ClaseRepository claseRepository;

    @InjectMocks
    private ReservaService reservaService;

    private Usuario usuario;
    private Pista pista;
    private ReservaRequest request;

    @BeforeEach
    void setUp() {
        usuario = new Usuario();
        usuario.setId(1L);
        usuario.setEmail("test@padel.com");
        usuario.setNombre("Test User");
        usuario.setRol("USER");

        pista = new Pista();
        pista.setId(1L);
        pista.setNombre("Pista 1");
        pista.setPrecio(25.0);
        pista.setActivo(true);

        request = new ReservaRequest();
        request.setFecha(LocalDate.now().plusDays(1));
        request.setHora(LocalTime.of(10, 30));
        request.setPistaId(1L);
    }

    @Test
    void listarReservasUsuario_userSoloVeActivas() {
        when(usuarioRepository.findByEmail("test@padel.com")).thenReturn(Optional.of(usuario));
        Reserva r1 = new Reserva(); r1.setEstado(EstadoReserva.CONFIRMADA);
        Reserva r2 = new Reserva(); r2.setEstado(EstadoReserva.CANCELADA);
        when(reservaRepository.findByUsuarioEmailAndEstadoInAndFechaGreaterThanEqual(
                eq("test@padel.com"), anyList(), any(LocalDate.class)))
                .thenReturn(List.of(r1));

        List<Reserva> result = reservaService.listarReservasUsuario("test@padel.com");

        assertEquals(1, result.size());
        assertEquals(EstadoReserva.CONFIRMADA, result.get(0).getEstado());
    }

    @Test
    void listarReservasUsuario_adminVeTodasSinFiltroEstado() {
        usuario.setRol("ADMIN");
        when(usuarioRepository.findByEmail("admin@padel.com")).thenReturn(Optional.of(usuario));
        when(reservaRepository.findByFechaGreaterThanEqual(any(LocalDate.class)))
                .thenReturn(Arrays.asList(new Reserva(), new Reserva()));

        List<Reserva> result = reservaService.listarReservasUsuario("admin@padel.com");

        assertEquals(2, result.size());
    }

    @Test
    void crearReserva_exito() {
        when(usuarioRepository.findByEmail("test@padel.com")).thenReturn(Optional.of(usuario));
        when(claseRepository.existsByPistaIdAndFechaAndHora(anyLong(), any(), any())).thenReturn(false);
        when(pistaRepository.findById(1L)).thenReturn(Optional.of(pista));
        when(reservaRepository.save(any(Reserva.class))).thenAnswer(i -> i.getArgument(0));

        Reserva result = reservaService.crearReserva("test@padel.com", request);

        assertNotNull(result);
        assertEquals(EstadoReserva.CONFIRMADA, result.getEstado());
        assertEquals(25.0, result.getPrecioPagado());
        assertEquals(usuario, result.getUsuario());
        verify(reservaRepository).save(any(Reserva.class));
    }

    @Test
    void crearReserva_fechaPasada_lanzaExcepcion() {
        request.setFecha(LocalDate.now().minusDays(1));
        when(usuarioRepository.findByEmail("test@padel.com")).thenReturn(Optional.of(usuario));

        assertThrows(BusinessException.class, () ->
                reservaService.crearReserva("test@padel.com", request));
    }

    @Test
    void crearReserva_slotInvalido_lanzaExcepcion() {
        request.setHora(LocalTime.of(10, 45)); // No es múltiplo de 90min desde 09:00
        when(usuarioRepository.findByEmail("test@padel.com")).thenReturn(Optional.of(usuario));

        BusinessException ex = assertThrows(BusinessException.class, () ->
                reservaService.crearReserva("test@padel.com", request));
        assertTrue(ex.getMessage().contains("09:00, 10:30, 12:00"));
    }

    @Test
    void crearReserva_horaDespuesDe23_lanzaExcepcion() {
        request.setHora(LocalTime.of(23, 30));
        when(usuarioRepository.findByEmail("test@padel.com")).thenReturn(Optional.of(usuario));

        assertThrows(BusinessException.class, () ->
                reservaService.crearReserva("test@padel.com", request));
    }

    @Test
    void crearReserva_limite3ReservasActivas_lanzaExcepcion() {
        when(usuarioRepository.findByEmail("test@padel.com")).thenReturn(Optional.of(usuario));
        when(reservaRepository.countByUsuarioEmailAndEstadoIn(eq("test@padel.com"), anyList()))
                .thenReturn(3L);

        BusinessException ex = assertThrows(BusinessException.class, () ->
                reservaService.crearReserva("test@padel.com", request));
        assertTrue(ex.getMessage().contains("3 reservas activas"));
    }

    @Test
    void crearReserva_pistaOcupadaClase_lanzaExcepcion() {
        when(usuarioRepository.findByEmail("test@padel.com")).thenReturn(Optional.of(usuario));
        when(claseRepository.existsByPistaIdAndFechaAndHora(anyLong(), any(), any())).thenReturn(true);

        assertThrows(BusinessException.class, () ->
                reservaService.crearReserva("test@padel.com", request));
    }

    @Test
    void crearReserva_pistaOcupadaReservaActiva_lanzaExcepcion() {
        when(usuarioRepository.findByEmail("test@padel.com")).thenReturn(Optional.of(usuario));
        when(claseRepository.existsByPistaIdAndFechaAndHora(anyLong(), any(), any())).thenReturn(false);
        when(pistaRepository.findById(1L)).thenReturn(Optional.of(pista));
        when(reservaRepository.findByPistaIdAndFechaAndHoraAndEstadoIn(
                anyLong(), any(), any(), anyList())).thenReturn(List.of(new Reserva()));

        BusinessException ex = assertThrows(BusinessException.class, () ->
                reservaService.crearReserva("test@padel.com", request));
        assertTrue(ex.getMessage().contains("ya esta reservada"));
    }

    @Test
    void borrarReserva_exito() {
        Reserva reserva = new Reserva();
        reserva.setId(1L);
        reserva.setUsuario(usuario);
        reserva.setFecha(LocalDate.now().plusDays(2));
        reserva.setHora(LocalTime.of(10, 0));
        reserva.setEstado(EstadoReserva.CONFIRMADA);

        when(reservaRepository.findById(1L)).thenReturn(Optional.of(reserva));
        when(usuarioRepository.findByEmail("test@padel.com")).thenReturn(Optional.of(usuario));
        when(reservaRepository.save(any(Reserva.class))).thenAnswer(i -> i.getArgument(0));

        reservaService.borrarReserva(1L, "test@padel.com");

        assertEquals(EstadoReserva.CANCELADA, reserva.getEstado());
        verify(reservaRepository).save(reserva);
        verify(reservaRepository, never()).deleteById(any());
    }

    @Test
    void borrarReserva_yaCancelada_lanzaExcepcion() {
        Reserva reserva = new Reserva();
        reserva.setId(1L);
        reserva.setUsuario(usuario);
        reserva.setEstado(EstadoReserva.CANCELADA);

        when(reservaRepository.findById(1L)).thenReturn(Optional.of(reserva));
        when(usuarioRepository.findByEmail("test@padel.com")).thenReturn(Optional.of(usuario));

        assertThrows(BusinessException.class, () ->
                reservaService.borrarReserva(1L, "test@padel.com"));
    }

    @Test
    void borrarReserva_otroUsuarioSinAdmin_lanzaUnauthorized() {
        Usuario otro = new Usuario();
        otro.setId(2L);
        otro.setEmail("otro@padel.com");
        otro.setRol("USER");

        Reserva reserva = new Reserva();
        reserva.setId(1L);
        reserva.setUsuario(usuario); // dueño es test@padel.com
        reserva.setFecha(LocalDate.now().plusDays(2));
        reserva.setHora(LocalTime.of(10, 0));
        reserva.setEstado(EstadoReserva.CONFIRMADA);

        when(reservaRepository.findById(1L)).thenReturn(Optional.of(reserva));
        when(usuarioRepository.findByEmail("otro@padel.com")).thenReturn(Optional.of(otro));

        assertThrows(UnauthorizedException.class, () ->
                reservaService.borrarReserva(1L, "otro@padel.com"));
    }

    @Test
    void borrarReserva_menos24h_lanzaExcepcion() {
        Reserva reserva = new Reserva();
        reserva.setId(1L);
        reserva.setUsuario(usuario);
        reserva.setFecha(LocalDate.now());
        reserva.setHora(LocalTime.now().plusHours(2)); // menos de 24h
        reserva.setEstado(EstadoReserva.CONFIRMADA);

        when(reservaRepository.findById(1L)).thenReturn(Optional.of(reserva));
        when(usuarioRepository.findByEmail("test@padel.com")).thenReturn(Optional.of(usuario));

        assertThrows(BusinessException.class, () ->
                reservaService.borrarReserva(1L, "test@padel.com"));
    }

    @Test
    void borrarReserva_adminPuedeCancelarSinLimite24h() {
        usuario.setRol("ADMIN");
        Reserva reserva = new Reserva();
        reserva.setId(1L);
        reserva.setUsuario(usuario);
        reserva.setFecha(LocalDate.now());
        reserva.setHora(LocalTime.now().plusMinutes(30)); // menos de 24h
        reserva.setEstado(EstadoReserva.CONFIRMADA);

        when(reservaRepository.findById(1L)).thenReturn(Optional.of(reserva));
        when(usuarioRepository.findByEmail("admin@padel.com")).thenReturn(Optional.of(usuario));
        when(reservaRepository.save(any(Reserva.class))).thenAnswer(i -> i.getArgument(0));

        assertDoesNotThrow(() -> reservaService.borrarReserva(1L, "admin@padel.com"));
        assertEquals(EstadoReserva.CANCELADA, reserva.getEstado());
    }
}
