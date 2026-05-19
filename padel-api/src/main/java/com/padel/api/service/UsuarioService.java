package com.padel.api.service;

import com.padel.api.dto.PerfilDTO;
import com.padel.api.dto.UsuarioUpdateRequest;
import com.padel.api.exception.BusinessException;
import com.padel.api.exception.ResourceNotFoundException;
import com.padel.api.model.EstadoReserva;
import com.padel.api.model.Reserva;
import com.padel.api.model.Usuario;
import com.padel.api.repository.ReservaRepository;
import com.padel.api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final ReservaRepository reservaRepository;
    private final PasswordEncoder passwordEncoder;

    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    public Usuario buscarPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    }

    public Usuario buscarPorEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    }

    public List<Usuario> buscarPorNombreOEmail(String query) {
        if (query == null || query.trim().isEmpty()) {
            return List.of();
        }
        return usuarioRepository.buscarPorNombreOEmail(query.trim());
    }

    @Transactional
    public Usuario actualizarUsuario(Long id, UsuarioUpdateRequest request) {
        Usuario usuario = buscarPorId(id);
        usuario.setNombre(request.getNombre());
        usuario.setEmail(request.getEmail());
        if (request.getRol() != null) {
            usuario.setRol(request.getRol());
        }
        return usuarioRepository.save(usuario);
    }

    @Transactional
    public void borrarUsuario(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new ResourceNotFoundException("Usuario no encontrado");
        }
        usuarioRepository.deleteById(id);
    }

    public PerfilDTO getMiPerfil(String email) {
        Usuario usuario = buscarPorEmail(email);

        LocalDate today = LocalDate.now();
        YearMonth currentMonth = YearMonth.from(today);
        LocalDate startOfMonth = currentMonth.atDay(1);
        LocalDate endOfMonth = currentMonth.atEndOfMonth();

        long partidosMes = reservaRepository.countByUsuarioIdAndFechaBetween(usuario.getId(), startOfMonth, endOfMonth);

        List<Reserva> reservas = reservaRepository.findByUsuarioEmail(email);
        Optional<Reserva> proximaReservaOpt = reservas.stream()
                .filter(r -> r.getEstado() != EstadoReserva.CANCELADA)
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
                .orElse("Sin partidos proximos");

        PerfilDTO perfil = new PerfilDTO();
        perfil.setNombre(usuario.getNombre());
        perfil.setEmail(usuario.getEmail());
        perfil.setProximaReserva(proximaStr);
        perfil.setPartidosMes(partidosMes);

        return perfil;
    }

    @Transactional
    public void cambiarPassword(String email, String oldPassword, String newPassword) {
        Usuario usuario = buscarPorEmail(email);

        if (!passwordEncoder.matches(oldPassword, usuario.getPassword())) {
            throw new BusinessException("La contrasena actual es incorrecta");
        }

        usuario.setPassword(passwordEncoder.encode(newPassword));
        usuarioRepository.save(usuario);
    }
}
