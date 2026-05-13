package com.padel.api.service;

import com.padel.api.dto.ClaseRequest;
import com.padel.api.exception.BusinessException;
import com.padel.api.exception.ResourceNotFoundException;
import com.padel.api.model.Clase;
import com.padel.api.model.EstadoClase;
import com.padel.api.model.NivelClase;
import com.padel.api.model.Pista;
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
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ClaseServiceTest {

    @Mock
    private ClaseRepository claseRepository;
    @Mock
    private ReservaRepository reservaRepository;
    @Mock
    private PistaRepository pistaRepository;
    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private ClaseService claseService;

    private Usuario usuario;
    private Pista pista;
    private Clase clase;
    private ClaseRequest request;

    @BeforeEach
    void setUp() {
        usuario = new Usuario();
        usuario.setId(1L);
        usuario.setEmail("test@test.com");
        usuario.setNombre("Test User");

        pista = new Pista();
        pista.setId(1L);
        pista.setNombre("Pista 1");

        clase = new Clase();
        clase.setId(1L);
        clase.setTitulo("Masterclass Volea");
        clase.setMonitor("Juan");
        clase.setNivel(NivelClase.INTERMEDIO);
        clase.setPrecio(25.0);
        clase.setMaxAlumnos(4);
        clase.setFecha(LocalDate.now().plusDays(1));
        clase.setHora(LocalTime.of(10, 30));
        clase.setEstado(EstadoClase.PROGRAMADA);
        clase.setPista(pista);
        clase.setAlumnos(new ArrayList<>());

        request = new ClaseRequest();
        request.setTitulo("Masterclass Volea");
        request.setMonitor("Juan");
        request.setNivel("INTERMEDIO");
        request.setPrecio(25.0);
        request.setMaxAlumnos(4);
        request.setFecha(LocalDate.now().plusDays(1));
        request.setHora(LocalTime.of(10, 30));
        request.setPistaId(1L);
    }

    @Test
    void listarTodas_DebeExcluirCanceladas() {
        when(claseRepository.findByEstadoNotOrderByFechaDescHoraDesc(EstadoClase.CANCELADA))
            .thenReturn(List.of(clase));

        List<Clase> resultado = claseService.listarTodas();

        assertEquals(1, resultado.size());
        assertEquals(EstadoClase.PROGRAMADA, resultado.get(0).getEstado());
    }

    @Test
    void crearClase_DebeCrearClaseCorrectamente() {
        when(pistaRepository.findById(1L)).thenReturn(Optional.of(pista));
        when(claseRepository.save(any(Clase.class))).thenReturn(clase);

        Clase resultado = claseService.crearClase(request);

        assertNotNull(resultado);
        assertEquals("Masterclass Volea", resultado.getTitulo());
        assertEquals(EstadoClase.PROGRAMADA, resultado.getEstado());
    }

    @Test
    void crearClase_SlotInvalido_DebeLanzarExcepcion() {
        request.setHora(LocalTime.of(10, 0)); // No es slot válido

        assertThrows(BusinessException.class, () -> claseService.crearClase(request));
    }

    @Test
    void actualizarClase_ClaseCancelada_DebeLanzarExcepcion() {
        clase.setEstado(EstadoClase.CANCELADA);
        when(claseRepository.findById(1L)).thenReturn(Optional.of(clase));

        assertThrows(BusinessException.class, () -> claseService.actualizarClase(1L, request));
    }

    @Test
    void actualizarClase_ClasePasada_DebeLanzarExcepcion() {
        clase.setFecha(LocalDate.now().minusDays(1));
        when(claseRepository.findById(1L)).thenReturn(Optional.of(clase));

        assertThrows(BusinessException.class, () -> claseService.actualizarClase(1L, request));
    }

    @Test
    void eliminarClase_DebeSoftDelete() {
        when(claseRepository.findById(1L)).thenReturn(Optional.of(clase));
        when(claseRepository.save(any(Clase.class))).thenReturn(clase);

        claseService.eliminarClase(1L);

        assertEquals(EstadoClase.CANCELADA, clase.getEstado());
        verify(claseRepository).save(clase);
    }

    @Test
    void inscribirse_Clasellena_DebeLanzarExcepcion() {
        Usuario u1 = new Usuario(); u1.setId(10L);
        Usuario u2 = new Usuario(); u2.setId(11L);
        Usuario u3 = new Usuario(); u3.setId(12L);
        Usuario u4 = new Usuario(); u4.setId(13L);
        clase.setAlumnos(new ArrayList<>() {{ add(u1); add(u2); add(u3); add(u4); }});
        when(usuarioRepository.findByEmail("test@test.com")).thenReturn(Optional.of(usuario));
        when(claseRepository.findById(1L)).thenReturn(Optional.of(clase));

        assertThrows(BusinessException.class, () -> claseService.inscribirse(1L, "test@test.com"));
    }

    @Test
    void inscribirse_Limite3Clases_DebeLanzarExcepcion() {
        when(usuarioRepository.findByEmail("test@test.com")).thenReturn(Optional.of(usuario));
        when(claseRepository.findById(1L)).thenReturn(Optional.of(clase));
        when(claseRepository.countByAlumnosIdAndFechaGreaterThanEqualAndEstadoNot(
            eq(1L), any(LocalDate.class), eq(EstadoClase.CANCELADA))).thenReturn(3L);

        assertThrows(BusinessException.class, () -> claseService.inscribirse(1L, "test@test.com"));
    }

    @Test
    void cancelarInscripcion_DebeEliminarAlumno() {
        clase.getAlumnos().add(usuario);
        when(usuarioRepository.findByEmail("test@test.com")).thenReturn(Optional.of(usuario));
        when(claseRepository.findById(1L)).thenReturn(Optional.of(clase));
        when(claseRepository.save(any(Clase.class))).thenReturn(clase);

        claseService.cancelarInscripcion(1L, "test@test.com");

        assertTrue(clase.getAlumnos().isEmpty());
        verify(claseRepository).save(clase);
    }

    @Test
    void obtenerMisClases_DebeFiltrarActivas() {
        when(usuarioRepository.findByEmail("test@test.com")).thenReturn(Optional.of(usuario));
        when(claseRepository.findByAlumnosIdAndFechaGreaterThanEqualAndEstadoNot(
            eq(1L), any(LocalDate.class), eq(EstadoClase.CANCELADA))).thenReturn(List.of(clase));

        List<Clase> resultado = claseService.obtenerMisClases("test@test.com");

        assertEquals(1, resultado.size());
    }
}
