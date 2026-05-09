package com.padel.api.service;

import com.padel.api.dto.DashboardDTO;
import com.padel.api.repository.PistaRepository;
import com.padel.api.repository.ReservaRepository;
import com.padel.api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UsuarioRepository usuarioRepository;
    private final PistaRepository pistaRepository;
    private final ReservaRepository reservaRepository;

    public DashboardDTO getDashboardStats() {
        long totalUsuarios = usuarioRepository.count();
        long totalPistas = pistaRepository.count();
        long pistasActivas = pistaRepository.countByActivoTrue();
        long reservasTotales = reservaRepository.count();
        long reservasHoy = reservaRepository.countByFecha(LocalDate.now());

        return new DashboardDTO(totalUsuarios, totalPistas, pistasActivas, reservasTotales, reservasHoy);
    }
}
