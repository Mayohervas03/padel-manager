package com.padel.api.service;

import com.padel.api.dto.ReservaManualRequest;
import com.padel.api.exception.BusinessException;
import com.padel.api.exception.ResourceNotFoundException;
import com.padel.api.model.EstadoReserva;
import com.padel.api.model.Pista;
import com.padel.api.model.Reserva;
import com.padel.api.model.Usuario;
import com.padel.api.repository.ClaseRepository;
import com.padel.api.repository.PistaRepository;
import com.padel.api.repository.ReservaRepository;
import com.padel.api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
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
        List<Reserva> reservas = reservaRepository.findByFechaAndEstadoNot(fecha, EstadoReserva.CANCELADA);
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
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reserva no encontrada"));
        reserva.setEstado(EstadoReserva.CANCELADA);
        reservaRepository.save(reserva);
    }

    @Transactional
    public Reserva crearReservaManual(ReservaManualRequest request) {
        LocalDate fecha = LocalDate.parse(request.getFecha());
        LocalTime hora = LocalTime.parse(request.getHora());

        validarSlotHorario(hora);

        boolean ocupadaPorClase = claseRepository.existsByPistaIdAndFechaAndHora(request.getPistaId(), fecha, hora);
        if (ocupadaPorClase) {
            throw new BusinessException("Pista ocupada por una clase. Debe anularse la clase previa desde la Agenda.");
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
        reserva.setPrecioPagado(pista.getPrecio());

        try {
            return reservaRepository.save(reserva);
        } catch (DataIntegrityViolationException e) {
            throw new BusinessException("Esa pista ya esta reservada a esa hora.");
        }
    }

    private void validarSlotHorario(LocalTime hora) {
        int minutos = hora.getHour() * 60 + hora.getMinute();
        int apertura = 9 * 60;
        int slot = 90;
        if ((minutos - apertura) % slot != 0) {
            throw new BusinessException("Los horarios disponibles son: 09:00, 10:30, 12:00, 13:30, 15:00, 16:30, 18:00, 19:30, 21:00.");
        }
    }
}
