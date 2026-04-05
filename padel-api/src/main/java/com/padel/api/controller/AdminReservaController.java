package com.padel.api.controller;

import com.padel.api.model.Reserva;
import com.padel.api.repository.ReservaRepository;
import com.padel.api.dto.ReservaManualRequest;
import com.padel.api.model.Pista;
import com.padel.api.model.Usuario;
import com.padel.api.repository.PistaRepository;
import com.padel.api.repository.UsuarioRepository;
import com.padel.api.repository.ClaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.padel.api.model.Clase;

@RestController
@RequestMapping("/api/admin/reservas")
@CrossOrigin(origins = "http://localhost:4200")
@PreAuthorize("hasRole('ADMIN')")
public class AdminReservaController {

    @Autowired
    private ReservaRepository reservaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PistaRepository pistaRepository;

    @Autowired
    private ClaseRepository claseRepository;

    @GetMapping
    public List<Map<String, Object>> listarReservasPorFecha(@RequestParam("fecha") String fechaStr) {
        LocalDate fecha = LocalDate.parse(fechaStr);
        List<Reserva> reservas = reservaRepository.findByFecha(fecha);
        List<Clase> clases = claseRepository.findByFecha(fecha);
        
        List<Map<String, Object>> agenda = new ArrayList<>();
        
        for (Reserva r : reservas) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", r.getId());
            item.put("tipo", "RESERVA");
            
            Map<String, String> u = new HashMap<>();
            u.put("nombre", r.getUsuario() != null ? r.getUsuario().getNombre() : "Desconocido");
            u.put("email", r.getUsuario() != null ? r.getUsuario().getEmail() : "");
            item.put("usuario", u);
            
            Map<String, String> p = new HashMap<>();
            p.put("nombre", r.getPista() != null ? r.getPista().getNombre() : "Borrador");
            item.put("pista", p);
            
            item.put("hora", r.getHora().toString());
            agenda.add(item);
        }
        
        for (Clase c : clases) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", c.getId());
            item.put("tipo", "CLASE");
            
            Map<String, String> u = new HashMap<>();
            u.put("nombre", "CLASE: " + c.getTitulo() + " (" + c.getMonitor() + ")");
            u.put("email", "Nivel: " + c.getNivel().name() + " | Alumnos: " + c.getAlumnos().size() + "/" + c.getMaxAlumnos());
            item.put("usuario", u);
            
            Map<String, String> p = new HashMap<>();
            p.put("nombre", c.getPista() != null ? c.getPista().getNombre() : "Borrador");
            item.put("pista", p);
            
            item.put("hora", c.getHora().toString());
            agenda.add(item);
        }
        
        // Ordenar por hora
        agenda.sort((a, b) -> ((String)a.get("hora")).compareTo((String)b.get("hora")));
        
        return agenda;
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> borrarReservaAdmin(@PathVariable Long id) {
        if (!reservaRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        // El administrador no está sujeto a las reglas de cancelación de las 24h
        reservaRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/manual")
    public ResponseEntity<?> crearReservaManual(@RequestBody ReservaManualRequest request) {
        LocalDate fecha = LocalDate.parse(request.getFecha());
        LocalTime hora = LocalTime.parse(request.getHora());

        boolean ocupada = reservaRepository.existsByPistaIdAndFechaAndHora(request.getPistaId(), fecha, hora);
        boolean ocupadaPorClase = claseRepository.existsByPistaIdAndFechaAndHora(request.getPistaId(), fecha, hora);
        
        if (ocupada || ocupadaPorClase) {
            return ResponseEntity.badRequest().body("Error: Pista ocupada. Debe anularse la reserva o clase previa desde la Agenda.");
        }

        Usuario usuario = usuarioRepository.findById(request.getUsuarioId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        Pista pista = pistaRepository.findById(request.getPistaId())
                .orElseThrow(() -> new RuntimeException("Pista no encontrada"));

        Reserva reserva = new Reserva();
        reserva.setUsuario(usuario);
        reserva.setPista(pista);
        reserva.setFecha(fecha);
        reserva.setHora(hora);

        Reserva nuevaReserva = reservaRepository.save(reserva);
        return ResponseEntity.ok(nuevaReserva);
    }
}
