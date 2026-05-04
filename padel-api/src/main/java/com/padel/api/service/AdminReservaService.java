package com.padel.api.service;

import com.padel.api.dto.ReservaManualRequest;
import com.padel.api.exception.BusinessException;
import com.padel.api.exception.ResourceNotFoundException;
import com.padel.api.model.Pista;
import com.padel.api.model.Reserva;
import com.padel.api.model.Usuario;
import com.padel.api.repository.ClaseRepository;
import com.padel.api.repository.PistaRepository;
import com.padel.api.repository.ReservaRepository;
import com.padel.api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminReservaService {

    private final ReservaRepository reservaRepository;
    private final UsuarioRepository usuarioRepository;
    private final PistaRepository pistaRepository;
    private final ClaseRepository claseRepository;

    public List<Map<String, Object>> listarAgendaPorFecha(LocalDate fecha) {
        List<Reserva> reservas = reservaRepository.findByFecha(fecha);
        List<com.padel.api.model.Clase> clases = claseRepository.findByFecha(fecha);

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

        for (com.padel.api.model.Clase c : clases) {
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

        agenda.sort((a, b) -> ((String)a.get("hora")).compareTo((String)b.get("hora")));
        return agenda;
    }

    @Transactional
    public void borrarReservaAdmin(Long id) {
        if (!reservaRepository.existsById(id)) {
            throw new ResourceNotFoundException("Reserva no encontrada");
        }
        reservaRepository.deleteById(id);
    }

    @Transactional
    public Reserva crearReservaManual(ReservaManualRequest request) {
        LocalDate fecha = LocalDate.parse(request.getFecha());
        LocalTime hora = LocalTime.parse(request.getHora());

        boolean ocupada = reservaRepository.existsByPistaIdAndFechaAndHora(request.getPistaId(), fecha, hora);
        boolean ocupadaPorClase = claseRepository.existsByPistaIdAndFechaAndHora(request.getPistaId(), fecha, hora);

        if (ocupada || ocupadaPorClase) {
            throw new BusinessException("Pista ocupada. Debe anularse la reserva o clase previa desde la Agenda.");
        }

        Usuario usuario = usuarioRepository.findById(request.getUsuarioId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        Pista pista = pistaRepository.findById(request.getPistaId())
                .orElseThrow(() -> new ResourceNotFoundException("Pista no encontrada"));

        Reserva reserva = new Reserva();
        reserva.setUsuario(usuario);
        reserva.setPista(pista);
        reserva.setFecha(fecha);
        reserva.setHora(hora);

        return reservaRepository.save(reserva);
    }
}
